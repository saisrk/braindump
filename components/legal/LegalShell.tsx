import Link from 'next/link';
import type { ReactNode } from 'react';
import { CONTACT_X_URL } from '@/lib/constants';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";
const TERRACOTTA = '#b5462f';
const INK = '#2a2620';
const INK2 = '#7c7361';
const FAINT = '#aaa190';
const RULE = '#e6e0d4';
const BG = '#f5f2ec';

const linkStyle = { fontFamily: F, fontSize: '13px', color: INK2, textDecoration: 'none' } as const;

export function LegalShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK }}>
      {/* Top bar */}
      <header style={{ borderBottom: `1px solid ${RULE}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: INK, textDecoration: 'none' }}>
          Braindump
        </Link>
        <Link href="/" style={{ ...linkStyle, color: TERRACOTTA, fontWeight: 600 }}>← Back to home</Link>
      </header>

      {/* Article */}
      <main style={{ maxWidth: '760px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', lineHeight: 1.15, color: INK, marginBottom: '12px' }}>
          {title}
        </h1>
        <p style={{ fontFamily: F, fontSize: '13px', color: FAINT, marginBottom: '40px' }}>Last updated: {lastUpdated}</p>
        <div
          style={{ fontFamily: F, fontSize: '15px', lineHeight: 1.7, color: INK }}
          className="legal-body"
        >
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${RULE}`, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '15px', color: INK }}>Braindump</span>
        <p style={{ fontFamily: F, fontSize: '12px', color: FAINT }}>Knowledge externalization engine · {new Date().getFullYear()}</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={linkStyle}>Privacy</Link>
          <Link href="/terms" style={linkStyle}>Terms</Link>
          <Link href="/contact" style={linkStyle}>Contact</Link>
          <a href={CONTACT_X_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>X</a>
        </div>
      </footer>

      {/* Shared typography for prose children */}
      <style>{`
        .legal-body h2 { font-family: ${SERIF}; font-weight: 700; font-size: 22px; color: ${INK}; margin: 36px 0 12px; }
        .legal-body h3 { font-family: ${SERIF}; font-weight: 600; font-size: 17px; color: ${INK}; margin: 24px 0 8px; }
        .legal-body p { margin: 0 0 14px; }
        .legal-body ul { margin: 0 0 14px; padding-left: 22px; }
        .legal-body li { margin: 0 0 8px; }
        .legal-body a { color: ${TERRACOTTA}; text-decoration: underline; }
        .legal-body strong { color: ${INK}; font-weight: 600; }
      `}</style>
    </div>
  );
}
