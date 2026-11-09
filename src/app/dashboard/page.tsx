'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import {
  FileCheck2,
  CalendarDays,
  HelpCircle,
  Network,
  FolderOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Flame,
  Clock,
  Loader2,
  RotateCcw,
} from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [summary, setSummary] = useState<any>({
    totalTopics: 0,
    weakCount: 0,
    mediumCount: 0,
    strongCount: 0,
    averageMastery: 0,
  });
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any>(null);
  const [materialsCount, setMaterialsCount] = useState(0);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch gap report summary
      const gapRes = await fetch('/api/gap-report');
      if (gapRes.ok) {
        const gapData = await gapRes.json();
        setSummary(gapData.summary || {});
      }

      // Fetch attempts
      const attRes = await fetch('/api/quiz/attempts');
      if (attRes.ok) {
        const attData = await attRes.json();
        setRecentAttempts(attData.attempts || []);
      }

      // Fetch current plan
      const planRes = await fetch('/api/revision-plan/current');
      if (planRes.ok) {
        const pData = await planRes.json();
        setActivePlan(pData.plan);
      }

      // Fetch materials
      const matRes = await fetch('/api/materials/list');
      if (matRes.ok) {
        const mData = await matRes.json();
        setMaterialsCount(mData.materials?.length || 0);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLoadSampleData = async () => {
    try {
      setSeeding(true);
      const res = await fetch('/api/seed', { method: 'POST' });
      if (res.ok) {
        setSeedSuccess(true);
        await fetchDashboardData();
        setTimeout(() => setSeedSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setSeeding(false);
    }
  };

  // Compute loop progress steps
  const hasMaterials = materialsCount > 0;
  const hasTopics = summary.totalTopics > 0;
  const hasQuiz = recentAttempts.length > 0;
  const hasGapReport = summary.totalTopics > 0 && (summary.weakCount + summary.mediumCount + summary.strongCount > 0);
  const hasPlan = !!activePlan;

  const currentStep = !hasMaterials ? 1 : !hasTopics ? 2 : !hasQuiz ? 3 : !hasPlan ? 4 : 5;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Diagnostic Learning OS</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Student Diagnostic Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pinpoint knowledge gaps, review source citations, and conquer weak exam areas.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadSampleData}
              disabled={seeding}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {seeding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Class 10 Sample Data...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Load Sample Data (Class 10 Science)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {seedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-sm font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Class 10 Science sample syllabus, 3 chapters of notes, past paper, and diagnostic attempts loaded successfully!</span>
          </div>
        )}

        {/* 7-Step Diagnostic Loop Onboarding Checklist */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Loop Progress &bull; Step {currentStep} of 5
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Continuous Diagnosis &amp; Revision Pipeline
              </h2>
            </div>
            <div className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
              {Math.round(((currentStep - 1) / 5) * 100)}% Complete
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
            <Link
              href="/materials"
              className={`p-3.5 rounded-2xl border transition-all ${
                hasMaterials
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <FolderOpen className="w-4 h-4" />
                {hasMaterials && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-bold">1. Upload Materials</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{materialsCount} files indexed</div>
            </Link>

            <Link
              href="/topic-map"
              className={`p-3.5 rounded-2xl border transition-all ${
                hasTopics
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Network className="w-4 h-4" />
                {hasTopics && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-bold">2. Topic Map</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{summary.totalTopics} topics extracted</div>
            </Link>

            <Link
              href="/quiz"
              className={`p-3.5 rounded-2xl border transition-all ${
                hasQuiz
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <HelpCircle className="w-4 h-4" />
                {hasQuiz && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-bold">3. Diagnostic Quiz</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{recentAttempts.length} attempts taken</div>
            </Link>

            <Link
              href="/gap-report"
              className={`p-3.5 rounded-2xl border transition-all ${
                hasGapReport
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileCheck2 className="w-4 h-4" />
                {hasGapReport && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-bold">4. Gap Report</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{summary.weakCount} weak topics found</div>
            </Link>

            <Link
              href="/revision-plan"
              className={`p-3.5 rounded-2xl border transition-all ${
                hasPlan
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <CalendarDays className="w-4 h-4" />
                {hasPlan && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
              </div>
              <div className="text-xs font-bold">5. Revision Plan</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{activePlan ? `${activePlan.daysAvailable} days schedule` : 'Not generated'}</div>
            </Link>
          </div>
        </div>

        {/* Diagnostic Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Weak Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-500 uppercase tracking-wider">
              <span>Weak Topics (&lt;50%)</span>
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {summary.weakCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-priority revision targets with frequent past-paper appearances.
            </p>
          </div>

          {/* Medium Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-500 uppercase tracking-wider">
              <span>Medium Topics (50-79%)</span>
              <TrendingUp className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {summary.mediumCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Partial understanding. Practice drills needed to reach full mastery.
            </p>
          </div>

          {/* Strong Topics */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-500 uppercase tracking-wider">
              <span>Strong Topics (&ge;80%)</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {summary.strongCount}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Retain mastery with rapid recall flashcards.
            </p>
          </div>

          {/* Overall Cohort Mastery */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-blue-500 uppercase tracking-wider">
              <span>Overall Mastery</span>
              <Flame className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
              {summary.averageMastery}%
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recency- and difficulty-weighted score across all verified quiz attempts.
            </p>
          </div>
        </div>

        {/* Quick Diagnostic Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Main Prescription Card */}
          <div className="p-7 rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white shadow-xl shadow-blue-500/20 space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-bold uppercase tracking-wider">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Primary Diagnosis</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black">Inspect Your Gap Report</h3>
              <p className="text-sm text-blue-100 leading-relaxed">
                Review your topic-by-topic doctor&apos;s report with specific mistake analysis, identified misconceptions, and mathematical priority rankings.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/gap-report"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors shadow-md"
              >
                <span>View Full Gap Report</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Revision Plan Card */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
              <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
              <span>Personalized Revision Prescription</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {activePlan ? `${activePlan.daysAvailable}-Day Study Plan` : 'Generate Revision Schedule'}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Deterministic knapsack time allocation ensuring your available study hours are directed where they move the exam needle most.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/revision-plan"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-sm hover:opacity-90 transition-opacity"
              >
                <span>{activePlan ? 'Open Revision Schedule' : 'Create Revision Plan'}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Attempts History Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Recent Diagnostic Attempts</h3>
            <Link href="/quiz" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Take New Diagnostic Quiz &rarr;
            </Link>
          </div>

          {recentAttempts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">
              No diagnostic attempts yet. Take a quiz or click &ldquo;Load Sample Data&rdquo; above!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Quiz Title</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Correct / Total</th>
                    <th className="py-3 px-4">Date Taken</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentAttempts.slice(0, 5).map((att, i) => (
                    <tr key={att.id || i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                        {att.quiz_title || 'Diagnostic Assessment'}
                      </td>
                      <td className="py-3.5 px-4 font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            att.score >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : att.score >= 50
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          }`}
                        >
                          {att.score}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {att.correct_count} / {att.total_questions} questions
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {new Date(att.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/gap-report"
                          className="text-xs font-semibold text-blue-600 hover:underline"
                        >
                          Review Gaps &rarr;
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
