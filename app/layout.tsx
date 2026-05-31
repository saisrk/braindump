import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Braindump',
  description:
    'Turn what you learn into knowledge you can retrieve, prove, and express.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var mode = localStorage.getItem('theme');
                  if (mode === 'dark' || (!mode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-surface text-text-primary dark:bg-surface-dark dark:text-text-dark-primary font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
