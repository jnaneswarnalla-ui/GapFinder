'use client';

import React from 'react';
import { AppShell } from '@/components/AppShell';
import {
  Sparkles,
  ShieldCheck,
  Search,
  Cpu,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  FileText,
  FileCheck2,
  RefreshCw,
  GitBranch,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <AppShell>
      <div className="space-y-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Architecture &amp; Clinical Guardrails</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How GapFinder AI Works Under the Hood
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed">
            A deep dive into our hybrid vector-lexical RAG pipeline, deterministic mastery mathematics, and zero-hallucination grounding guardrails.
          </p>
        </div>

        {/* Core Principle: Strict Separation */}
        <div className="p-7 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>The Gold Standard Principle</span>
          </div>
          <h2 className="text-2xl font-black">
            Strict Separation Between Retrieval &amp; Generation
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            In GapFinder AI, the LLM is <strong>never allowed to use outside knowledge</strong> for diagnostic questions, scoring rubrics, or chat explanations.
            <strong> RETRIEVAL</strong> acts as the sole arbiter of facts (returning verified text fragments with UUIDs). 
            <strong> GENERATION</strong> is constrained to cite those exact chunk IDs, and a mathematical <strong>Grounding Validator</strong> rejects and drops any claim that lacks direct textual support.
          </p>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>End-to-End System Architecture Flow</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
            {/* Step 1 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center">1</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Ingestion &amp; Chunker</div>
              <p className="text-slate-500">
                PDFs &amp; text split along markdown headers and pages into 600-token chunks with 15% sliding overlap.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center">2</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Hybrid Indexing</div>
              <p className="text-slate-500">
                768-dim vector embeddings (Gemini API) + tsvector BM25 stored in persistent Neon PostgreSQL.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center">3</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Retrieval &amp; Rerank</div>
              <p className="text-slate-500">
                Cosine similarity (70%) + BM25 score (30%). Low confidence (&lt;0.25) triggers upfront refusal.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center">4</div>
              <div className="font-bold text-sm text-slate-900 dark:text-white">Grounding Check</div>
              <p className="text-slate-500">
                LLM generates questions &amp; rubric citing chunk IDs. Citations are cross-checked against retrieved IDs.
              </p>
            </div>
          </div>
        </div>

        {/* Deterministic Scoring & Knapsack Revision Mathematics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mastery Formula */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-rose-500" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Deterministic Mastery Formula</h3>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
              M(t) = [ &Sigma; (w_diff &times; w_recency &times; S_i) / &Sigma; (w_diff &times; w_recency) ] &times; C(n)
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li>&bull; <strong>Difficulty Weights:</strong> Easy = 1.0, Medium = 1.3, Hard = 1.7</li>
              <li>&bull; <strong>Recency Decay:</strong> w_recency = e^(-&lambda; &Delta;t) prioritizing recent diagnostic attempts</li>
              <li>&bull; <strong>Sample Size Confidence:</strong> C(n) = min(1.0, n / 3) preventing over-confidence from 1 lucky guess</li>
              <li>&bull; <strong>Thresholds:</strong> &lt;50% Weak (Red), 50-79% Medium (Yellow), &ge;80% Strong (Green)</li>
            </ul>
          </div>

          {/* Priority Knapsack Scheduler */}
          <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-500" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Knapsack Revision Scheduler</h3>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 font-mono text-xs text-slate-800 dark:text-slate-200 overflow-x-auto">
              Priority(t) = (100 - Mastery(t)) &times; (ExamFrequency(t) + 1)
            </div>
            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <li>&bull; <strong>High-Yield Prioritization:</strong> Weak topics that appear frequently in past exams receive the lion&apos;s share of study blocks.</li>
              <li>&bull; <strong>Dynamic Re-testing:</strong> Taking a new quiz recalculates mastery, updates the priority queue, and shifts remaining hours.</li>
              <li>&bull; <strong>Concrete Grounded Directives:</strong> Daily tasks specify the exact textbook section to read and practice targets.</li>
            </ul>
          </div>
        </div>

        {/* Failure Handling & Resilience Matrix */}
        <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Failure Handling &amp; Serverless Resilience</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">Groq Rate Limits &amp; Fallback</div>
              <p className="text-slate-500 leading-relaxed">
                If 70B encounters rate limits or errors, requests automatically cascade to high-speed alternatives with retry backoff.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">Embedding Fallback to BM25</div>
              <p className="text-slate-500 leading-relaxed">
                If vector embeddings are unreachable, the hybrid retriever falls back seamlessly to Postgres tsvector lexical full-text search.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1.5">
              <div className="font-bold text-slate-900 dark:text-white">Scanned / Corrupt PDFs</div>
              <p className="text-slate-500 leading-relaxed">
                Documents with insufficient selectable text are intercepted with user-friendly actionable guidance to paste text.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
