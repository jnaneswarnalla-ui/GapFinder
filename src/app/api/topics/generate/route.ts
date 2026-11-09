import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import { generateStructuredObject } from '@/lib/ai/groq';
import { z } from 'zod';

const TopicTreeSchema = z.object({
  units: z.array(
    z.object({
      unitName: z.string(),
      topics: z.array(
        z.object({
          title: z.string(),
          description: z.string(),
          subtopics: z.array(z.string()).optional(),
        })
      ),
    })
  ),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find syllabus material
    const syllabusRes = await query(
      `SELECT raw_text FROM materials WHERE user_id = $1 AND file_type = 'syllabus' ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    );

    if (syllabusRes.rowCount === 0) {
      return NextResponse.json({ error: 'No syllabus found. Please upload a syllabus document first.' }, { status: 400 });
    }

    const syllabusText = syllabusRes.rows[0].raw_text;

    // Call LLM to parse syllabus into tree
    const parsedTree = await generateStructuredObject(
      TopicTreeSchema,
      `You are an expert curriculum parser. Analyze the provided syllabus text and extract a clean, hierarchical table of contents consisting of Units and Topics.`,
      `Syllabus Content:\n\n${syllabusText.slice(0, 15000)}`
    );

    // Get past papers to link questions and compute exam frequency
    const ppRes = await query(
      `SELECT id, question_text, year, marks FROM past_paper_questions WHERE user_id = $1`,
      [user.id]
    );

    const pastQuestions = ppRes.rows;

    // Clear old topics
    await query('DELETE FROM topics WHERE user_id = $1', [user.id]);

    let order = 0;
    const insertedTopics: any[] = [];

    for (const unit of parsedTree.units) {
      for (const t of unit.topics) {
        order++;
        const topicId = `top_${Date.now()}_${order}_${Math.random().toString(36).substring(2, 6)}`;

        // Count matching past questions
        let examFreq = 1;
        const matchingIds: string[] = [];
        for (const pq of pastQuestions) {
          const qLower = pq.question_text.toLowerCase();
          const tWords = t.title.toLowerCase().split(/\s+/).filter(w => w.length > 3);
          const matches = tWords.some(w => qLower.includes(w));
          if (matches) {
            examFreq++;
            matchingIds.push(pq.id);
          }
        }

        await query(
          `INSERT INTO topics (id, user_id, unit_name, title, description, exam_frequency, order_index)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [topicId, user.id, unit.unitName, t.title, t.description, examFreq, order]
        );

        // Link matched questions
        for (const qid of matchingIds) {
          await query(
            `UPDATE past_paper_questions SET linked_topic_id = $1 WHERE id = $2 AND user_id = $3`,
            [topicId, qid, user.id]
          );
        }

        insertedTopics.push({
          id: topicId,
          unitName: unit.unitName,
          title: t.title,
          description: t.description,
          examFrequency: examFreq,
          orderIndex: order,
        });
      }
    }

    return NextResponse.json({
      success: true,
      topicsCount: insertedTopics.length,
      topics: insertedTopics,
    });
  } catch (err: any) {
    console.error('Topic generation error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
