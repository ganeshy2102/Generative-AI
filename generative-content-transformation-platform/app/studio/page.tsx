'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Download,
  ArrowRight,
  Database,
  Layers,
  Languages,
  BookOpen,
  FileText,
  ListChecks,
  Clock,
  Send,
  Loader2,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import ToastContainer, { ToastMessage } from '@/components/Toast';

interface SampleContent {
  label: string;
  type: string;
  text: string;
}

const SAMPLE_TEXTS: SampleContent[] = [
  {
    label: '🚀 Product Launch Memo',
    type: 'Summarize',
    text: `Team, next Tuesday we are initiating the phased global rollout of our next-generation cloud infrastructure suite, code-named Project Apex. Over the past 14 months, engineering has decoupled our monolithic data ingestion pipeline into distributed micro-services, resulting in a 4x reduction in 99th-percentile latency and an 18% reduction in cloud infrastructure expenses.

Key rollout dates:
- Nov 18: Canary deployment to 5% of enterprise EMEA traffic.
- Nov 20: 50% expansion across North America and APAC.
- Nov 22: Full public availability with press release, customer webinars, and developer documentation launch.

All customer support teams must review the internal troubleshooting playbook in Confluence before Monday. On-call rotations for site reliability engineers have been doubled for the first 72 hours. Please report any anomalies directly to the #war-room-apex Slack channel.`,
  },
  {
    label: '🔬 Research Paper Abstract',
    type: 'Extract Key Points',
    text: `Recent advances in transformer architectures have underscored the trade-off between contextual window length and inference computational efficiency. In this study, we propose Hierarchical Latent Routing (HLR), an attention sparsification mechanism that dynamically clusters semantic tokens into latent anchor points before cross-attention computation.

Across benchmarks on Llama-3 and Mistral architectures, HLR achieves a 3.2x speedup in time-to-first-token (TTFT) and reduces peak memory consumption by 42% while retaining 98.7% accuracy on long-context retrieval evaluations up to 128k tokens. Empirical observations further show that attention heads in early layers disproportionately focus on positional syntactic markers rather than semantic tokens, justifying early token pruning.`,
  },
  {
    label: '💡 Marketing Draft Notes',
    type: 'Rewrite as a Blog Post',
    text: `Why most developer tools fail:
1. They solve problems developers don't have.
2. Too much setup friction - if it takes more than 5 minutes to run locally, developers bounce.
3. Bad docs - developers don't want marketing fluff, they want copy-pasteable examples and CLI snippets.
4. Hidden pricing - no pricing page means enterprisey sales calls, which modern developers actively avoid.

The winning formula for modern devtools:
- Instant time-to-value: zero-config CLI or web playground.
- Transparent open-core or self-hosted tier.
- Community-driven feedback loops via GitHub and Discord.
- Documentation that treats engineers as peers, not leads.`,
  },
  {
    label: '🌐 Customer Testimonial',
    type: 'Translate',
    text: `The implementation of ContentShift dramatically streamlined our international marketing pipeline. We reduced our turnaround time for localized product copy from five business days down to less than thirty minutes, all while ensuring that our unique brand voice and technical terminology were accurately preserved.`,
  },
];

const TRANSFORMATION_TYPES = [
  { id: 'Summarize', label: 'Summarize', icon: FileText, desc: 'Condense into executive brief' },
  { id: 'Translate', label: 'Translate', icon: Languages, desc: 'Translate into other languages' },
  { id: 'Rewrite as a Blog Post', label: 'Rewrite as a Blog Post', icon: BookOpen, desc: 'Convert into engaging blog post' },
  { id: 'Extract Key Points', label: 'Extract Key Points', icon: ListChecks, desc: 'Prioritize bullet takeaways' },
  { id: 'Professional Polish', label: 'Professional Polish', icon: Sparkles, desc: 'Elevate into polished business tone' },
  { id: 'Explain Like I\'m 5', label: 'Explain Like I\'m 5', icon: Wand2, desc: 'Simplify complex ideas' },
  { id: 'Social Media Thread', label: 'Social Media Thread', icon: Send, desc: 'Format as viral thread' },
];

const TARGET_LANGUAGES = [
  'Spanish',
  'French',
  'German',
  'Japanese',
  'Chinese (Simplified)',
  'Hindi',
  'Italian',
  'Portuguese',
  'Arabic',
  'Dutch',
];

export default function StudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-sm text-gray-500">Loading Transformation Studio...</p>
        </div>
      }
    >
      <StudioContent />
    </Suspense>
  );
}

function StudioContent() {
  const searchParams = useSearchParams();

  // State
  const [inputText, setInputText] = useState('');
  const [transformationType, setTransformationType] = useState('Summarize');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');
  const [tone, setTone] = useState('Balanced');
  const [length, setLength] = useState<'concise' | 'standard' | 'detailed'>('standard');

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultMeta, setResultMeta] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Check URL query parameters or sessionStorage for pre-fill
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam) {
      setTransformationType(typeParam);
    }

    const prefillText = sessionStorage.getItem('prefill_text');
    const prefillType = sessionStorage.getItem('prefill_type');
    if (prefillText) {
      setInputText(prefillText);
      sessionStorage.removeItem('prefill_text');
    }
    if (prefillType) {
      setTransformationType(prefillType);
      sessionStorage.removeItem('prefill_type');
    }
  }, [searchParams]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) {
      addToast('error', 'Please enter some raw text to transform.');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setResultMeta(null);

    try {
      const response = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          type: transformationType,
          targetLanguage: transformationType === 'Translate' ? targetLanguage : undefined,
          tone,
          length,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to transform text.');
      }

      setResult(data.data.transformed_text);
      setResultMeta(data.data);
      addToast('success', `Content transformed & saved to database (ID: ${data.data.id})`);
    } catch (err: any) {
      console.error('Transformation error:', err);
      addToast('error', err.message || 'An error occurred during transformation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      addToast('success', 'Transformed result copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('error', 'Could not copy to clipboard.');
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = new Blob([result], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `transformed-${transformationType.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('info', 'Downloaded as Markdown file.');
  };

  const handleLoadSample = (sample: SampleContent) => {
    setInputText(sample.text);
    setTransformationType(sample.type);
    addToast('info', `Loaded "${sample.label}"`);
  };

  const handleClear = () => {
    setInputText('');
    setResult(null);
    setResultMeta(null);
  };

  const handleSendToInput = () => {
    if (!result) return;
    setInputText(result);
    setResult(null);
    setResultMeta(null);
    addToast('info', 'Transformed text moved to input for further iteration.');
  };

  const inputWordCount = inputText.trim().split(/\s+/).filter(Boolean).length;
  const inputCharCount = inputText.length;
  const outputWordCount = result ? result.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <Wand2 className="w-7 h-7 text-indigo-500" />
            <span>Transformation Studio</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Paste raw text, select a transformation target, and generate intelligent content in seconds.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 hidden sm:inline">
            Try a sample:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_TEXTS.map((sample) => (
              <button
                key={sample.label}
                onClick={() => handleLoadSample(sample)}
                type="button"
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors border border-gray-200 dark:border-gray-700"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Studio Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Input Canvas & Controls */}
        {/* ========================================================================= */}
        <div className="flex flex-col space-y-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6">
          {/* Input Header */}
          <div className="flex items-center justify-between">
            <label
              htmlFor="raw-content-input"
              className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-indigo-500" />
              <span>Raw Content Input</span>
            </label>

            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <span>{inputWordCount} words</span>
              <span>•</span>
              <span>{inputCharCount} chars</span>
              {inputText.length > 0 && (
                <button
                  onClick={handleClear}
                  type="button"
                  className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium ml-2 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Textarea */}
          <div className="relative">
            <textarea
              id="raw-content-input"
              rows={13}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
              placeholder="Paste or write your raw text, meeting notes, draft article, research abstract, or documentation here... (Tip: Press Ctrl+Enter or Cmd+Enter to generate)"
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-y font-normal text-sm leading-relaxed"
            />
          </div>

          {/* Transformation Controls */}
          <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-gray-800/80">
            {/* Transformation Type Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="transformation-type-select"
                className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
              >
                Transformation Type
              </label>
              <select
                id="transformation-type-select"
                value={transformationType}
                onChange={(e) => setTransformationType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
              >
                {TRANSFORMATION_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label} — {t.desc}
                  </option>
                ))}
              </select>
            </div>

            {/* Target Language Dropdown (conditionally shown if Translate is selected) */}
            {transformationType === 'Translate' && (
              <div className="space-y-1.5 animate-fade-in">
                <label
                  htmlFor="target-language-select"
                  className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5"
                >
                  <Languages className="w-3.5 h-3.5" />
                  <span>Target Language</span>
                </label>
                <select
                  id="target-language-select"
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/30 text-gray-900 dark:text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors shadow-sm"
                >
                  {TARGET_LANGUAGES.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Tone and Length selectors */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="tone-select"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Tone
                </label>
                <select
                  id="tone-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="Balanced">Balanced</option>
                  <option value="Professional">Professional</option>
                  <option value="Casual">Casual</option>
                  <option value="Enthusiastic">Enthusiastic</option>
                  <option value="Academic">Academic</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="length-select"
                  className="text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400"
                >
                  Length
                </label>
                <select
                  id="length-select"
                  value={length}
                  onChange={(e) => setLength(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                >
                  <option value="standard">Standard</option>
                  <option value="concise">Concise</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>

            {/* Primary Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !inputText.trim()}
              type="button"
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 flex items-center justify-center space-x-2.5 active:scale-98 ${
                isLoading || !inputText.trim()
                  ? 'bg-gray-300 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-indigo-500/25'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Content Transformation...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5" />
                  <span>Generate Transformation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Output Canvas */}
        {/* ========================================================================= */}
        <div className="flex flex-col space-y-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm p-5 sm:p-6 min-h-[580px]">
          {/* Output Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800/80">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                Transformed Result
              </span>
              {resultMeta && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Auto-Saved
                </span>
              )}
            </div>

            {/* Actions: Copy & Download */}
            {result && (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleCopy}
                  type="button"
                  title="Copy to Clipboard"
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-all active:scale-95 shadow-sm"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-500">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-gray-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDownload}
                  type="button"
                  title="Download as Markdown"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Download className="w-4 h-4" />
                </button>

                <button
                  onClick={handleSendToInput}
                  type="button"
                  title="Send back to Input to iterate"
                  className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Output Content Area */}
          <div className="flex-1 flex flex-col justify-center">
            {isLoading ? (
              /* Loading State */
              <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-fade-in text-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                  <Sparkles className="w-4 h-4 text-purple-500 absolute -top-1 -right-1 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                    Transforming Content...
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs">
                    Applying {transformationType} heuristics, generating clean structure, and indexing results.
                  </p>
                </div>
              </div>
            ) : result ? (
              /* Generated Result State */
              <div className="flex flex-col h-full space-y-4 animate-fade-in">
                {/* Meta details bar */}
                {resultMeta && (
                  <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-950/60 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                      <span>Type: <strong className="text-gray-700 dark:text-gray-300">{resultMeta.transformation_type}</strong></span>
                      <span>•</span>
                      <span>{outputWordCount} words</span>
                    </div>
                    {resultMeta.meta && (
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                          {resultMeta.meta.model}
                        </span>
                        <span>{resultMeta.meta.processingTimeMs}ms</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Result formatted block */}
                <div className="flex-1 p-5 rounded-xl bg-slate-50/70 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 text-sm leading-relaxed overflow-y-auto max-h-[520px] whitespace-pre-wrap select-text selection:bg-indigo-500 selection:text-white">
                  {result}
                </div>
              </div>
            ) : (
              /* Empty Initial State */
              <div className="flex flex-col items-center justify-center py-16 text-center space-y-4 text-gray-400 dark:text-gray-500">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800/60 flex items-center justify-center text-gray-400">
                  <Wand2 className="w-8 h-8" />
                </div>
                <div className="space-y-1 max-w-sm">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Ready to Transform
                  </h4>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Paste content into the input canvas on the left, choose your transformation type, and click{' '}
                    <span className="font-medium text-indigo-500">Generate</span>.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
