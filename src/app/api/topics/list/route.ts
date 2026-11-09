import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const topicsRes = await query(
      `SELECT 
        t.id,
        t.unit_name,
        t.title,
        t.description,
        t.parent_topic_id,
        t.exam_frequency,
        t.order_index,
        COALESCE(tm.mastery_score, 0) as mastery_score,
        COALESCE(tm.status, 'weak') as status,
        COALESCE(tm.priority_score, (100 * (t.exam_frequency + 1))) as priority_score,
        COALESCE(tm.reason, '') as reason,
        COALESCE(tm.misconceptions, '[]'::jsonb) as misconceptions,
        (
          SELECT json_agg(json_build_object(
            'id', ppq.id,
            'questionText', ppq.question_text,
            'year', ppq.year,
            'marks', ppq.marks
          ))
          FROM past_paper_questions ppq
          WHERE ppq.linked_topic_id = t.id
        ) as linked_questions
       FROM topics t
       LEFT JOIN topic_mastery tm ON tm.topic_id = t.id AND tm.user_id = t.user_id
       WHERE t.user_id = $1
       ORDER BY t.order_index ASC`,
      [user.id]
    );

    return NextResponse.json({
      topics: topicsRes.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
