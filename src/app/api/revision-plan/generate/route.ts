import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import { generateDeterministicSchedule, TopicForSchedule } from '@/lib/scoring/scheduler';
import { generateStructuredObject } from '@/lib/ai/groq';
import { z } from 'zod';

const TaskRefinementSchema = z.object({
  refinedTasks: z.array(
    z.object({
      taskId: z.string(),
      concreteReadingGoal: z.string(),
      practiceTargetQuestionTypes: z.string(),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { daysAvailable = 5, hoursPerDay = 2, examDate } = await req.json();

    // Fetch user's topics and current mastery
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

    if (topicsRes.rowCount === 0) {
      return NextResponse.json({ error: 'No topics found. Please generate topic map or load demo data first.' }, { status: 400 });
    }

    const topics: TopicForSchedule[] = topicsRes.rows.map(r => ({
      id: r.id,
      title: r.title,
      unitName: r.unit_name,
      masteryScore: parseFloat(r.mastery_score),
      priorityScore: parseFloat(r.priority_score),
      status: r.status,
      examFrequency: r.exam_frequency,
      citationHints: [`Chapter: ${r.unit_name}`],
    }));

    // 1. Run deterministic Knapsack / Time-Binning scheduler
    const schedule = generateDeterministicSchedule(topics, daysAvailable, hoursPerDay);

    // 2. Refine tasks with LLM for specific, actionable study directives
    const flatTasks = schedule.days.flatMap(d => d.tasks);
    if (flatTasks.length > 0) {
      try {
        const taskBriefs = flatTasks.slice(0, 15).map(t => ({
          taskId: t.id,
          topic: t.topicTitle,
          unit: t.unitName,
          minutes: t.allocatedMinutes,
          taskType: t.taskType,
        }));

        const refined = await generateStructuredObject(
          TaskRefinementSchema,
          `You are an expert academic tutor. For each scheduled study task, specify:
1. concreteReadingGoal: exactly which concept or section to read, focusing on high-yield exam points.
2. practiceTargetQuestionTypes: what specific problems to practice (e.g. "Solve 3 redox balancing problems and 1 board question on corrosion").`,
          `Study Tasks to refine:\n${JSON.stringify(taskBriefs, null, 2)}`,
          'fast'
        );

        const refinedMap = new Map(refined.refinedTasks.map(r => [r.taskId, r]));
        for (const day of schedule.days) {
          for (const task of day.tasks) {
            const ref = refinedMap.get(task.id);
            if (ref) {
              task.description = `${ref.concreteReadingGoal} (${ref.practiceTargetQuestionTypes})`;
            }
          }
        }
      } catch (err) {
        console.warn('[Revision Plan LLM refinement fallback to deterministic descriptions]');
      }
    }

    const planId = `plan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Deactivate previous plans
    await query(`UPDATE revision_plans SET is_active = FALSE WHERE user_id = $1`, [user.id]);

    // Insert new plan
    await query(
      `INSERT INTO revision_plans (id, user_id, days_available, hours_per_day, exam_date, schedule, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [
        planId,
        user.id,
        daysAvailable,
        hoursPerDay,
        examDate || null,
        JSON.stringify(schedule),
      ]
    );

    return NextResponse.json({
      success: true,
      planId,
      schedule,
    });
  } catch (err: any) {
    console.error('Revision plan generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
