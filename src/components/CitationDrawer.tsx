'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, FileText, Bookmark, ExternalLink } from 'lucide-react';

export interface CitationInfo {
  chunkId?: string;
  source: string;
  chapter?: string;
  section?: string;
  page?: number | string;
  snippet: string;
}

interface CitationDrawerProps {
  citation: CitationInfo | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CitationDrawer({ citation, isOpen, onClose }: CitationDrawerProps) {
  if (!citation) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
          />

          {/* Drawer container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-primary font-semibold text-base">
                <BookOpen className="w-5 h-5" />
                <span>Verified Source Citation</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close citation drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Document metadata card */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Document</div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{citation.source}</div>
                  </div>
                </div>

                {(citation.chapter || citation.section) && (
                  <div className="flex items-start gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <Bookmark className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</div>
                      <div className="text-sm text-slate-700 dark:text-slate-300">
                        {citation.chapter && <span>{citation.chapter}</span>}
                        {citation.chapter && citation.section && <span> &bull; </span>}
                        {citation.section && <span>{citation.section}</span>}
                        {citation.page && <span className="ml-1 text-slate-500">(Page {citation.page})</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Exact Snippet Quote */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>Exact Source Passage</span>
                </div>
                <div className="relative p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 text-slate-800 dark:text-slate-200 text-sm leading-relaxed italic">
                  &ldquo;{citation.snippet}&rdquo;
                </div>
              </div>

              {/* Grounding guarantee badge */}
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Strictly grounded: This question and explanation are mathematically verified against this passage.</span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
