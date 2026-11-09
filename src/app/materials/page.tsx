'use client';

import React, { useState, useEffect } from 'react';
import { AppShell } from '@/components/AppShell';
import {
  UploadCloud,
  FileText,
  FileCheck2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Tag,
  FileSpreadsheet,
  BookOpen,
} from 'lucide-react';

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string>(''); // 'parse' | 'chunk' | 'embed' | 'index'
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deletingBulk, setDeletingBulk] = useState(false);

  // Form states
  const [file, setFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'syllabus' | 'notes' | 'past_paper'>('notes');
  const [pastedText, setPastedText] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/materials/list');
      if (res.ok) {
        const data = await res.json();
        setMaterials(data.materials || []);
      }
    } catch (err: any) {
      console.error('Fetch materials error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (activeTab === 'upload' && !file) {
      setError('Please select a file to upload (.pdf, .txt, or .md)');
      return;
    }
    if (activeTab === 'paste' && !pastedText.trim()) {
      setError('Please paste text content into the box');
      return;
    }

    try {
      setUploading(true);
      setUploadStep('Parsing document content...');

      const formData = new FormData();
      if (activeTab === 'upload' && file) {
        formData.append('file', file);
      } else {
        formData.append('text', pastedText);
        formData.append('title', documentTitle.trim() || 'Pasted Document');
      }
      formData.append('fileType', fileType);

      // Simulate step states for visual progress bar
      setTimeout(() => setUploadStep('Chunking by markdown headings & pages with 15% overlap...'), 600);
      setTimeout(() => setUploadStep('Generating 768-dim vector embeddings & BM25 inverted index...'), 1400);

      const res = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload document');
      }

      setSuccess(data.message || 'Document indexed and vectorized successfully!');
      setFile(null);
      setPastedText('');
      setDocumentTitle('');
      await fetchMaterials();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this material? All indexed chunks will be removed.')) return;
    try {
      const res = await fetch(`/api/materials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        await fetchMaterials();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === materials.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(materials.map((m) => m.id));
    }
  };

  const handleToggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    if (
      !confirm(
        `Are you sure you want to delete ${count} selected document${
          count > 1 ? 's' : ''
        }? All indexed chunks will be removed.`
      )
    ) {
      return;
    }

    try {
      setDeletingBulk(true);
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/materials/${id}`, { method: 'DELETE' })
        )
      );
      setSelectedIds([]);
      await fetchMaterials();
    } catch (err) {
      console.error('Bulk delete error:', err);
    } finally {
      setDeletingBulk(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Materials &amp; Course Ingestion
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload your syllabus, chapter notes, and past papers (.pdf, .txt, .md). Every chunk is indexed with hybrid vector and BM25 search.
          </p>
        </div>

        {/* Upload Form Card */}
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="font-bold text-lg text-slate-900 dark:text-white">Add New Study Material</h2>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'upload' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Upload File (.pdf, .txt, .md)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('paste')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === 'paste' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleFileUpload} className="space-y-5">
            {/* Tag by Material Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Material Type</span>
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFileType('syllabus')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    fileType === 'syllabus'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Syllabus</div>
                  <div className="text-[11px] font-normal text-slate-500">Defines units &amp; topic hierarchy</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFileType('notes')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    fileType === 'notes'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Notes / Chapters</div>
                  <div className="text-[11px] font-normal text-slate-500">Core study text &amp; definitions</div>
                </button>

                <button
                  type="button"
                  onClick={() => setFileType('past_paper')}
                  className={`p-3 rounded-2xl border text-xs font-bold text-left transition-all ${
                    fileType === 'past_paper'
                      ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="font-extrabold text-sm mb-0.5">Past Exam Paper</div>
                  <div className="text-[11px] font-normal text-slate-500">Establishes topic frequencies</div>
                </button>
              </div>
            </div>

            {/* Input fields based on tab */}
            {activeTab === 'upload' ? (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select File
                </label>
                <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/50 dark:bg-slate-800/20 text-center cursor-pointer transition-colors relative">
                  <input
                    type="file"
                    accept=".pdf,.txt,.md"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {file ? file.name : 'Drag and drop or click to browse'}
                    </div>
                    <div className="text-xs text-slate-400">
                      Supports Digital PDF, TXT, Markdown (Max 25MB)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    placeholder="e.g. Chapter 4: Organic Chemistry"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Paste Raw Text
                  </label>
                  <textarea
                    rows={6}
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder="Paste textbook sections, lecture notes, or past questions here..."
                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>
            )}

            {/* Processing State Indicator */}
            {uploading && (
              <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-300">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>{uploadStep}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-blue-200 dark:bg-blue-900 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing &amp; Vectorizing...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Index Material</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Uploaded Materials Table */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Indexed Documents ({materials.length})
            </h3>
            {materials.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleSelectAll}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
                >
                  {selectedIds.length === materials.length && materials.length > 0
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  disabled={selectedIds.length === 0 || deletingBulk}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {deletingBulk ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}</span>
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading materials...</span>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No materials uploaded yet. Upload a syllabus or chapter above, or use &ldquo;Load Sample Data&rdquo; on the Dashboard.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200/60 dark:border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={materials.length > 0 && selectedIds.length === materials.length}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                        title="Select all"
                        aria-label="Select all documents"
                      />
                    </th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Chunks</th>
                    <th className="py-3 px-4">Date Added</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {materials.map((m) => {
                    const isSelected = selectedIds.includes(m.id);
                    return (
                      <tr
                        key={m.id}
                        className={`transition-colors ${
                          isSelected
                            ? 'bg-blue-50/60 dark:bg-blue-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3.5 px-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleOne(m.id)}
                            className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
                            title={`Select ${m.title}`}
                            aria-label={`Select ${m.title}`}
                          />
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span>{m.title}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              m.file_type === 'syllabus'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                                : m.file_type === 'past_paper'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {m.file_type.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono text-xs">
                          {m.chunk_count} chunks
                        </td>
                        <td className="py-3.5 px-4 text-slate-400 text-xs">
                          {new Date(m.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                            title="Delete material"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
