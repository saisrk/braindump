import type { Metadata } from 'next';
import './globals.css';
import Navigation from '@/components/Navigation';

export const metadata: Metadata = {
  title: 'Braindump',
  description: 'Learning Assist — capture, review, remember.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0f0f0f] text-slate-100">
        <main className="max-w-2xl mx-auto px-4 pt-6 pb-24">
          {children}
        </main>
        <Navigation />
      </body>
    </html>
  );
}
