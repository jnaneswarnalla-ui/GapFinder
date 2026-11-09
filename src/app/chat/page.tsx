'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  BookOpen,
  HelpCircle,
  Loader2,
} from 'lucide-react';

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

const SUGGESTED_PROMPTS = [
  'Explain the light reaction vs dark reaction in photosynthesis.',
  'Why do human muscle cells produce lactic acid during exercise?',
  'How does the nephron selectively reabsorb 100% of glucose?',
  'Explain why double circulation is necessary in human beings.',
  'What is the difference between combination and decomposition reactions?',
];

function ChatComponent() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt') || '';

  const [messages, setMessages] = useState<ChatMsg[]>([
    {
      role: 'assistant',
      content: `Hello! I am your GapFinder AI Tutor. I answer questions **strictly** from your uploaded course notes and syllabus, with verified inline citations [1][2].

If you ask about something not in your materials, I will let you know immediately instead of guessing. What concept or diagnostic mistake would you like to explore today?`,
    },
  ]);
  const [input, setInput] = useState(initialPrompt);
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/topics/list')
      .then(res => res.json())
      .then(data => setTopics(data.topics || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages: ChatMsg[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          topicTitle: selectedTopic || undefined,
        }),
      });

      const responseText = await res.text();
      setMessages(prev => [...prev, { role: 'assistant', content: responseText }]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${err.message || 'Unable to fetch response.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3 flex-shrink-0">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero-Hallucination Grounded Tutor</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Explain-This-Topic Assistant
          </h1>
        </div>

        {topics.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Topic Focus:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold focus:outline-none"
            >
              <option value="">All Uploaded Course Material</option>
              {topics.map(t => (
                <option key={t.id} value={t.title}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              m.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-tr-none'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 rounded-tl-none'
              }`}
            >
              {m.content}
            </div>

            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>Searching source chunks and formulating grounded explanation...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 flex-shrink-0">
        <span className="text-[11px] font-bold text-slate-400 uppercase flex-shrink-0">Try:</span>
        {SUGGESTED_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(prompt)}
            className="px-3 py-1 rounded-full bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 text-xs font-medium whitespace-nowrap border border-slate-200/80 dark:border-slate-700 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex-shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about your uploaded syllabus, notes, or quiz mistakes..."
          className="flex-1 px-4 py-2.5 bg-transparent text-sm text-slate-900 dark:text-white focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-md shadow-blue-500/20 disabled:opacity-40"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <AppShell>
      <Suspense fallback={
        <div className="text-center py-20 text-slate-400 flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading Assistant...</span>
        </div>
      }>
        <ChatComponent />
      </Suspense>
    </AppShell>
  );
}
