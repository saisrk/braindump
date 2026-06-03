import type { Metadata, Viewport } from 'next';
import { JetBrains_Mono, Chakra_Petch, Rajdhani, Share_Tech_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const chakraPetch = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  variable: '--font-sans-custom',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const shareTechiMono = Share_Tech_Mono({
  subsets: ['latin'],
  variable: '--font-mono-custom',
  weight: ['400'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Braindump — Externalize what you learn',
    template: '%s · Braindump',
  },
  description:
    'A knowledge externalization engine. Capture what you learn, prove you understand it, retain it with spaced repetition, and express it when it matters.',
  applicationName: 'Braindump',
  keywords: [
    'learning',
    'spaced repetition',
    'knowledge management',
    'teach-back',
    'interview prep',
  ],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#020608' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${chakraPetch.variable} ${rajdhani.variable} ${shareTechiMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('dark');
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
