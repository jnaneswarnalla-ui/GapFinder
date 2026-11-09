import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'GapFinder AI — Doctor for Studying',
  description: 'AI-driven diagnostic gap report, syllabus topic mapping, grounded quizzes, and personalized revision planning.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
