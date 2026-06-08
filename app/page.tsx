import Link from 'next/link'
import { FeatureCards } from './feature-cards'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f5f2ec', color: '#2a2620', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        .landing-book {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
          cursor: pointer;
        }
        .landing-book:hover {
          transform: translateY(-18px);
          box-shadow: 0 18px 32px -8px rgba(42,38,32,.35), inset -3px 0 6px rgba(0,0,0,.18);
        }
        .landing-hero-title { font-size: 58px; }
        .landing-hero-section { padding: 80px 40px 64px; }
        .landing-nav { padding: 18px 40px; }
        .landing-bookshelf { padding: 0 40px 64px; }
        .landing-features-section { padding: 64px 40px; max-width: 1080px; }
        .landing-how-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .landing-how-section { padding: 48px 40px 80px; max-width: 860px; }
        @media (max-width: 640px) {
          .landing-nav { padding: 14px 20px; }
          .landing-hero-title { font-size: 36px; }
          .landing-hero-section { padding: 48px 20px 40px; }
          .landing-bookshelf { padding: 0 20px 40px; }
          .landing-bookshelf .book-row { gap: 3px; }
          .landing-features-section { padding: 40px 20px; }
          .landing-how-grid { grid-template-columns: 1fr; gap: 28px; }
          .landing-how-section { padding: 32px 20px 60px; }
        }
      `}</style>

      {/* Nav */}
      <nav className="landing-nav" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e6e0d4', background: '#f5f2ec' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '34px', height: '34px', background: '#b5462f', borderRadius: '6px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="4" width="2" height="10" rx="1" fill="white" opacity="0.9" />
              <rect x="7" y="2" width="2" height="14" rx="1" fill="white" />
              <rect x="11" y="5" width="2" height="9" rx="1" fill="white" opacity="0.75" />
              <rect x="15" y="3" width="1.5" height="12" rx="0.75" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '20px', color: '#2a2620' }}>Braindump</span>
        </div>
        <Link href="/home">
          <button style={{ background: '#b5462f', color: '#fff', border: 'none', borderRadius: '8px', padding: '9px 22px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 4px 10px -4px rgba(181,70,47,.5)', transition: 'opacity 0.15s' }}>
            Open App
          </button>
        </Link>
      </nav>

      {/* Hero */}
      <section className="landing-hero-section" style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '4px', textTransform: 'uppercase', color: '#b5462f', marginBottom: '20px' }}>
          Knowledge Externalization Engine
        </p>
        <h1 className="landing-hero-title" style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, lineHeight: '1.08', color: '#2a2620', marginBottom: '24px', letterSpacing: '-0.5px' }}>
          Build a{' '}
          <em style={{ color: '#b5462f', fontStyle: 'italic' }}>library</em>
          {' '}of everything you learn
        </h1>
        <p style={{ fontSize: '19px', color: '#7c7361', lineHeight: '1.6', maxWidth: '540px', margin: '0 auto 36px', fontWeight: 400 }}>
          Capture knowledge from anywhere. Review with spaced repetition. Teach back to solidify understanding.
        </p>
        <Link href="/home">
          <button style={{ background: '#b5462f', color: '#fff', border: 'none', borderRadius: '10px', padding: '15px 36px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 8px 20px -6px rgba(181,70,47,.6)', transition: 'transform 0.15s', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            Start your library →
          </button>
        </Link>
      </section>

      {/* Bookshelf illustration */}
      <div className="landing-bookshelf" style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="book-row" style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', gap: '4px', padding: '0 16px' }}>
          {[
            { h: 130, grad: 'linear-gradient(160deg, #c97a4a, #a05a30)', title: 'Deep Work' },
            { h: 158, grad: 'linear-gradient(160deg, #6f8a5a, #4a6040)', title: 'Psychology' },
            { h: 142, grad: 'linear-gradient(160deg, #46557a, #2f3d5e)', title: 'Systems' },
            { h: 168, grad: 'linear-gradient(160deg, #c79a3e, #a07828)', title: 'Leadership' },
            { h: 136, grad: 'linear-gradient(160deg, #8a5072, #633858)', title: 'Design' },
            { h: 152, grad: 'linear-gradient(160deg, #5a6a7a, #3e4e5e)', title: 'Philosophy' },
            { h: 124, grad: 'linear-gradient(160deg, #c97a4a, #a05a30)', title: 'Science' },
          ].map((book, i) => (
            <div key={i} className="landing-book" style={{ position: 'relative', width: '42px', height: `${book.h}px`, background: book.grad, borderRadius: '3px 4px 4px 3px', boxShadow: 'inset -3px 0 6px rgba(0,0,0,.18), 2px 0 4px rgba(0,0,0,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {i === 3 && (
                <div style={{ position: 'absolute', top: 0, right: '6px', width: '8px', height: '28px', background: '#c79a3e', borderRadius: '0 0 3px 3px', boxShadow: '0 2px 4px rgba(0,0,0,.2)' }} />
              )}
              <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Inter', system-ui, sans-serif" }}>
                {book.title}
              </span>
            </div>
          ))}
          {/* shelf board */}
          <div style={{ position: 'absolute', bottom: '-12px', left: '-8px', right: '-8px', height: '12px', background: '#d8cdb8', borderRadius: '0 0 4px 4px', boxShadow: '0 4px 8px -2px rgba(42,38,32,.2)' }} />
        </div>
      </div>

      {/* Features */}
      <section className="landing-features-section" style={{ margin: '0 auto', width: '100%' }}>
        <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '32px', textAlign: 'center', marginBottom: '40px', color: '#2a2620' }}>
          Your complete learning system
        </h2>
        <FeatureCards />
      </section>

      {/* How it works */}
      <section className="landing-how-section" style={{ margin: '0 auto', width: '100%', textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '32px', marginBottom: '48px', color: '#2a2620' }}>
          How it works
        </h2>
        <div className="landing-how-grid">
          {[
            { n: '1', title: 'Capture the concept', desc: 'Paste a URL, article, or write a note. AI extracts and organises the key ideas.' },
            { n: '2', title: 'Review & reinforce', desc: 'Spaced repetition schedules the right moment to review — locking it into long-term memory.' },
            { n: '3', title: 'Apply your knowledge', desc: 'Use Express mode to articulate what you know, in interviews, conversations, or writing.' },
          ].map((step) => (
            <div key={step.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', border: '2px solid #b5462f', color: '#b5462f', fontFamily: "'Spectral', Georgia, serif", fontWeight: 700, fontSize: '22px', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                {step.n}
              </div>
              <h3 style={{ fontFamily: "'Spectral', Georgia, serif", fontWeight: 600, fontSize: '17px', color: '#2a2620' }}>
                {step.title}
              </h3>
              <p style={{ fontSize: '14px', color: '#7c7361', lineHeight: '1.55', maxWidth: '240px' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <div style={{ background: '#fff', borderTop: '1px solid #e6e0d4', padding: '48px 40px', textAlign: 'center' }}>
        <p style={{ fontFamily: "'Spectral', Georgia, serif", fontSize: '22px', color: '#2a2620', marginBottom: '20px', fontStyle: 'italic' }}>
          Ready to build your library?
        </p>
        <Link href="/home">
          <button style={{ background: '#b5462f', color: '#fff', border: 'none', borderRadius: '10px', padding: '13px 32px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', system-ui, sans-serif", boxShadow: '0 6px 16px -6px rgba(181,70,47,.6)' }}>
            Start your library →
          </button>
        </Link>
        <p style={{ fontSize: '12px', color: '#aaa190', marginTop: '32px' }}>
          Braindump · Knowledge externalization engine
        </p>
      </div>

    </div>
  )
}
