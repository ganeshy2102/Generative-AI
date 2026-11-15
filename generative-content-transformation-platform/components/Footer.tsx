'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Database, Cpu, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 dark:border-gray-800/80 bg-white dark:bg-gray-950 py-8 text-sm transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand info */}
          <div className="flex items-center space-x-2.5 text-gray-600 dark:text-gray-400">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">ContentShift</span>
            <span>—</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Generative Content Transformation Platform
            </span>
          </div>

          {/* System status pills */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              API Online
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
              <Database className="w-3 h-3 text-indigo-500" />
              SQLite Persistent Storage
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800">
              <Cpu className="w-3 h-3 text-purple-500" />
              OpenAI / Gemini Ready
            </span>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-400 gap-2">
          <p>© {new Date().getFullYear()} Generative Content Transformation Platform. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/" className="hover:text-indigo-500 transition-colors">Home</Link>
            <Link href="/studio" className="hover:text-indigo-500 transition-colors">Studio</Link>
            <Link href="/history" className="hover:text-indigo-500 transition-colors">History</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
