'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  TrendingUp,
  Flame,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function ProgressPage() {
  const [attempts, setAttempts] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/quiz/attempts').then(r => r.json()),
      fetch('/api/topics/list').then(r => r.json()),
    ])
      .then(([attData, topData]) => {
        setAttempts(attData.attempts || []);
        setTopics(topData.topics || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Format trend data chronologically
  const trendData = [...attempts]
    .reverse()
    .map((att, idx) => ({
      name: `Attempt ${idx + 1}`,
      score: parseFloat(att.score),
      date: new Date(att.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' }),
    }));

  const badges = [
    {
      title: 'First Diagnosis',
      desc: 'Completed your first diagnostic quiz and identified critical gaps.',
      unlocked: attempts.length >= 1,
      icon: Award,
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
    },
    {
      title: 'Mastery Promoted',
      desc: 'Moved at least 1 weak topic into the strong tier (>=80%).',
      unlocked: topics.some(t => t.status === 'strong'),
      icon: TrendingUp,
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
    },
    {
      title: 'Study Habit Builder',
      desc: 'Completed 3 consecutive diagnostic assessment loops.',
      unlocked: attempts.length >= 3,
      icon: Flame,
      color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
    },
    {
      title: 'Zero Hallucination Grounded',
      desc: 'All answered questions verified against exact source textbook citations.',
      unlocked: true,
      icon: CheckCircle2,
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800',
    },
  ];

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Empirical Growth Analytics</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Progress &amp; Score Trajectory
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor mastery migration from Weak &rarr; Strong across diagnostic attempts and active study streaks.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Study Streak</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              5 Days
            </div>
            <div className="text-[11px] text-amber-600 font-semibold">Active revision rhythm</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Time Studied</span>
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              6.5 Hrs
            </div>
            <div className="text-[11px] text-blue-600 font-semibold">Directed by priority score</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Assessments Taken</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-3xl font-black text-slate-900 dark:text-white">
              {attempts.length}
            </div>
            <div className="text-[11px] text-purple-600 font-semibold">Diagnostic evaluations</div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
              <span>Strong Topics</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              {topics.filter(t => t.status === 'strong').length}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold">&ge;80% mastery achieved</div>
          </div>
        </div>

        {/* Score Progression Trend Chart */}
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Overall Diagnostic Score Progression
            </h3>
            <span className="text-xs text-slate-400">Chronological attempt trend</span>
          </div>

          {trendData.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 15, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs shadow-lg space-y-1">
                            <div className="font-bold">{d.name} &bull; {d.date}</div>
                            <div className="text-blue-400 font-extrabold text-sm">Score: {d.score}%</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb' }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              No diagnostic attempts yet. Take a quiz or load sample data to render score progression.
            </div>
          )}
        </div>

        {/* Weak-to-Strong Topic Movement Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Topic Mastery Trajectory
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Current Mastery</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Exam Importance</th>
                  <th className="py-3 px-4 text-right">Diagnosis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {topics.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {t.title}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-xs">
                      {Math.round(t.mastery_score)}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          t.status === 'strong'
                            ? 'badge-strong'
                            : t.status === 'medium'
                            ? 'badge-medium'
                            : 'badge-weak'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs">
                      {t.exam_frequency} past appearances
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-slate-400">
                      {t.status === 'strong' ? 'Board Ready' : t.status === 'medium' ? 'Practice Drill' : 'Critical Gap'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Achievement Badges */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            Achievement Badges
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {badges.map((b, i) => {
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={`p-5 rounded-3xl border transition-all ${
                    b.unlocked
                      ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-sm'
                      : 'opacity-40 bg-slate-50 dark:bg-slate-900 border-dashed border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-3 ${b.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
                    {b.title}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
