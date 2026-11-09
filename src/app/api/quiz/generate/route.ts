import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import { hybridRetrieve } from '@/lib/rag/retriever';
import { generateStructuredObject } from '@/lib/ai/groq';
import { validateCitations, buildGroundingPromptContext } from '@/lib/ai/grounding';
import { z } from 'zod';

const QuestionItemSchema = z.object({
  id: z.string(),
  type: z.enum(['mcq', 'short_answer']),
  question: z.string(),
  options: z.array(z.string()).optional(),
  correctOptionIndex: z.number().optional(),
  sampleAnswerRubric: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  citedChunkId: z.string(),
  citationSnippet: z.string(),
  explanation: z.string(),
});

const QuizOutputSchema = z.object({
  questions: z.array(QuestionItemSchema),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { topicId, questionCount = 5 } = await req.json().catch(() => ({}));

    // Fetch user topics
    let topicsQuery = `SELECT id, title, unit_name, exam_frequency FROM topics WHERE user_id = $1`;
    const params: any[] = [user.id];
    if (topicId) {
      topicsQuery += ` AND id = $2`;
      params.push(topicId);
    } else {
      topicsQuery += ` ORDER BY exam_frequency DESC LIMIT 6`;
    }

    const topicRows = (await query(topicsQuery, params)).rows;
    if (topicRows.length === 0) {
      return NextResponse.json({ error: 'No topics found to generate quiz from. Please load sample data or generate a topic map first.' }, { status: 400 });
    }

    // Retrieve chunks relevant to these topics
    const combinedChunks: any[] = [];
    for (const t of topicRows) {
      const chunks = await hybridRetrieve({
        userId: user.id,
        queryText: `${t.unit_name} ${t.title}`,
        topK: 3,
      });
      combinedChunks.push(...chunks);
    }

    // Deduplicate chunks by ID
    const uniqueChunksMap = new Map();
    for (const c of combinedChunks) {
      if (!uniqueChunksMap.has(c.id)) {
        uniqueChunksMap.set(c.id, c);
      }
    }
    const retrievedChunks = Array.from(uniqueChunksMap.values());

    if (retrievedChunks.length === 0) {
      return NextResponse.json({
        error: 'No content chunks found in your uploaded materials to ground the quiz. Please upload notes or chapters first.',
      }, { status: 400 });
    }

    const contextText = buildGroundingPromptContext(retrievedChunks);

    const systemPrompt = `You are a rigorous diagnostic exam author.
Create diagnostic questions (mostly multiple-choice questions plus 1-2 short answers) STRICTLY grounded in the provided context chunks.

GUARDRAILS:
1. Every question must be fully supported by the provided chunks. Do NOT use outside knowledge.
2. In 'citedChunkId', you MUST cite the exact chunk ID from the context (e.g. "mat_ch2_usr_chunk_1").
3. In 'citationSnippet', include the exact 1-2 sentences from that chunk providing the proof.
4. For MCQs, provide 4 distinct plausible options with 'correctOptionIndex' (0 to 3).
5. For short answers, provide 'sampleAnswerRubric' outlining the key points required.
6. Set difficulty to 'easy', 'medium', or 'hard'.`;

    const userPrompt = `Target Topics: ${topicRows.map(t => t.title).join(', ')}
Total questions requested: ${questionCount}

CONTEXT CHUNKS:
${contextText.slice(0, 20000)}

Generate the quiz questions now.`;

    const generated = await generateStructuredObject(
      QuizOutputSchema,
      systemPrompt,
      userPrompt,
      'reasoning',
      2
    );

    // Grounding check: filter out any question citing a chunk ID that was not retrieved
    const groundedQuestions: any[] = [];
    for (const q of generated.questions) {
      const validation = validateCitations([q.citedChunkId], retrievedChunks);
      if (validation.isGrounded) {
        const chunk = retrievedChunks.find(c => c.id === q.citedChunkId);
        // Find matching topic
        const matchedTopic = topicRows.find(t =>
          q.question.toLowerCase().includes(t.title.toLowerCase()) ||
          q.explanation.toLowerCase().includes(t.title.toLowerCase())
        ) || topicRows[0];

        groundedQuestions.push({
          ...q,
          topicId: matchedTopic?.id || topicRows[0].id,
          topicTitle: matchedTopic?.title || topicRows[0].title,
          citation: {
            chunkId: q.citedChunkId,
            source: chunk?.materialTitle || 'Course Material',
            chapter: chunk?.chapter,
            section: chunk?.section,
            page: chunk?.pageNumber || 1,
            snippet: q.citationSnippet || chunk?.content.slice(0, 200),
          },
        });
      } else {
        console.warn(`[Grounding check dropped hallucinated question]:`, q.question, validation.reason);
      }
    }

    if (groundedQuestions.length === 0) {
      return NextResponse.json({
        error: 'Generated questions could not be verified against the source text. Please try again.',
      }, { status: 500 });
    }

    const quizId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const quizTitle = topicId ? `Diagnostic Quiz: ${topicRows[0].title}` : `Comprehensive Diagnostic Quiz (${groundedQuestions.length} Questions)`;

    await query(
      `INSERT INTO quizzes (id, user_id, title, topic_ids, questions)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        quizId,
        user.id,
        quizTitle,
        JSON.stringify(topicRows.map(t => t.id)),
        JSON.stringify(groundedQuestions),
      ]
    );

    return NextResponse.json({
      success: true,
      quizId,
      title: quizTitle,
      questions: groundedQuestions,
      groundedCount: groundedQuestions.length,
    });
  } catch (err: any) {
    console.error('Quiz generation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to generate quiz' }, { status: 500 });
  }
}
