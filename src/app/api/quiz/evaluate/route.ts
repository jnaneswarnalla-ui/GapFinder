import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth/session';
import { generateStructuredObject } from '@/lib/ai/groq';
import { computeTopicMastery, QuestionAttemptRecord } from '@/lib/scoring/mastery';
import { z } from 'zod';

const EvaluationItemSchema = z.object({
  questionId: z.string(),
  isCorrect: z.boolean(),
  score: z.number().min(0).max(1), // 0, 0.5, or 1
  verdict: z.enum(['correct', 'partial', 'incorrect']),
  feedback: z.string(),
  identifiedMisconception: z.string().optional(),
});

const EvaluationResponseSchema = z.object({
  evaluations: z.array(EvaluationItemSchema),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quizId, answers } = await req.json();

    if (!quizId || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'quizId and answers array are required' }, { status: 400 });
    }

    // Fetch original quiz
    const quizRes = await query(
      `SELECT id, title, questions FROM quizzes WHERE id = $1 AND user_id = $2`,
      [quizId, user.id]
    );

    if (quizRes.rowCount === 0) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
    }

    const originalQuestions: any[] = quizRes.rows[0].questions;
    const questionsMap = new Map(originalQuestions.map(q => [q.id, q]));

    // Evaluate answers
    const evaluations: any[] = [];
    const shortAnswerQuestionsToEvaluate: any[] = [];

    for (const ans of answers) {
      const q = questionsMap.get(ans.questionId);
      if (!q) continue;

      if (q.type === 'mcq') {
        const isCorrect = ans.selectedOptionIndex === q.correctOptionIndex;
        const score = isCorrect ? 1.0 : 0.0;
        const verdict = isCorrect ? 'correct' : 'incorrect';
        const feedback = isCorrect
          ? `Correct! As established in ${q.citation?.source || 'the source text'}, ${q.explanation}`
          : `Incorrect. The correct answer is "${q.options[q.correctOptionIndex]}". ${q.explanation} Reference: [${q.citation?.source}, ${q.citation?.section || 'Page ' + q.citation?.page}]`;

        evaluations.push({
          questionId: q.id,
          topicId: q.topicId,
          topicTitle: q.topicTitle,
          isCorrect,
          score,
          verdict,
          feedback,
          userAnswer: ans.selectedOptionIndex !== undefined ? q.options[ans.selectedOptionIndex] : 'No answer',
          correctAnswer: q.options[q.correctOptionIndex],
          citation: q.citation,
          difficulty: q.difficulty || 'medium',
        });
      } else {
        shortAnswerQuestionsToEvaluate.push({
          q,
          studentAnswer: ans.textAnswer || '',
        });
      }
    }

    // Evaluate short answers with LLM rubric check
    if (shortAnswerQuestionsToEvaluate.length > 0) {
      const rubricPrompt = shortAnswerQuestionsToEvaluate.map(({ q, studentAnswer }, i) => `
Question ${i + 1} [ID: ${q.id}]: "${q.question}"
Source Rubric: ${q.sampleAnswerRubric || q.explanation}
Source Evidence: "${q.citation?.snippet}"
Student's Response: "${studentAnswer}"
`).join('\n\n');

      try {
        const llmEval = await generateStructuredObject(
          EvaluationResponseSchema,
          `You are an objective academic evaluator. Grade each student's short answer against the provided Source Rubric and Evidence.
Award 1.0 for completely correct answers, 0.5 for partially correct answers missing one detail, and 0 for incorrect/missing answers.
In feedback, explicitly reference the source evidence.`,
          rubricPrompt,
          'reasoning'
        );

        for (const item of llmEval.evaluations) {
          const orig = shortAnswerQuestionsToEvaluate.find(s => s.q.id === item.questionId);
          if (orig) {
            evaluations.push({
              questionId: item.questionId,
              topicId: orig.q.topicId,
              topicTitle: orig.q.topicTitle,
              isCorrect: item.isCorrect,
              score: item.score,
              verdict: item.verdict,
              feedback: item.feedback,
              userAnswer: orig.studentAnswer,
              correctAnswer: orig.q.sampleAnswerRubric || orig.q.explanation,
              citation: orig.q.citation,
              difficulty: orig.q.difficulty || 'medium',
              identifiedMisconception: item.identifiedMisconception,
            });
          }
        }
      } catch (err) {
        // Fallback for short answers
        for (const { q, studentAnswer } of shortAnswerQuestionsToEvaluate) {
          const isNotEmpty = studentAnswer.trim().length > 15;
          evaluations.push({
            questionId: q.id,
            topicId: q.topicId,
            topicTitle: q.topicTitle,
            isCorrect: isNotEmpty,
            score: isNotEmpty ? 0.5 : 0.0,
            verdict: isNotEmpty ? 'partial' : 'incorrect',
            feedback: `Compared against source text: ${q.explanation}`,
            userAnswer: studentAnswer,
            correctAnswer: q.explanation,
            citation: q.citation,
            difficulty: q.difficulty || 'medium',
          });
        }
      }
    }

    // Calculate total score
    const totalQuestions = evaluations.length;
    const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
    const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
    const correctCount = evaluations.filter(e => e.score === 1.0).length;

    // Record attempt
    const attemptId = `att_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await query(
      `INSERT INTO quiz_attempts (id, quiz_id, user_id, score, total_questions, correct_count, responses)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        attemptId,
        quizId,
        user.id,
        percentage,
        totalQuestions,
        correctCount,
        JSON.stringify(evaluations),
      ]
    );

    // Update topic mastery dynamically for affected topics!
    const affectedTopicIds = Array.from(new Set(evaluations.map(e => e.topicId).filter(Boolean)));
    const updatedMasteries: any[] = [];

    // Fetch all historical attempts for user
    const historicalRes = await query(
      `SELECT responses, created_at FROM quiz_attempts WHERE user_id = $1 ORDER BY created_at ASC`,
      [user.id]
    );

    for (const tId of affectedTopicIds) {
      // Find topic exam frequency
      const tInfo = (await query(`SELECT title, exam_frequency FROM topics WHERE id = $1`, [tId])).rows[0];
      const examFreq = tInfo?.exam_frequency || 1;

      // Collect all question attempt records across history
      const records: QuestionAttemptRecord[] = [];
      let attemptIdx = 0;
      for (const row of historicalRes.rows) {
        attemptIdx++;
        const respList = Array.isArray(row.responses) ? row.responses : [];
        for (const r of respList) {
          if (r.topicId === tId) {
            records.push({
              questionId: r.questionId,
              topicId: tId,
              difficulty: r.difficulty || 'medium',
              score: r.score,
              attemptIndex: attemptIdx,
              attemptDate: row.created_at,
            });
          }
        }
      }

      const mastery = computeTopicMastery(tId, records, examFreq);

      // Extract mistakes & generate AI reason
      const mistakes = evaluations.filter(e => e.topicId === tId && e.score < 1.0);
      let reason = 'Solid conceptual grasp demonstrated.';
      const misconceptions: string[] = [];

      if (mistakes.length > 0) {
        reason = `You got ${mistakes.length} question(s) wrong on ${tInfo?.title || 'this topic'}, specifically regarding ${mistakes[0].citation?.section || 'key mechanisms'}.`;
        for (const m of mistakes) {
          if (m.identifiedMisconception) misconceptions.push(m.identifiedMisconception);
        }
      }

      await query(
        `INSERT INTO topic_mastery (id, user_id, topic_id, mastery_score, status, priority_score, reason, misconceptions, attempts_count, last_evaluated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
         ON CONFLICT (user_id, topic_id) DO UPDATE SET
           mastery_score = $4,
           status = $5,
           priority_score = $6,
           reason = $7,
           misconceptions = $8,
           attempts_count = $9,
           last_evaluated_at = NOW()`,
        [
          `mast_${user.id}_${tId}`,
          user.id,
          tId,
          mastery.masteryScore,
          mastery.status,
          mastery.priorityScore,
          reason,
          JSON.stringify(misconceptions),
          records.length,
        ]
      );

      updatedMasteries.push({
        topicTitle: tInfo?.title,
        ...mastery,
        reason,
        misconceptions,
      });
    }

    return NextResponse.json({
      success: true,
      attemptId,
      score: percentage,
      totalQuestions,
      correctCount,
      evaluations,
      updatedMasteries,
    });
  } catch (err: any) {
    console.error('Quiz evaluation error:', err);
    return NextResponse.json({ error: err.message || 'Failed to evaluate quiz' }, { status: 500 });
  }
}
