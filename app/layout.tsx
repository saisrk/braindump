import type { Metadata, Viewport } from 'next';
import { Spectral, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { Providers } from './providers';

const spectral = Spectral({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://brain-dump.co'),
  title: {
    default: 'Braindump — Externalize what you learn',
    template: '%s · Braindump',
  },
  description:
    'A knowledge externalization engine. Capture what you learn, prove you understand it, retain it with spaced repetition, and express it when it matters.',
  applicationName: 'Braindump',
  keywords: ['learning', 'spaced repetition', 'knowledge management', 'teach-back', 'interview prep', 'flashcards', 'active recall'],
  authors: [{ name: 'Braindump', url: 'https://brain-dump.co' }],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'Braindump',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@braindump_app',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f2ec' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1714' },
  ],
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://brain-dump.co/#organization',
      name: 'Braindump',
      url: 'https://brain-dump.co',
      logo: 'https://brain-dump.co/favicon.ico',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://brain-dump.co/#website',
      url: 'https://brain-dump.co',
      name: 'Braindump',
      publisher: { '@id': 'https://brain-dump.co/#organization' },
    },
    {
      '@type': 'SoftwareApplication',
      name: 'Braindump',
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'Web',
      url: 'https://brain-dump.co',
      description: 'Capture what you read, review with spaced repetition, prove understanding with teach-back and quizzes, and express your knowledge on demand.',
      offers: [
        {
          '@type': 'Offer',
          name: 'Free',
          price: '0',
          priceCurrency: 'INR',
          description: '1 capture/day, 30 learnings lifetime, 3 teach-backs/week, 1 Express trial',
        },
        {
          '@type': 'Offer',
          name: 'Pro',
          price: '1000',
          priceCurrency: 'INR',
          description: '10 captures/day, infinite library, unlimited teach-backs, quizzes, unlimited Express',
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${spectral.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
