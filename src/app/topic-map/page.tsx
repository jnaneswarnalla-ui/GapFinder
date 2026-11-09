'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  Network,
  Sparkles,
  Edit2,
  GitMerge,
  ChevronDown,
  ChevronRight,
  Flame,
  HelpCircle,
  FileQuestion,
  Loader2,
  Check,
  X,
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

export default function TopicMapPage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [expandedUnits, setExpandedUnits] = useState<Record<string, boolean>>({});

  // Edit / Merge modal state
  const [editingTopic, setEditingTopic] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [mergingTopic, setMergingTopic] = useState<any | null>(null);
  const [targetMergeId, setTargetMergeId] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/topics/list');
      if (res.ok) {
        const data = await res.json();
        setTopics(data.topics || []);

        // Expand all units by default
        const unitMap: Record<string, boolean> = {};
        for (const t of data.topics || []) {
          unitMap[t.unit_name] = true;
        }
        setExpandedUnits(unitMap);
      }
    } catch (err) {
      console.error('Fetch topics error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const res = await fetch('/api/topics/generate', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to generate topic map');
      } else {
        await fetchTopics();
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingTopic) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/topics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'edit',
          topicId: editingTopic.id,
          title: editTitle,
          description: editDesc,
        }),
      });
      if (res.ok) {
        setEditingTopic(null);
        await fetchTopics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMergeTopics = async () => {
    if (!mergingTopic || !targetMergeId) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/topics/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'merge',
          topicId: mergingTopic.id,
          targetMergeTopicId: targetMergeId,
        }),
      });
      if (res.ok) {
        setMergingTopic(null);
        setTargetMergeId('');
        await fetchTopics();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const toggleUnit = (unitName: string) => {
    setExpandedUnits(prev => ({ ...prev, [unitName]: !prev[unitName] }));
  };

  // Group topics by Unit
  const unitsGrouped: Record<string, any[]> = {};
  for (const t of topics) {
    if (!unitsGrouped[t.unit_name]) {
      unitsGrouped[t.unit_name] = [];
    }
    unitsGrouped[t.unit_name].push(t);
  }

  // Frequency chart data
  const chartData = topics.map(t => ({
    name: t.title.length > 20 ? t.title.slice(0, 18) + '...' : t.title,
    frequency: t.exam_frequency,
    mastery: parseFloat(t.mastery_score || 0),
    status: t.status,
  }));

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Syllabus Topic Map &amp; Exam Weightings
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Hierarchical table of contents linked to past-board questions. High-frequency topics carry greater diagnostic priority.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Extracting TOC from Syllabus...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Re-Extract Topics from Syllabus</span>
              </>
            )}
          </button>
        </div>

        {/* Exam Frequency Visualization */}
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                Exam Frequency Heat Distribution
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">Past-paper appearances per topic</span>
          </div>

          {topics.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-slate-900 text-white text-xs shadow-lg space-y-1">
                            <div className="font-bold">{data.name}</div>
                            <div className="text-amber-400">Exam Frequency: {data.frequency} times</div>
                            <div>Mastery: {data.mastery}% ({data.status})</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="frequency" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.frequency >= 7
                            ? '#f43f5e'
                            : entry.frequency >= 4
                            ? '#f59e0b'
                            : '#3b82f6'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 text-sm">
              No topics available. Upload a syllabus or load sample data to render the exam frequency visualization.
            </div>
          )}
        </div>

        {/* Hierarchical Tree of Units & Topics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Curriculum Units &amp; Subtopics ({topics.length} topics)
            </h3>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading topic hierarchy...</span>
            </div>
          ) : Object.keys(unitsGrouped).length === 0 ? (
            <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 text-center text-slate-400 text-sm border border-slate-200 dark:border-slate-800">
              No topics generated yet. Upload a syllabus or load sample data on the Dashboard.
            </div>
          ) : (
            Object.entries(unitsGrouped).map(([unitName, unitTopics]) => {
              const isExpanded = expandedUnits[unitName] ?? true;
              return (
                <div
                  key={unitName}
                  className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  {/* Unit Header Bar */}
                  <div
                    onClick={() => toggleUnit(unitName)}
                    className="p-5 bg-slate-50/80 dark:bg-slate-800/50 flex items-center justify-between cursor-pointer hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-500" />
                      )}
                      <div>
                        <div className="font-extrabold text-base text-slate-900 dark:text-white">
                          {unitName}
                        </div>
                        <div className="text-xs text-slate-500">
                          {unitTopics.length} core topics
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Topics List */}
                  {isExpanded && (
                    <div className="p-5 divide-y divide-slate-100 dark:divide-slate-800/80">
                      {unitTopics.map((topic) => (
                        <div key={topic.id} className="py-4 first:pt-0 last:pb-0 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2.5">
                                <span className="font-bold text-base text-slate-900 dark:text-white">
                                  {topic.title}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    topic.status === 'strong'
                                      ? 'badge-strong'
                                      : topic.status === 'medium'
                                      ? 'badge-medium'
                                      : 'badge-weak'
                                  }`}
                                >
                                  {topic.status} ({Math.round(topic.mastery_score)}%)
                                </span>
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 flex items-center gap-1">
                                  <Flame className="w-3 h-3 text-amber-500" />
                                  <span>Freq: {topic.exam_frequency}</span>
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {topic.description}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setEditingTopic(topic);
                                  setEditTitle(topic.title);
                                  setEditDesc(topic.description || '');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Edit Topic"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setMergingTopic(topic);
                                  setTargetMergeId('');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                                title="Merge with another topic"
                              >
                                <GitMerge className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Linked Past Paper Questions */}
                          {topic.linked_questions && topic.linked_questions.length > 0 && (
                            <div className="pl-4 border-l-2 border-blue-200 dark:border-blue-900/60 space-y-1.5">
                              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                <FileQuestion className="w-3.5 h-3.5 text-blue-500" />
                                <span>Linked Past Board Exam Questions ({topic.linked_questions.length}):</span>
                              </div>
                              <div className="space-y-1">
                                {topic.linked_questions.map((q: any) => (
                                  <div key={q.id} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                    <span className="font-semibold text-blue-600 flex-shrink-0">[{q.year} - {q.marks}M]:</span>
                                    <span>{q.questionText}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Edit Topic Modal */}
        {editingTopic && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Edit Topic</h3>
                <button onClick={() => setEditingTopic(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Topic Title</label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 uppercase">Description / Scope</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setEditingTopic(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Merge Topics Modal */}
        {mergingTopic && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Merge Topic</h3>
                <button onClick={() => setMergingTopic(null)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Merge &ldquo;<strong>{mergingTopic.title}</strong>&rdquo; into another topic. Linked past paper questions will be transferred to the target topic.
              </p>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase">Select Target Topic</label>
                <select
                  value={targetMergeId}
                  onChange={(e) => setTargetMergeId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select destination topic --</option>
                  {topics
                    .filter(t => t.id !== mergingTopic.id)
                    .map(t => (
                      <option key={t.id} value={t.id}>
                        {t.unit_name} &rarr; {t.title}
                      </option>
                    ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setMergingTopic(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMergeTopics}
                  disabled={!targetMergeId || actionLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                >
                  {actionLoading ? 'Merging...' : 'Confirm Merge'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
