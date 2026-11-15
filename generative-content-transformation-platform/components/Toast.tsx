'use client';

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center space-x-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md animate-fade-in transition-all max-w-md ${
            toast.type === 'success'
              ? 'bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800'
              : 'bg-indigo-50/95 dark:bg-indigo-950/90 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-800'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />}
          {toast.type === 'info' && <Info className="w-5 h-5 text-indigo-500 shrink-0" />}

          <span className="text-sm font-medium leading-snug">{toast.message}</span>

          <button
            onClick={() => onDismiss(toast.id)}
            type="button"
            className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
