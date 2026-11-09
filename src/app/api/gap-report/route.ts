import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status'); // 'weak' | 'medium' | 'strong'
    const unitFilter = searchParams.get('unit');

    let sql = `
      SELECT 
        t.id as topic_id,
        t.title as topic_title,
        t.unit_name,
        t.description,
        t.exam_frequency,
        COALESCE(tm.mastery_score, 0) as mastery_score,
        COALESCE(tm.status, 'weak') as status,
        COALESCE(tm.priority_score, (100 * (t.exam_frequency + 1))) as priority_score,
        COALESCE(tm.reason, 'No diagnostic assessments completed yet.') as reason,
        COALESCE(tm.misconceptions, '[]'::jsonb) as misconceptions,
        COALESCE(tm.attempts_count, 0) as attempts_count,
        tm.last_evaluated_at,
        (
          SELECT count(*) 
          FROM past_paper_questions ppq 
          WHERE ppq.linked_topic_id = t.id
        ) as past_questions_count
      FROM topics t
      LEFT JOIN topic_mastery tm ON tm.topic_id = t.id AND tm.user_id = t.user_id
      WHERE t.user_id = $1
    `;

    const params: any[] = [user.id];
    let pIdx = 2;

    if (statusFilter && ['weak', 'medium', 'strong'].includes(statusFilter)) {
      sql += ` AND tm.status = $${pIdx}`;
      params.push(statusFilter);
      pIdx++;
    }

    if (unitFilter) {
      sql += ` AND t.unit_name = $${pIdx}`;
      params.push(unitFilter);
      pIdx++;
    }

    sql += ` ORDER BY priority_score DESC, t.order_index ASC`;

    const res = await query(sql, params);
    const topics = res.rows;

    // Overall summary metrics
    const totalTopics = topics.length;
    const weakTopics = topics.filter(t => t.status === 'weak');
    const mediumTopics = topics.filter(t => t.status === 'medium');
    const strongTopics = topics.filter(t => t.status === 'strong');

    const averageMastery = totalTopics > 0
      ? Math.round(topics.reduce((acc, t) => acc + parseFloat(t.mastery_score || 0), 0) / totalTopics)
      : 0;

    // Fetch units list for filter dropdown
    const unitsRes = await query(
      `SELECT DISTINCT unit_name FROM topics WHERE user_id = $1 ORDER BY unit_name`,
      [user.id]
    );

    return NextResponse.json({
      summary: {
        totalTopics,
        weakCount: weakTopics.length,
        mediumCount: mediumTopics.length,
        strongCount: strongTopics.length,
        averageMastery,
      },
      topics,
      units: unitsRes.rows.map(r => r.unit_name),
    });
  } catch (err: any) {
    console.error('Gap report error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
