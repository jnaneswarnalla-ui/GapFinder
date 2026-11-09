'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import { CitationDrawer, CitationInfo } from '@/components/CitationDrawer';
import {
  HelpCircle,
  Sparkles,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Loader2,
  FileText,
  ChevronRight,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function QuizPage() {
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [quizData, setQuizData] = useState<any | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);

  // Citation drawer state
  const [activeCitation, setActiveCitation] = useState<CitationInfo | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const startQuiz = async (topicId?: string) => {
    try {
      setLoading(true);
      setEvaluationResult(null);
      setUserAnswers({});

      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, questionCount: 5 }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to generate quiz questions');
      } else {
        setQuizData(data);
      }
    } catch (err: any) {
      alert(err.message || 'Error generating quiz');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if there are existing active quizzes, else auto-prompt
    startQuiz();
  }, []);

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: { selectedOptionIndex: optionIndex },
    }));
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: { textAnswer: text },
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quizData) return;
    try {
      setEvaluating(true);

      const answersArray = quizData.questions.map((q: any) => ({
        questionId: q.id,
        selectedOptionIndex: userAnswers[q.id]?.selectedOptionIndex,
        textAnswer: userAnswers[q.id]?.textAnswer,
      }));

      const res = await fetch('/api/quiz/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quizId: quizData.quizId,
          answers: answersArray,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Evaluation failed');
      } else {
        setEvaluationResult(data);
        if (data.score >= 70) {
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {}
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error evaluating answers');
    } finally {
      setEvaluating(false);
    }
  };

  const openCitationPreview = (citation: any) => {
    setActiveCitation(citation);
    setDrawerOpen(true);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Grounded Knowledge Verification</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Diagnostic Assessment
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Exam-weighted questions generated exclusively from your source materials. Every question is verified with a source citation preview.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startQuiz()}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Generate New Test</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
            <div className="space-y-1">
              <div className="font-bold text-base text-slate-900 dark:text-white">
                Generating Grounded Diagnostic Assessment...
              </div>
              <p className="text-xs text-slate-400">
                Retrieving chunks via hybrid vector search &bull; Performing zero-hallucination grounding checks &bull; Building citations
              </p>
            </div>
          </div>
        ) : !quizData ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">No active quiz found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Click &ldquo;Generate New Test&rdquo; or load sample data to generate diagnostic questions.
            </p>
            <button
              onClick={() => startQuiz()}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs"
            >
              Generate Test Now
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Evaluation Summary Banner (Shown after submit) */}
            {evaluationResult && (
              <div className="p-7 rounded-3xl bg-gradient-to-br from-slate-900 to-indigo-950 text-white shadow-xl space-y-4 border border-indigo-900/50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                      {evaluationResult.score}%
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Diagnostic Evaluation Complete</h2>
                      <p className="text-xs text-slate-300">
                        {evaluationResult.correctCount} of {evaluationResult.totalQuestions} questions correct. Your mastery scores and revision schedule have been recalculated.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/gap-report"
                      className="px-4 py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-xs hover:bg-rose-700 shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <span>View Updated Gap Report</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <Link
                      href="/revision-plan"
                      className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-xs hover:bg-slate-100 shadow-md flex items-center gap-1.5 transition-colors"
                    >
                      <span>Open Revision Plan</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="space-y-6">
              {quizData.questions.map((q: any, index: number) => {
                const evalItem = evaluationResult?.evaluations?.find((e: any) => e.questionId === q.id);
                const isAnswered = userAnswers[q.id]?.selectedOptionIndex !== undefined || !!userAnswers[q.id]?.textAnswer;

                return (
                  <div
                    key={q.id}
                    className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5"
                  >
                    {/* Question Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                          {q.topicTitle || 'General Topic'}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            q.difficulty === 'hard'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
                              : q.difficulty === 'medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>

                      {/* Source Citation Drawer Pill */}
                      {q.citation && (
                        <button
                          type="button"
                          onClick={() => openCitationPreview(q.citation)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-blue-600 dark:text-blue-400 text-xs font-semibold transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Source Citation</span>
                        </button>
                      )}
                    </div>

                    {/* Question Statement */}
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                      {q.question}
                    </h3>

                    {/* Options (MCQ) or Textarea (Short Answer) */}
                    {q.type === 'mcq' && q.options ? (
                      <div className="space-y-2.5">
                        {q.options.map((opt: string, optIdx: number) => {
                          const isSelected = userAnswers[q.id]?.selectedOptionIndex === optIdx;
                          const isCorrectOption = evalItem && q.correctOptionIndex === optIdx;
                          const isWrongSelection = evalItem && isSelected && !evalItem.isCorrect;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              disabled={!!evaluationResult}
                              onClick={() => handleSelectOption(q.id, optIdx)}
                              className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                                isCorrectOption
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                                  : isWrongSelection
                                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-500 text-rose-900 dark:text-rose-200'
                                  : isSelected
                                  ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-600 text-blue-900 dark:text-blue-200 shadow-sm'
                                  : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <span className="w-6 h-6 rounded-lg bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                              {isCorrectOption && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                              {isWrongSelection && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          disabled={!!evaluationResult}
                          value={userAnswers[q.id]?.textAnswer || ''}
                          onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                          placeholder="Type your explanation here. The AI will grade against the textbook rubric..."
                          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    )}

                    {/* Evaluated Explanation & Doctor's Why */}
                    {evalItem && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                              evalItem.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {evalItem.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                            <span>{evalItem.verdict === 'correct' ? 'Correct' : evalItem.verdict === 'partial' ? 'Partially Correct' : 'Incorrect'}</span>
                          </span>
                          <Link
                            href={`/chat?prompt=${encodeURIComponent(`Why was this answer wrong? Question: "${q.question}" My answer: "${evalItem.userAnswer}". Source: ${q.citation?.source}`)}`}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Why was this wrong? Ask AI &rarr;
                          </Link>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                          {evalItem.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Submit Quiz Action */}
            {!evaluationResult && (
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="text-xs text-slate-500">
                  {Object.keys(userAnswers).length} of {quizData.questions.length} answered
                </div>
                <button
                  onClick={handleSubmitQuiz}
                  disabled={evaluating || Object.keys(userAnswers).length === 0}
                  className="px-8 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Grading Against Source Rubric...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Diagnostic Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Citation Drawer Component */}
        <CitationDrawer
          citation={activeCitation}
          isOpen={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </div>
    </AppShell>
  );
}
