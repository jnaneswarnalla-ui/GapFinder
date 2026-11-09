'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  GraduationCap,
  Users,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Sparkles,
  BarChart3,
  Loader2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function TeacherPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/teacher')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-2">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Classroom Aggregate Diagnostics</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Teacher &amp; Cohort Insights
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Topic-level class insights revealing aggregate knowledge gaps, common student misconceptions, and failure rates.
          </p>
        </div>

        {loading || !data ? (
          <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading class analytics...</span>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Cohort Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-xs font-bold text-slate-400 uppercase">Class Cohort</div>
                <div className="text-xl font-black text-slate-900 dark:text-white truncate">
                  {data.className}
                </div>
                <div className="text-xs text-slate-500">{data.totalStudents} enrolled students</div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-xs font-bold text-blue-500 uppercase">Class Average Mastery</div>
                <div className="text-3xl font-black text-blue-600">
                  {data.classAverageMastery}%
                </div>
                <div className="text-[11px] text-blue-600 font-semibold">Weighted across curriculum</div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-xs font-bold text-rose-500 uppercase">Students Needing Intervention</div>
                <div className="text-3xl font-black text-rose-600">
                  {data.strugglingStudentsCount}
                </div>
                <div className="text-[11px] text-rose-600 font-semibold">Score &lt;50% on &ge;3 core topics</div>
              </div>

              <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
                <div className="text-xs font-bold text-emerald-500 uppercase">Students on Track</div>
                <div className="text-3xl font-black text-emerald-600">
                  {data.onTrackStudentsCount}
                </div>
                <div className="text-[11px] text-emerald-600 font-semibold">Ready for board exams</div>
              </div>
            </div>

            {/* Top Struggle Topics Table */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                    Topics Most Students Struggle With
                  </h3>
                  <p className="text-xs text-slate-500">
                    Highest error rates and prevalent conceptual misconceptions observed during diagnostic tests.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Topic &amp; Unit</th>
                      <th className="py-3 px-4">Class Failure Rate</th>
                      <th className="py-3 px-4">Avg Score</th>
                      <th className="py-3 px-4">Common Misconception Detected</th>
                      <th className="py-3 px-4 text-right">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.topStruggleTopics.map((st: any, i: number) => (
                      <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{st.topic}</div>
                          <div className="text-[11px] text-slate-400">{st.unit}</div>
                        </td>
                        <td className="py-4 px-4 font-bold text-rose-600">
                          {st.failureRate}% of students
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-xs">
                          {st.avgScore}%
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-600 dark:text-slate-300 italic">
                          &ldquo;{st.commonMisconception}&rdquo;
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                            st.difficulty === 'hard' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {st.difficulty}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Grade Tier Distribution */}
            <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Cohort Mastery Distribution
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.distribution.map((dist: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-2xl border space-y-1 ${
                      dist.gradeRange.includes('Weak')
                        ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                        : dist.gradeRange.includes('Medium')
                        ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40'
                        : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-500 uppercase">{dist.gradeRange}</div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">
                      {dist.count} Students ({dist.percentage}%)
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
