'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles, History, Wand2, Home, Menu, X, ChevronRight } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/studio', label: 'Transformation Studio', icon: Wand2 },
    { href: '/history', label: 'My History', icon: History },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/80 dark:bg-gray-950/80 border-b border-gray-200/80 dark:border-gray-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Sparkles className="w-5 h-5 animate-pulse-subtle" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 dark:text-white tracking-tight flex items-center gap-1.5">
                Content<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Shift</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-wider uppercase font-medium text-gray-500 dark:text-gray-400 -mt-1">
                Generative Transformation Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-100 dark:border-indigo-900/50'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Actions: Theme Toggle & Studio CTA */}
          <div className="hidden md:flex items-center space-x-3">
            <ThemeToggle />
            <Link
              href="/studio"
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <Wand2 className="w-4 h-4" />
              <span>Studio</span>
              <ChevronRight className="w-3.5 h-3.5 opacity-70" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md px-4 pt-2 pb-5 space-y-2 animate-fade-in">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-base font-medium transition-colors ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 text-indigo-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/studio"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md shadow-indigo-600/20"
            >
              <Wand2 className="w-4 h-4" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
