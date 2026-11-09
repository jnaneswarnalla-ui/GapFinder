'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderOpen,
  Network,
  HelpCircle,
  FileCheck2,
  CalendarDays,
  MessageSquareText,
  TrendingUp,
  GraduationCap,
  Sparkles,
  LogOut,
  Moon,
  Sun,
  Stethoscope,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/materials', label: 'Materials', icon: FolderOpen },
  { href: '/topic-map', label: 'Topic Map', icon: Network },
  { href: '/quiz', label: 'Diagnostic Quiz', icon: HelpCircle },
  { href: '/gap-report', label: 'Gap Report', icon: FileCheck2, highlight: true },
  { href: '/revision-plan', label: 'Revision Plan', icon: CalendarDays },
  { href: '/chat', label: 'Ask AI Tutor', icon: MessageSquareText },
  { href: '/progress', label: 'Progress & Streaks', icon: TrendingUp },
  { href: '/teacher', label: 'Teacher View', icon: GraduationCap },
  { href: '/how-it-works', label: 'How It Works', icon: Sparkles },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check dark mode
    if (typeof window !== 'undefined') {
      const isDark = document.documentElement.classList.contains('dark') ||
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(isDark);
      if (isDark) document.documentElement.classList.add('dark');
    }

    // Fetch user
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Brand Logo */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-700 dark:from-white dark:via-slate-200 dark:to-blue-400 bg-clip-text text-transparent">
              GapFinder AI
            </div>
            <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 tracking-wide uppercase">
              Doctor for Studying
            </div>
          </div>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3 mb-2">
          Diagnostic Loop
        </div>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all group',
                isActive
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white',
                item.highlight && !isActive && 'relative'
              )}
            >
              <div className="flex items-center gap-3">
                <Icon className={cn('w-4 h-4 transition-transform group-hover:scale-110', isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400')} />
                <span>{item.label}</span>
              </div>
              {item.highlight && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400">
                  Diagnosis
                </span>
              )}
              {isActive && <ChevronRight className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </Link>
          );
        })}
      </div>

      {/* Footer Profile & Dark Mode */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
        <div className="flex items-center justify-between px-2">
          <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Appearance</div>
          <button
            onClick={toggleDarkMode}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {user ? (
          <div className="p-2.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                <div className="text-[11px] text-slate-400 truncate">{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            href="/login"
            className="block text-center py-2 px-3 bg-blue-600 text-white text-xs font-medium rounded-xl hover:bg-blue-700 transition-colors"
          >
            Sign In / Demo
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed inset-y-0 left-0 z-30">
        {navContent}
      </aside>

      {/* Mobile hamburger header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span className="font-bold text-base text-slate-900 dark:text-white">GapFinder AI</span>
        </Link>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 max-w-full h-full z-10">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
}
