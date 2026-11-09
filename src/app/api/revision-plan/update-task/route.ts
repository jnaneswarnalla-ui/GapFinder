import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, taskId, completed } = await req.json();

    const planRes = await query(
      `SELECT id, schedule FROM revision_plans WHERE id = $1 AND user_id = $2`,
      [planId, user.id]
    );

    if (planRes.rowCount === 0) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const schedule = planRes.rows[0].schedule;
    let found = false;

    for (const day of schedule.days) {
      for (const task of day.tasks) {
        if (task.id === taskId) {
          task.completed = !!completed;
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) {
      return NextResponse.json({ error: 'Task not found in plan' }, { status: 404 });
    }

    await query(
      `UPDATE revision_plans SET schedule = $1, updated_at = NOW() WHERE id = $2`,
      [JSON.stringify(schedule), planId]
    );

    return NextResponse.json({ success: true, taskId, completed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
