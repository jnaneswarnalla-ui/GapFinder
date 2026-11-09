'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/AppShell';
import {
  FileCheck2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Printer,
  Download,
  Filter,
  Flame,
  ArrowRight,
  Sparkles,
  Tag,
  MessageSquareText,
  HelpCircle,
  Loader2,
} from 'lucide-react';

export default function GapReportPage() {
  const [data, setData] = useState<any>({ summary: {}, topics: [], units: [] });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');

  const fetchGapReport = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (unitFilter !== 'all') params.append('unit', unitFilter);

      const res = await fetch(`/api/gap-report?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Gap report load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGapReport();
  }, [statusFilter, unitFilter]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GapFinder_Diagnostic_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const { summary = {}, topics = [], units = [] } = data;

  return (
    <AppShell>
      <div className="space-y-8 print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold mb-2">
              <FileCheck2 className="w-3.5 h-3.5" />
              <span>Diagnostic Medical Chart for Studying</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Knowledge Gap Diagnosis Report
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Deterministic mastery scores, mistake analyses, and prioritized revision targets.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs shadow-sm hover:bg-slate-50 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-semibold text-xs shadow-sm hover:opacity-90 flex items-center gap-1.5 transition-opacity"
            >
              <Download className="w-4 h-4" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>

        {/* Printable Title (Only visible during print) */}
        <div className="hidden print:block border-b pb-4 mb-6">
          <h1 className="text-2xl font-black text-slate-900">GapFinder AI — Diagnostic Student Report</h1>
          <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()} for Student Cohort</p>
        </div>

        {/* Diagnostic Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/60 space-y-1">
            <div className="text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Weak Knowledge Areas (&lt;50%)
            </div>
            <div className="text-3xl font-black text-rose-600 dark:text-rose-400">
              {summary.weakCount || 0}
            </div>
            <div className="text-[11px] text-rose-600/80">Immediate clinical revision priority</div>
          </div>

          <div className="p-5 rounded-3xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 space-y-1">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
              Medium Knowledge (50-79%)
            </div>
            <div className="text-3xl font-black text-amber-600 dark:text-amber-400">
              {summary.mediumCount || 0}
            </div>
            <div className="text-[11px] text-amber-600/80">Partial retention &bull; Practice drills needed</div>
          </div>

          <div className="p-5 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-1">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Strong Mastery (&ge;80%)
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {summary.strongCount || 0}
            </div>
            <div className="text-[11px] text-emerald-600/80">Active recall &bull; Board ready</div>
          </div>

          <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-1">
            <div className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
              Average Cohort Mastery
            </div>
            <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
              {summary.averageMastery || 0}%
            </div>
            <div className="text-[11px] text-blue-600/80">Weighted across attempts &amp; difficulty</div>
          </div>
        </div>

        {/* Filter Controls (Hidden in print) */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">Filters:</span>

            {/* Status Filter */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              {['all', 'weak', 'medium', 'strong'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    statusFilter === s
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Filter */}
          {units.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Unit:</span>
              <select
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
              >
                <option value="all">All Units</option>
                {units.map((u: string) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Detailed Topic Cards */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing student gaps...</span>
          </div>
        ) : topics.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 text-center text-slate-400 text-sm border border-slate-200 dark:border-slate-800">
            No topic diagnoses match your filter criteria.
          </div>
        ) : (
          <div className="space-y-4">
            {topics.map((t: any) => {
              const score = parseFloat(t.mastery_score || 0);
              const misconceptions: string[] = Array.isArray(t.misconceptions) ? t.misconceptions : [];

              return (
                <div
                  key={t.topic_id}
                  className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border transition-all shadow-sm space-y-4 ${
                    t.status === 'weak'
                      ? 'border-l-4 border-l-rose-500 border-slate-200/80 dark:border-slate-800'
                      : t.status === 'medium'
                      ? 'border-l-4 border-l-amber-500 border-slate-200/80 dark:border-slate-800'
                      : 'border-l-4 border-l-emerald-500 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {t.unit_name}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {t.topic_title}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                          t.status === 'weak'
                            ? 'badge-weak'
                            : t.status === 'medium'
                            ? 'badge-medium'
                            : 'badge-strong'
                        }`}
                      >
                        {t.status} ({score}%)
                      </span>

                      {/* Priority Score Pill */}
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        <span>Priority Score: {Math.round(t.priority_score)}</span>
                      </span>
                    </div>
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Calculated Mastery</span>
                      <span>{score}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          t.status === 'weak'
                            ? 'bg-rose-500'
                            : t.status === 'medium'
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(5, score)}%` }}
                      />
                    </div>
                  </div>

                  {/* Doctor's Reason / Mistake Diagnosis */}
                  <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>Diagnosis &amp; Mistake Pattern</span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic">
                      &ldquo;{t.reason}&rdquo;
                    </p>
                  </div>

                  {/* Misconception Tags */}
                  {misconceptions.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Tag className="w-3 h-3 text-slate-400" />
                        <span>Identified Misconceptions:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {misconceptions.map((m, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-medium border border-rose-200/60 dark:border-rose-800/40"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Links (Hidden in print) */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs font-semibold print:hidden">
                    <div className="text-slate-400">
                      {t.past_questions_count} past-paper questions linked
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/chat?prompt=${encodeURIComponent(`Explain this weak topic from my syllabus: "${t.topic_title}". What is the core mechanism and why do students get it wrong?`)}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <MessageSquareText className="w-3.5 h-3.5" />
                        <span>Explain This Topic</span>
                      </Link>
                      <Link
                        href="/revision-plan"
                        className="text-slate-700 dark:text-slate-200 hover:underline flex items-center gap-1"
                      >
                        <span>Revision Plan &rarr;</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
