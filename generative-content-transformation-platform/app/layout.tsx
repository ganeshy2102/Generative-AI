import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Generative Content Transformation Platform',
  description: 'Instantly summarize, translate, rewrite, and extract key points from raw text with modern AI and persistent SQLite history.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-500 selection:text-white bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-gray-100 transition-colors duration-200">
        <ThemeProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              {children}
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
