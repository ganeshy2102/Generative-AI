'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wand2,
  FileText,
  Languages,
  BookOpen,
  ListChecks,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  History,
  Layers,
  Terminal,
} from 'lucide-react';

export default function HomePage() {
  const features = [
    {
      title: 'Summarize',
      type: 'Summarize',
      icon: FileText,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Executive Briefs',
      description:
        'Distill lengthy memos, reports, articles, and research documents into crisp, high-impact executive summaries.',
    },
    {
      title: 'Translate',
      type: 'Translate',
      icon: Languages,
      color: 'from-indigo-500 to-purple-500',
      badge: 'Multi-Language',
      description:
        'Localize text into Spanish, French, German, Japanese, Chinese, and more, maintaining cultural nuance and style.',
    },
    {
      title: 'Rewrite as a Blog Post',
      type: 'Rewrite as a Blog Post',
      icon: BookOpen,
      color: 'from-amber-500 to-rose-500',
      badge: 'Content Marketing',
      description:
        'Transform rough notes and outlines into publication-ready articles complete with captivating headlines, hooks, and takeaways.',
    },
    {
      title: 'Extract Key Points',
      type: 'Extract Key Points',
      icon: ListChecks,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Action Items',
      description:
        'Extract high-priority bullet points, action items, and strategic conclusions from dense technical or meeting transcripts.',
    },
    {
      title: 'Professional Polish',
      type: 'Professional Polish',
      icon: Sparkles,
      color: 'from-violet-500 to-fuchsia-500',
      badge: 'Executive Clarity',
      description:
        'Elevate casual drafts and internal brainstorms into polished, persuasive communications for clients and leadership.',
    },
    {
      title: 'Explain Like I’m 5',
      type: 'Explain Like I\'m 5',
      icon: Zap,
      color: 'from-pink-500 to-rose-600',
      badge: 'Simplified Jargon',
      description:
        'Demystify complex technical architectures, legal jargon, or scientific concepts into friendly, relatable analogies.',
    },
  ];

  return (
    <div className="space-y-16 sm:space-y-24 py-4 sm:py-8">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-6">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none -z-10" />

        {/* Tag pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 shadow-sm animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Next-Gen Content Transformation Engine</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.15]">
          Transform Any Raw Content Into{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
            Intelligent Assets
          </span>
        </h1>

        {/* Subhead */}
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-normal leading-relaxed">
          Instantly summarize, translate, rewrite, and distill key takeaways from raw text.
          Powered by generative AI with seamless SQLite database persistence and full OpenAI/Gemini support.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/studio"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 transition-all duration-200 active:scale-95"
          >
            <Wand2 className="w-5 h-5" />
            <span>Launch Transformation Studio</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/history"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-850 shadow-sm transition-all duration-200 active:scale-95"
          >
            <History className="w-5 h-5 text-gray-500" />
            <span>View Saved History</span>
          </Link>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Core Transformation Capabilities
          </h2>
          <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
            Select a mode to process raw notes, transcripts, or drafts in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative p-6 rounded-2xl bg-white dark:bg-gray-900/70 border border-gray-200 dark:border-gray-800 hover:border-indigo-500/50 dark:hover:border-indigo-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-md shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-200`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      {item.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800/80">
                  <Link
                    href={`/studio?type=${encodeURIComponent(item.type)}`}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform"
                  >
                    <span>Try {item.title}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Architecture & How It Works Banner */}
      <section className="rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-gray-950 p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 translate-x-10 translate-y-10 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-800/60 text-indigo-300 text-xs font-medium border border-indigo-700/50">
            <Layers className="w-3.5 h-3.5" />
            <span>Full-Stack Architecture</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Built for Speed, Reliability, and Zero-Friction Workflow
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-sm text-indigo-200">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Fast AI Processing</span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Integrated with smart context mock engine for instant results, with seamless switches to OpenAI or Gemini.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Automatic SQLite Storage</span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Every generation is automatically persisted to local SQLite database tables with indexed search.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center space-x-2 text-white font-semibold">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>REST API Ready</span>
              </div>
              <p className="text-xs text-indigo-200/80 leading-relaxed">
                Clean endpoints for /api/transform and /api/history ready for programmatic integration and automation.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/studio"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-indigo-950 bg-white hover:bg-indigo-50 shadow transition-all duration-150 active:scale-95"
            >
              <span>Get Started in Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
