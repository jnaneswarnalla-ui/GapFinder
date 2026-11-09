'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  BookOpen,
  Network,
  FileCheck2,
  CalendarDays,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navbar */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 backdrop-blur-md sticky top-0 z-50 bg-white/70 dark:bg-slate-900/70">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-blue-600 dark:from-white dark:to-blue-400 bg-clip-text text-transparent">
                GapFinder AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hidden sm:inline-block"
            >
              How It Works
            </Link>
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <span>Demo Login</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6 max-w-6xl mx-auto text-center flex-1 flex flex-col justify-center items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>A Doctor for Studying</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.15]">
            Find what you{' '}
            <span className="bg-gradient-to-r from-rose-500 via-amber-500 to-red-600 bg-clip-text text-transparent underline decoration-rose-300 dark:decoration-rose-800 underline-offset-8">
              DO NOT know
            </span>
            , before your exam does.
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Upload your syllabus, notes, and past papers. GapFinder AI runs diagnostic quizzes, Pinpoints your exact knowledge gaps, and prescribes an adaptive daily revision plan with verified source citations.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-blue-500/25 hover:opacity-95 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
            >
              <span>Try Live Demo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/how-it-works"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-base hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <span>Explore AI Architecture</span>
            </Link>
          </div>
        </motion.div>

        {/* Feature Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left w-full">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Gap Report Diagnosis</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Deterministic mastery score with Weak (<span className="text-rose-500 font-semibold">&lt;50%</span>), Medium (<span className="text-amber-500 font-semibold">50-79%</span>), and Strong (<span className="text-emerald-500 font-semibold">&ge;80%</span>) classifications, mistake analysis, and misconception tags.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
              <CalendarDays className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Adaptive Revision Plan</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Knapsack scheduler allocates your available days &amp; hours by priority score (weakness &times; exam weight). Auto-updates dynamically after every new re-test.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Zero-Hallucination Guardrails</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every question and task cites exact source documents, chapters, and pages. Low confidence triggers upfront refusal instead of guesses.
            </p>
          </div>
        </div>

        {/* The Diagnostic Loop */}
        <div className="mt-20 p-8 rounded-3xl bg-slate-900 text-white w-full max-w-5xl text-center space-y-6">
          <div className="text-xs font-bold uppercase tracking-widest text-blue-400">The 7-Step Diagnostic Loop</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">How GapFinder AI Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 text-xs font-medium">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">1. Upload Materials</div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">2. Topic Map</div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">3. Diagnostic Quiz</div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">4. Rubric Eval</div>
            <div className="p-3 rounded-xl bg-blue-600 border border-blue-500 font-bold">5. Gap Report</div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">6. Revision Plan</div>
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">7. Re-test &amp; Update</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        GapFinder AI &mdash; Autonomous AI Full-Stack Study Diagnostics
      </footer>
    </div>
  );
}
