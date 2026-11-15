'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Calendar, Tag, ArrowRight, Wand2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TransformationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: {
    id: string;
    original_text: string;
    transformed_text: string;
    transformation_type: string;
    created_at: string;
  } | null;
  onCopySuccess?: (msg: string) => void;
}

export default function TransformationModal({
  isOpen,
  onClose,
  record,
  onCopySuccess,
}: TransformationModalProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'both' | 'original' | 'transformed'>('both');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !record) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(record.transformed_text);
      setCopied(true);
      if (onCopySuccess) onCopySuccess('Transformed text copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const handleLoadInStudio = () => {
    // Save to sessionStorage or pass as query param
    sessionStorage.setItem('prefill_text', record.transformed_text);
    sessionStorage.setItem('prefill_type', record.transformation_type);
    router.push('/studio');
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50/50 dark:bg-gray-950/50">
          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              <Tag className="w-3 h-3" />
              {record.transformation_type}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formatDate(record.created_at)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                  <span>Copy Result</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              type="button"
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab selector on small screens */}
        <div className="sm:hidden px-6 pt-3 flex border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 gap-2">
          <button
            onClick={() => setActiveTab('both')}
            className={`pb-2 text-xs font-medium border-b-2 ${
              activeTab === 'both'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500'
            }`}
          >
            Side by Side
          </button>
          <button
            onClick={() => setActiveTab('original')}
            className={`pb-2 text-xs font-medium border-b-2 ${
              activeTab === 'original'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500'
            }`}
          >
            Original
          </button>
          <button
            onClick={() => setActiveTab('transformed')}
            className={`pb-2 text-xs font-medium border-b-2 ${
              activeTab === 'transformed'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500'
            }`}
          >
            Transformed
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Original Text */}
          {(activeTab === 'both' || activeTab === 'original') && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <span>Original Raw Content</span>
                <span>{record.original_text.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-950/60 border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto font-mono text-xs">
                {record.original_text}
              </div>
            </div>
          )}

          {/* Transformed Result */}
          {(activeTab === 'both' || activeTab === 'transformed') && (
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                <span className="flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5" />
                  Transformed AI Result
                </span>
                <span>{record.transformed_text.split(/\s+/).filter(Boolean).length} words</span>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50/30 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/50 text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap leading-relaxed max-h-[50vh] overflow-y-auto">
                {record.transformed_text}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50 flex items-center justify-between">
          <button
            onClick={handleLoadInStudio}
            type="button"
            className="inline-flex items-center space-x-2 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>Open & Iterate in Transformation Studio</span>
            <ArrowRight className="w-3 h-3" />
          </button>

          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 rounded-xl text-xs font-medium bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
