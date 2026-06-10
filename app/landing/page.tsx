import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Braindump — Remember everything you learn',
  description: 'Capture an article or note, get AI flashcards in seconds, review with spaced repetition, and turn your knowledge into talking points or interview stories. Free to start.',
  openGraph: {
    title: 'Braindump — Remember everything you learn',
    description: 'Capture articles & notes → AI flashcards → spaced repetition → Express your knowledge. The complete learning loop.',
    url: 'https://braindump.app',
    siteName: 'Braindump',
    images: [{ url: '/og', width: 1200, height: 630, alt: 'Braindump — Remember everything you learn' }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Braindump — Remember everything you learn',
    description: 'Capture articles & notes → AI flashcards → spaced repetition → Express your knowledge.',
    images: ['/og'],
  },
}

const F = "'Inter', system-ui, sans-serif"
const SERIF = "'Spectral', Georgia, serif"

const TERRACOTTA = '#b5462f'
const INK = '#2a2620'
const INK2 = '#7c7361'
const FAINT = '#aaa190'
const RULE = '#e6e0d4'
const BG = '#f5f2ec'
const CARD = '#ffffff'

// Deterministic book spine colours (mirrors lib/book-colors.ts)
const SPINE_COLORS = [
  'linear-gradient(160deg,#c97a4a,#b5462f)',
  'linear-gradient(160deg,#7a9e68,#5a7a4a)',
  'linear-gradient(160deg,#5c6e99,#3d4f72)',
  'linear-gradient(160deg,#d4a843,#b5892a)',
  'linear-gradient(160deg,#9e6080,#7a4060)',
]

function NavBar() {
  return (
    <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', height: '60px', borderBottom: `1px solid ${RULE}`, background: BG, position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: TERRACOTTA, display: 'grid', placeItems: 'center' }}>
          <span style={{ color: '#fff', fontFamily: SERIF, fontWeight: 700, fontSize: '14px' }}>B</span>
        </div>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: INK }}>Braindump</span>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <Link href="/login" style={{ fontFamily: F, fontSize: '14px', fontWeight: 600, color: INK2, textDecoration: 'none' }}>Log in</Link>
        <Link href="/signup">
          <button style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
            Get started free
          </button>
        </Link>
      </div>
    </nav>
  )
}

function MiniShelf() {
  const titles = ['Attention Mechanisms', 'System Design', 'Decision Making', 'React Patterns', 'Leadership']
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '16px 20px 0', background: 'linear-gradient(180deg, #f5f2ec, #ede8df)', borderRadius: '12px 12px 0 0', border: `1px solid ${RULE}`, borderBottom: 'none' }}>
      {titles.map((title, i) => (
        <div key={i} style={{
          width: '38px', height: `${[140, 118, 152, 126, 136][i]}px`,
          background: SPINE_COLORS[i],
          borderRadius: '2px 5px 5px 2px',
          boxShadow: 'inset 3px 0 0 rgba(255,255,255,.18), inset -4px 0 8px rgba(0,0,0,.22)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          overflow: 'hidden', position: 'relative', cursor: 'pointer',
          transition: 'transform 0.15s ease',
        }}>
          <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '7px', fontWeight: 700, fontFamily: F, color: 'rgba(255,255,255,.8)', letterSpacing: '0.5px', padding: '0 4px', textAlign: 'center', overflow: 'hidden', maxHeight: '90%' }}>{title}</span>
        </div>
      ))}
      {/* + slot */}
      <div style={{ width: '38px', height: '96px', border: `2px dashed ${RULE}`, borderRadius: '4px', display: 'grid', placeItems: 'center', color: FAINT, fontSize: '18px' }}>+</div>
    </div>
  )
}

function ShelfBoard() {
  return <div style={{ height: '14px', background: 'linear-gradient(180deg,#c8b99a,#b8a888)', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 12px -4px rgba(42,38,32,.3)', border: `1px solid ${RULE}`, borderTop: 'none' }} />
}

function FlashCard({ question, answer, color }: { question: string; answer: string; color: string }) {
  return (
    <div style={{ background: CARD, borderRadius: '10px', border: `1px solid ${RULE}`, padding: '18px 20px', boxShadow: '0 4px 16px -8px rgba(42,38,32,.2)' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', alignItems: 'flex-start' }}>
        <div style={{ width: '4px', flexShrink: 0, borderRadius: '2px', background: color, alignSelf: 'stretch', minHeight: '16px' }} />
        <p style={{ fontFamily: SERIF, fontSize: '14px', fontWeight: 600, color: INK, lineHeight: 1.4 }}>{question}</p>
      </div>
      <p style={{ fontFamily: F, fontSize: '13px', color: INK2, lineHeight: 1.6, paddingLeft: '12px' }}>{answer}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK }}>
      <style>{`
        .hero-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .how-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
        .feat-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        .price-grid{ display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 700px; margin: 0 auto; }
        .mini-shelf { display: flex; }
        @media (max-width: 768px) {
          .hero-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual{ display: none !important; }
          .how-grid   { grid-template-columns: repeat(2,1fr) !important; gap: 24px !important; }
          .feat-grid  { grid-template-columns: 1fr !important; }
          .price-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column; align-items: flex-start !important; }
          .hero-h1    { font-size: 36px !important; }
        }
        @media (max-width: 480px) {
          .how-grid   { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <NavBar />

      {/* ── Hero ── */}
      <section className="hero-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px 56px' }}>
        <div>
          <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '16px' }}>
            Knowledge externalization engine
          </p>
          <h1 className="hero-h1" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '48px', lineHeight: 1.08, color: INK, marginBottom: '20px' }}>
            Read it once.<br />
            <span style={{ color: TERRACOTTA }}>Remember it</span><br />
            forever.
          </h1>
          <p style={{ fontFamily: F, fontSize: '17px', color: INK2, lineHeight: 1.65, marginBottom: '32px', maxWidth: '440px' }}>
            Paste any URL or note. Braindump extracts the key ideas, builds flashcards, and schedules reviews so you never forget — then turns your knowledge into talking points or interview stories on demand.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <Link href="/signup">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', border: 'none', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 24px -8px rgba(181,70,47,.55)', transition: 'transform 0.1s ease' }}>
                Start for free <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 24px', borderRadius: '10px', border: `1px solid ${RULE}`, background: CARD, color: INK2, fontFamily: F, fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Log in
            </Link>
          </div>
          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <p style={{ fontFamily: F, fontSize: '12px', color: FAINT }}>
              <strong style={{ color: INK2 }}>Free</strong> · No credit card needed
            </p>
            <span style={{ color: RULE }}>·</span>
            <p style={{ fontFamily: F, fontSize: '12px', color: FAINT }}>
              <strong style={{ color: INK2 }}>5</strong> captures/day on free tier
            </p>
          </div>
        </div>

        {/* Hero visual — mini bookshelf + flash card */}
        <div className="hero-visual" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <MiniShelf />
          <ShelfBoard />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <FlashCard question="What is spaced repetition?" answer="A learning technique that schedules reviews at increasing intervals just before you would forget — maximising retention per unit of study time." color={TERRACOTTA} />
            <FlashCard question="What does Braindump's Express mode do?" answer="Converts your captured learnings into polished outputs: talking points, STAR stories, LinkedIn bios, and team summaries." color="#c79a3e" />
          </div>
        </div>
      </section>

      {/* ── How it works (3 steps) ── */}
      <section style={{ background: CARD, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: '64px 32px' }}>
        <div style={{ maxWidth: '860px', margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>How it works</p>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: INK, marginBottom: '48px' }}>From reading to remembering in 4 steps</h2>
          <div className="how-grid">
            {[
              { n: '1', title: 'Capture', body: 'Paste a URL, article, or your own notes. AI reads it and extracts key ideas.', color: TERRACOTTA },
              { n: '2', title: 'Review', body: 'Spaced-repetition flashcards surface at the perfect moment — a few minutes a day keeps everything fresh.', color: '#c79a3e' },
              { n: '3', title: 'Prove it', body: 'Teach the concept back in your own words. AI grades your understanding and closes the gaps.', color: '#46557a' },
              { n: '4', title: 'Express', body: 'Turn your library into talking points, interview stories, or LinkedIn bios — in seconds.', color: '#6f8a5a' },
            ].map((s) => (
              <div key={s.n} style={{ textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.color, display: 'grid', placeItems: 'center', margin: '0 auto 16px', color: '#fff', fontFamily: SERIF, fontWeight: 700, fontSize: '20px' }}>{s.n}</div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '17px', color: INK, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontFamily: F, fontSize: '14px', color: INK2, lineHeight: 1.6 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Feature grid ── */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>Everything you need</p>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: INK }}>Your complete learning system</h2>
        </div>
        <div className="feat-grid">
          {[
            { icon: '⚡', color: '#c97a4a', title: 'Instant capture', body: 'Paste any URL, article, or raw note. AI summarises the content, extracts up to 8 key points, and generates review flashcards — automatically.' },
            { icon: '🔁', color: '#46557a', title: 'Spaced repetition', body: 'SM-2 algorithm schedules each card for exactly the right moment. Cards you know return less often; shaky ones come back sooner.' },
            { icon: '▣', color: '#6f8a5a', title: 'Teach-back loop', body: 'Explain the concept in your own words. AI identifies what you nailed, what you missed, and asks follow-up questions to close the gap.' },
            { icon: '✨', color: TERRACOTTA, title: 'Express mode', body: 'Select a shelf, pick a format (talking points, STAR story, LinkedIn bio, team summary), and get polished output in seconds.' },
          ].map((f) => (
            <div key={f.title} style={{ background: CARD, border: `1px solid ${RULE}`, borderRadius: '14px', padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: f.color, display: 'grid', placeItems: 'center', fontSize: '20px', flexShrink: 0 }}>{f.icon}</div>
              <div>
                <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: INK, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontFamily: F, fontSize: '14px', color: INK2, lineHeight: 1.65 }}>{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section style={{ background: CARD, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: '72px 32px' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center', marginBottom: '48px' }}>
          <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>Pricing</p>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: INK, marginBottom: '12px' }}>Start free. Upgrade when you&apos;re ready.</h2>
          <p style={{ fontFamily: F, fontSize: '16px', color: INK2 }}>No credit card needed to start.</p>
        </div>
        <div className="price-grid">
          {/* Free */}
          <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '16px', padding: '28px' }}>
            <p style={{ fontFamily: F, fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: INK2, marginBottom: '12px' }}>Free</p>
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: INK }}>$0</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: INK2, marginLeft: '6px' }}>forever</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {['5 captures / day', 'AI summaries & key points', 'Spaced repetition reviews', 'Teach-back loop', '1 free Express generation'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '9px', fontFamily: F, fontSize: '14px', color: INK2, alignItems: 'flex-start' }}>
                  <Check style={{ width: '14px', height: '14px', color: '#6f8a5a', flexShrink: 0, marginTop: '2px' }} />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid ${RULE}`, background: CARD, color: INK2, fontFamily: F, fontWeight: 600, fontSize: '14px', textDecoration: 'none', textAlign: 'center' }}>
              Get started free
            </Link>
          </div>
          {/* Pro */}
          <div style={{ background: CARD, border: `2px solid ${TERRACOTTA}`, borderRadius: '16px', padding: '28px', position: 'relative', boxShadow: '0 12px 32px -12px rgba(181,70,47,.2)' }}>
            <div style={{ position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '10px', letterSpacing: '1px', padding: '4px 12px', borderRadius: '99px', whiteSpace: 'nowrap' }}>
              BEST VALUE
            </div>
            <p style={{ fontFamily: F, fontWeight: 700, fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>Pro</p>
            <div style={{ marginBottom: '4px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: INK }}>$8</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: INK2, marginLeft: '6px' }}>/mo</span>
            </div>
            <p style={{ fontFamily: F, fontSize: '12px', color: FAINT, marginBottom: '20px' }}>Billed $96/yr · or $12/mo monthly</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {['Unlimited captures', 'Everything in Free', 'Unlimited Express generations', 'Priority AI processing', 'Early access to new features'].map((f) => (
                <li key={f} style={{ display: 'flex', gap: '9px', fontFamily: F, fontSize: '14px', color: INK, alignItems: 'flex-start' }}>
                  <Check style={{ width: '14px', height: '14px', color: TERRACOTTA, flexShrink: 0, marginTop: '2px' }} />{f}
                </li>
              ))}
            </ul>
            <Link href="/signup" style={{ display: 'block', width: '100%', padding: '12px', borderRadius: '10px', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '14px', textDecoration: 'none', textAlign: 'center', boxShadow: '0 6px 16px -6px rgba(181,70,47,.5)' }}>
              Start free, upgrade anytime
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ── */}
      <section style={{ padding: '80px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: INK, lineHeight: 1.15, marginBottom: '16px' }}>
            Start building your<br />knowledge library today.
          </h2>
          <p style={{ fontFamily: F, fontSize: '16px', color: INK2, marginBottom: '32px' }}>
            Free forever. No credit card required.
          </p>
          <Link href="/signup">
            <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '16px 36px', borderRadius: '12px', border: 'none', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 10px 28px -8px rgba(181,70,47,.55)' }}>
              Get started — it&apos;s free <ArrowRight style={{ width: '18px', height: '18px' }} />
            </button>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="footer-inner" style={{ borderTop: `1px solid ${RULE}`, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '15px', color: INK }}>Braindump</span>
        <p style={{ fontFamily: F, fontSize: '12px', color: FAINT }}>Knowledge externalization engine · {new Date().getFullYear()}</p>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/login" style={{ fontFamily: F, fontSize: '13px', color: INK2, textDecoration: 'none' }}>Log in</Link>
          <Link href="/signup" style={{ fontFamily: F, fontSize: '13px', color: TERRACOTTA, fontWeight: 600, textDecoration: 'none' }}>Sign up</Link>
        </div>
      </footer>
    </div>
  )
}
