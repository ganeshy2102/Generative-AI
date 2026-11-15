'use client';

import React from 'react';
import { useTheme } from './ThemeProvider';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label="Toggle Dark/Light Mode"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
      className="relative p-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400 animate-fade-in" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 animate-fade-in" />
      )}
    </button>
  );
}
