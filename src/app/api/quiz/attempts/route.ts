import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const res = await query(
      `SELECT 
        qa.id,
        qa.quiz_id,
        q.title as quiz_title,
        qa.score,
        qa.total_questions,
        qa.correct_count,
        qa.responses,
        qa.created_at
       FROM quiz_attempts qa
       LEFT JOIN quizzes q ON q.id = qa.quiz_id
       WHERE qa.user_id = $1
       ORDER BY qa.created_at DESC`,
      [user.id]
    );

    return NextResponse.json({
      attempts: res.rows,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
