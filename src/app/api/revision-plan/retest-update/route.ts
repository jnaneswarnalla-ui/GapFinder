import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import {
  generateDeterministicSchedule,
  calculatePlanDiff,
  TopicForSchedule,
} from '@/lib/scoring/scheduler';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch existing active plan
    const planRes = await query(
      `SELECT id, days_available, hours_per_day, exam_date, schedule
       FROM revision_plans
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );

    if (planRes.rowCount === 0) {
      return NextResponse.json({ error: 'No active plan found to update' }, { status: 404 });
    }

    const currentPlan = planRes.rows[0];
    const oldTopicsSnapshot = currentPlan.schedule?.priorityRankedTopics || [];

    // Fetch current topic mastery
    const topicsRes = await query(
      `SELECT 
        t.id,
        t.title,
        t.unit_name,
        t.exam_frequency,
        COALESCE(tm.mastery_score, 0) as mastery_score,
        COALESCE(tm.status, 'weak') as status,
        COALESCE(tm.priority_score, (100 * (t.exam_frequency + 1))) as priority_score
       FROM topics t
       LEFT JOIN topic_mastery tm ON tm.topic_id = t.id AND tm.user_id = t.user_id
       WHERE t.user_id = $1
       ORDER BY priority_score DESC`,
      [user.id]
    );

    const newTopics: TopicForSchedule[] = topicsRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      unitName: r.unit_name,
      masteryScore: parseFloat(r.mastery_score),
      priorityScore: parseFloat(r.priority_score),
      status: r.status,
      examFrequency: r.exam_frequency,
      citationHints: [`Chapter: ${r.unit_name}`],
    }));

    // Generate new schedule
    const newSchedule = generateDeterministicSchedule(
      newTopics,
      currentPlan.days_available,
      parseFloat(currentPlan.hours_per_day)
    );

    // Calculate diffs between old and new state
    const oldFormatted = oldTopicsSnapshot.map((t: any) => ({
      id: t.topicId,
      title: t.title,
      masteryScore: 0, // Fallback if not tracked in snapshot
      status: 'weak',
    }));

    const newFormatted = newTopics.map(t => ({
      id: t.id,
      title: t.title,
      masteryScore: t.masteryScore,
      status: t.status,
    }));

    const diffs = calculatePlanDiff(oldFormatted, newFormatted);

    // Update plan in DB
    await query(
      `UPDATE revision_plans 
       SET schedule = $1, updated_at = NOW()
       WHERE id = $2 AND user_id = $3`,
      [JSON.stringify(newSchedule), currentPlan.id, user.id]
    );

    return NextResponse.json({
      success: true,
      message: 'Revision plan dynamically re-prioritized based on latest diagnostic test results.',
      diffs,
      newSchedule,
    });
  } catch (err: any) {
    console.error('Retest update error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
