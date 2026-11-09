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
      `SELECT id, days_available, hours_per_day, exam_date, schedule, is_active, updated_at
       FROM revision_plans
       WHERE user_id = $1 AND is_active = TRUE
       ORDER BY updated_at DESC LIMIT 1`,
      [user.id]
    );

    if (res.rowCount === 0) {
      return NextResponse.json({ plan: null });
    }

    const planRow = res.rows[0];
    return NextResponse.json({
      plan: {
        id: planRow.id,
        daysAvailable: planRow.days_available,
        hoursPerDay: parseFloat(planRow.hours_per_day),
        examDate: planRow.exam_date,
        schedule: planRow.schedule,
        updatedAt: planRow.updated_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
