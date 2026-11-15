'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  History,
  Search,
  Filter,
  Trash2,
  Copy,
  Check,
  Eye,
  Wand2,
  Calendar,
  Layers,
  ArrowUpDown,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  ExternalLink,
  Tag,
  AlertCircle,
  FileText,
} from 'lucide-react';
import ToastContainer, { ToastMessage } from '@/components/Toast';
import TransformationModal from '@/components/TransformationModal';

interface TransformationRecord {
  id: string;
  original_text: string;
  transformed_text: string;
  transformation_type: string;
  created_at: string;
}

export default function HistoryPage() {
  const [records, setRecords] = useState<TransformationRecord[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Modal State
  const [activeRecord, setActiveRecord] = useState<TransformationRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      if (selectedType && selectedType !== 'All') params.set('type', selectedType);
      params.set('includeStats', 'true');

      const res = await fetch(`/api/history?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setRecords(json.data || []);
        if (json.stats) setStats(json.stats);
      } else {
        addToast('error', json.error || 'Failed to load transformation history.');
      }
    } catch (err: any) {
      console.error('Fetch history error:', err);
      addToast('error', 'Error connecting to database.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedType]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleCopy = async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      addToast('success', 'Transformed content copied to clipboard!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      addToast('error', 'Failed to copy to clipboard.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this transformation record?')) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/history/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRecords((prev) => prev.filter((r) => r.id !== id));
        addToast('success', 'Transformation record deleted.');
      } else {
        addToast('error', data.error || 'Failed to delete record.');
      }
    } catch (err) {
      addToast('error', 'Network error deleting record.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleInspect = (record: TransformationRecord) => {
    setActiveRecord(record);
    setIsModalOpen(true);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return iso;
    }
  };

  const typesList = [
    'All',
    'Summarize',
    'Translate',
    'Rewrite as a Blog Post',
    'Extract Key Points',
    'Professional Polish',
    'Explain Like I\'m 5',
    'Social Media Thread',
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
      <TransformationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        record={activeRecord}
        onCopySuccess={(msg) => addToast('success', msg)}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2.5">
            <History className="w-7 h-7 text-indigo-500" />
            <span>My Transformation History</span>
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Browse, search, inspect, and manage all your past AI content transformations.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => fetchHistory()}
            type="button"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <Link
            href="/studio"
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-500/20 transition-all active:scale-95"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>New Transformation</span>
          </Link>
        </div>
      </div>

      {/* Dashboard Metrics / Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <History className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                Total Saved
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                Words Processed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalWordsProcessed.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Tag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">
                Active Types
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {Object.keys(stats.byType || {}).length}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords across original notes or generated output..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Type Filter */}
          <div className="relative">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
            >
              {typesList.map((t) => (
                <option key={t} value={t}>
                  {t === 'All' ? 'All Types' : t}
                </option>
              ))}
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setViewMode('table')}
              type="button"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              type="button"
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        /* Loading skeleton */
        <div className="p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
          <p className="text-sm text-gray-500">Loading transformation history...</p>
        </div>
      ) : records.length === 0 ? (
        /* Empty State */
        <div className="py-16 text-center space-y-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500 mx-auto">
            <History className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">
              No Transformations Found
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              {searchQuery || selectedType !== 'All'
                ? 'Try adjusting your search query or type filters.'
                : 'You haven’t transformed any content yet. Head to the studio to generate your first transformation!'}
            </p>
          </div>
          <div>
            <Link
              href="/studio"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Open Transformation Studio</span>
            </Link>
          </div>
        </div>
      ) : viewMode === 'table' ? (
        /* ========================================================================= */
        /* Table View */
        /* ========================================================================= */
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/70 dark:bg-gray-950/70 border-b border-gray-200 dark:border-gray-800 text-xs uppercase font-semibold text-gray-500 dark:text-gray-400 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Original Input</th>
                  <th className="px-6 py-4">Transformed Output</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/80">
                {records.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-gray-850/50 transition-colors group"
                  >
                    {/* Type badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        {item.transformation_type}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 font-mono">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Original snippet */}
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                        {item.original_text}
                      </p>
                    </td>

                    {/* Transformed snippet */}
                    <td className="px-6 py-4 max-w-sm">
                      <p className="text-xs text-gray-900 dark:text-gray-200 line-clamp-2 leading-relaxed font-medium">
                        {item.transformed_text}
                      </p>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleInspect(item)}
                          type="button"
                          title="Inspect Details"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleCopy(item.id, item.transformed_text)}
                          type="button"
                          title="Copy Transformed Content"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(item.id)}
                          type="button"
                          disabled={deletingId === item.id}
                          title="Delete Record"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* Grid View */
        /* ========================================================================= */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {item.transformation_type}
                  </span>
                  <span className="text-[11px] text-gray-400 font-mono">
                    {formatDate(item.created_at)}
                  </span>
                </div>

                {/* Original snippet */}
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    Original
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                    {item.original_text}
                  </p>
                </div>

                {/* Result snippet */}
                <div className="space-y-1 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-500">
                    Generated Result
                  </span>
                  <p className="text-xs text-gray-800 dark:text-gray-200 line-clamp-4 leading-relaxed font-medium">
                    {item.transformed_text}
                  </p>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <button
                  onClick={() => handleInspect(item)}
                  type="button"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Full</span>
                </button>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleCopy(item.id, item.transformed_text)}
                    type="button"
                    title="Copy Result"
                    className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    type="button"
                    disabled={deletingId === item.id}
                    title="Delete Record"
                    className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
