import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, topicId, title, description, targetMergeTopicId } = await req.json();

    if (action === 'edit') {
      if (!topicId || !title) {
        return NextResponse.json({ error: 'topicId and title are required' }, { status: 400 });
      }

      await query(
        `UPDATE topics SET title = $1, description = $2 WHERE id = $3 AND user_id = $4`,
        [title.trim(), description || '', topicId, user.id]
      );

      return NextResponse.json({ success: true, message: 'Topic updated' });
    }

    if (action === 'merge') {
      if (!topicId || !targetMergeTopicId) {
        return NextResponse.json({ error: 'topicId and targetMergeTopicId are required' }, { status: 400 });
      }

      // Re-link questions from topicId to targetMergeTopicId
      await query(
        `UPDATE past_paper_questions SET linked_topic_id = $1 WHERE linked_topic_id = $2 AND user_id = $3`,
        [targetMergeTopicId, topicId, user.id]
      );

      // Boost target exam frequency
      await query(
        `UPDATE topics SET exam_frequency = exam_frequency + 1 WHERE id = $1 AND user_id = $2`,
        [targetMergeTopicId, user.id]
      );

      // Delete original topic
      await query(`DELETE FROM topics WHERE id = $1 AND user_id = $2`, [topicId, user.id]);

      return NextResponse.json({ success: true, message: 'Topics merged successfully' });
    }

    return NextResponse.json({ error: 'Invalid action. Supported actions: edit, merge' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
