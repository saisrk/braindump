import type { Metadata } from 'next';
import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = {
  title: 'Sign in — Braindump',
  description: 'Sign in to your Braindump library. Continue capturing, reviewing, and retaining what you learn.',
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .auth-left { display: flex; }
        .auth-right { width: 420px; flex-shrink: 0; }
        @media (max-width: 768px) {
          .auth-left { display: none !important; }
          .auth-right { width: 100% !important; }
        }
      `}</style>

      {/* Left — dark showcase panel */}
      <div
        className="auth-left"
        style={{
          flex: 1,
          background: '#2a2620',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: '#b5462f', borderRadius: '8px', display: 'grid', placeItems: 'center', flexShrink: 0, boxShadow: '0 4px 12px -4px rgba(181,70,47,.6)' }}>
            <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true">
              <rect x="3" y="1" width="12" height="18" rx="1" stroke="white" strokeWidth="2" fill="none" />
              <rect x="1" y="3" width="3" height="14" rx="0.5" fill="white" fillOpacity="0.9" />
              <line x1="6" y1="7" x2="13" y2="7" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="10" x2="13" y2="10" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="6" y1="13" x2="10" y2="13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '20px', color: '#f5f2ec' }}>Braindump</span>
        </div>

        {/* Hero copy */}
        <div style={{ maxWidth: '440px' }}>
          <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#b5462f', marginBottom: '20px' }}>
            Knowledge Externalization Engine
          </p>
          <h1 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '42px', lineHeight: 1.1, color: '#f5f2ec', marginBottom: '28px', letterSpacing: '-0.5px' }}>
            Build a{' '}
            <em style={{ color: '#b5462f', fontStyle: 'italic' }}>library</em>
            {' '}of everything you learn
          </h1>

          {/* Key points */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { color: '#b5462f', text: 'Capture knowledge from URLs, articles, and notes' },
              { color: '#c79a3e', text: 'Spaced repetition surfaces cards at the perfect moment' },
              { color: '#46557a', text: 'Teach back to solidify understanding with AI feedback' },
              { color: '#6f8a5a', text: 'Express your knowledge in interviews and conversations' },
            ].map((pt) => (
              <div key={pt.text} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pt.color, flexShrink: 0, marginTop: '6px' }} />
                <p style={{ fontSize: '15px', color: '#c8bfb0', lineHeight: 1.5, margin: 0 }}>{pt.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Mini bookshelf */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '4px', paddingBottom: '12px' }}>
          {[
            { h: 96, grad: 'linear-gradient(160deg, #c97a4a, #a05a30)', title: 'Deep Work' },
            { h: 118, grad: 'linear-gradient(160deg, #6f8a5a, #4a6040)', title: 'Psychology' },
            { h: 104, grad: 'linear-gradient(160deg, #46557a, #2f3d5e)', title: 'Systems' },
            { h: 128, grad: 'linear-gradient(160deg, #c79a3e, #a07828)', title: 'Leadership' },
            { h: 100, grad: 'linear-gradient(160deg, #8a5072, #633858)', title: 'Design' },
          ].map((book, i) => (
            <div key={i} style={{ width: '36px', height: `${book.h}px`, background: book.grad, borderRadius: '3px 4px 4px 3px', boxShadow: 'inset -3px 0 6px rgba(0,0,0,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '8px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {book.title}
              </span>
            </div>
          ))}
          <div style={{ position: 'absolute', bottom: 0, left: '-8px', right: '-8px', height: '10px', background: '#3d3529', borderRadius: '0 0 4px 4px' }} />
        </div>
      </div>

      {/* Right — auth form */}
      <div
        className="auth-right"
        style={{
          background: '#f5f2ec',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 40px',
        }}
      >
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '28px', color: '#2a2620', marginBottom: '8px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: '#7c7361', marginBottom: '32px' }}>
            Sign in to open your library
          </p>
          <Suspense fallback={<div style={{ height: '160px', borderRadius: '12px', background: '#ede8df', animation: 'pulse 1.5s ease-in-out infinite' }} />}>
            <LoginForm />
          </Suspense>
          <p style={{ fontSize: '11px', color: '#aaa190', textAlign: 'center', marginTop: '32px', lineHeight: 1.5 }}>
            By signing in you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </div>
  );
}
