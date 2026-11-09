'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  CalendarDays,
  Clock,
  Sparkles,
  CheckCircle2,
  Square,
  CheckSquare2,
  BookOpen,
  ArrowRight,
  Flame,
  RotateCcw,
  RefreshCw,
  Loader2,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function RevisionPlanPage() {
  const [plan, setPlan] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateDiffs, setUpdateDiffs] = useState<any[]>([]);

  // Generator inputs
  const [daysAvailable, setDaysAvailable] = useState(5);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [examDate, setExamDate] = useState('2026-11-20');

  const fetchPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/revision-plan/current');
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
        if (data.plan) {
          setDaysAvailable(data.plan.daysAvailable);
          setHoursPerDay(data.plan.hoursPerDay);
          if (data.plan.examDate) setExamDate(data.plan.examDate.split('T')[0]);
        }
      }
    } catch (err) {
      console.error('Plan fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      setUpdateDiffs([]);
      const res = await fetch('/api/revision-plan/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          daysAvailable: Number(daysAvailable),
          hoursPerDay: Number(hoursPerDay),
          examDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to generate revision plan');
      } else {
        await fetchPlan();
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (taskId: string, currentCompleted: boolean) => {
    if (!plan) return;
    const nextCompleted = !currentCompleted;

    // Optimistically update local state
    const nextSchedule = { ...plan.schedule };
    for (const day of nextSchedule.days) {
      for (const t of day.tasks) {
        if (t.id === taskId) {
          t.completed = nextCompleted;
          break;
        }
      }
    }
    setPlan({ ...plan, schedule: nextSchedule });

    if (nextCompleted) {
      try {
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
      } catch {}
    }

    try {
      await fetch('/api/revision-plan/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          taskId,
          completed: nextCompleted,
        }),
      });
    } catch (err) {
      console.error('Task update error:', err);
    }
  };

  const handleRetestUpdate = async () => {
    try {
      setUpdating(true);
      const res = await fetch('/api/revision-plan/retest-update', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to update plan');
      } else {
        setUpdateDiffs(data.diffs || []);
        await fetchPlan();
      }
    } catch (err: any) {
      alert(err.message || 'Retest update failed');
    } finally {
      setUpdating(false);
    }
  };

  // Compute checklist stats
  const allTasks = plan?.schedule?.days?.flatMap((d: any) => d.tasks) || [];
  const completedTasks = allTasks.filter((t: any) => t.completed).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0;

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-2">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Deterministic Priority Knapsack Scheduler</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Personalized Revision Plan
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Allocates study hours based on your priority score (weakness &times; exam weight). Dynamically re-schedules after every quiz.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRetestUpdate}
              disabled={updating || !plan}
              className="px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-semibold text-xs shadow-sm hover:bg-indigo-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Re-calculating Time Shifts...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  <span>Auto-Update From Latest Quiz</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Update Diffs Banner (Triggered when plan auto-updates after re-test) */}
        {updateDiffs.length > 0 && (
          <div className="p-6 rounded-3xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 space-y-3 animate-in fade-in">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900 dark:text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Dynamic Re-test Adjustments Detected ({updateDiffs.length} Topics Changed):</span>
            </div>
            <div className="space-y-2">
              {updateDiffs.map((d, i) => (
                <div key={i} className="text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                  <span className="font-bold">&bull; {d.topicTitle}:</span>
                  <span>{d.actionTaken} (Mastery: {d.oldMastery}% &rarr; {d.newMastery}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Plan Configuration Form */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Schedule Parameters
          </h2>
          <form onSubmit={handleGeneratePlan} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Days Available
              </label>
              <input
                type="number"
                min={1}
                max={30}
                value={daysAvailable}
                onChange={(e) => setDaysAvailable(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Hours Per Day
              </label>
              <input
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={hoursPerDay}
                onChange={(e) => setHoursPerDay(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Target Exam Date
              </label>
              <input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={generating}
              className="py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Computing Knapsack...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Regenerate Plan</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Progress & Overview Bar */}
        {plan && (
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Checklist Completion
                </div>
                <div className="text-xl font-black text-slate-900 dark:text-white">
                  {completedTasks} of {allTasks.length} Tasks Finished ({progressPercent}%)
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Allocated</div>
                <div className="text-sm font-bold text-blue-600">
                  {plan.schedule?.totalStudyMinutes || 0} minutes ({Math.round((plan.schedule?.totalStudyMinutes || 0) / 60)} hrs)
                </div>
              </div>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Day-by-Day Revision Tasks */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading schedule...</span>
          </div>
        ) : !plan || !plan.schedule?.days || plan.schedule.days.length === 0 ? (
          <div className="p-12 rounded-3xl bg-white dark:bg-slate-900 text-center text-slate-400 text-sm border border-slate-200 dark:border-slate-800 space-y-3">
            <p>No revision plan generated yet. Set your days &amp; hours above and click Regenerate Plan.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {plan.schedule.days.map((day: any) => (
              <div
                key={day.dayNumber}
                className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden"
              >
                {/* Day Header */}
                <div className="p-5 bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center">
                      D{day.dayNumber}
                    </span>
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                        Day {day.dayNumber} &bull; Focus: {day.focusUnit}
                      </h3>
                      <div className="text-xs text-slate-400">
                        Date: {day.dateStr} &bull; {day.totalMinutes} minutes scheduled
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300">
                    {day.tasks.filter((t: any) => t.completed).length} / {day.tasks.length} tasks done
                  </span>
                </div>

                {/* Day Tasks Checklist */}
                <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800">
                  {day.tasks.map((task: any) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id, task.completed)}
                      className="py-4 first:pt-0 last:pb-0 flex items-start gap-3.5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 p-2 rounded-2xl transition-colors group"
                    >
                      <button
                        type="button"
                        className="mt-0.5 text-slate-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
                      >
                        {task.completed ? (
                          <CheckSquare2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                        )}
                      </button>

                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-bold text-sm ${
                              task.completed
                                ? 'line-through text-slate-400 dark:text-slate-500'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {task.topicTitle}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase">
                            {task.taskType.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{task.allocatedMinutes} mins</span>
                          </span>
                        </div>

                        <p
                          className={`text-xs leading-relaxed ${
                            task.completed ? 'text-slate-400' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {task.description}
                        </p>

                        {task.sourceSection && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-0.5">
                            <BookOpen className="w-3 h-3 text-slate-400" />
                            <span>Source: {task.sourceSection} &bull; Target: {task.practiceTarget}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
