import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { FeatureCards } from './feature-cards'

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

const SPINE_COLORS = [
  'linear-gradient(160deg,#c97a4a,#b5462f)',
  'linear-gradient(160deg,#7a9e68,#5a7a4a)',
  'linear-gradient(160deg,#5c6e99,#3d4f72)',
  'linear-gradient(160deg,#d4a843,#b5892a)',
  'linear-gradient(160deg,#9e6080,#7a4060)',
]

const BOOK_TITLES = ['Attention Mechanisms', 'System Design', 'Decision Making', 'React Patterns', 'Leadership']
const BOOK_HEIGHTS = [140, 118, 152, 126, 136]

function HeroShelf() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', padding: '16px 20px 0', background: `linear-gradient(180deg, ${BG}, #ede8df)`, borderRadius: '12px 12px 0 0', border: `1px solid ${RULE}`, borderBottom: 'none' }}>
        {BOOK_TITLES.map((title, i) => (
          <div key={i} className="ld-book" style={{
            width: '38px', height: `${BOOK_HEIGHTS[i]}px`,
            background: SPINE_COLORS[i],
            borderRadius: '2px 5px 5px 2px',
            boxShadow: 'inset 3px 0 0 rgba(255,255,255,.18), inset -4px 0 8px rgba(0,0,0,.22)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
            overflow: 'hidden', position: 'relative', cursor: 'pointer',
          }}>
            {i === 2 && (
              <div style={{ position: 'absolute', top: 0, right: '5px', width: '7px', height: '22px', background: '#c79a3e', borderRadius: '0 0 3px 3px' }} />
            )}
            <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontSize: '7px', fontWeight: 700, fontFamily: F, color: 'rgba(255,255,255,.8)', letterSpacing: '0.5px', padding: '0 4px', textAlign: 'center', overflow: 'hidden', maxHeight: '90%' }}>{title}</span>
          </div>
        ))}
        <div style={{ width: '38px', height: '96px', border: `2px dashed ${RULE}`, borderRadius: '4px', display: 'grid', placeItems: 'center', color: FAINT, fontSize: '18px' }}>+</div>
      </div>
      <div style={{ height: '14px', background: 'linear-gradient(180deg,#c8b99a,#b8a888)', borderRadius: '0 0 6px 6px', boxShadow: '0 4px 12px -4px rgba(42,38,32,.3)', border: `1px solid ${RULE}`, borderTop: 'none' }} />

      {/* ── Express output placeholder — swap with a real screenshot ── */}
      <div style={{ marginTop: '20px', background: CARD, border: `1px solid ${RULE}`, borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px -8px rgba(42,38,32,.18)' }}>
        {/* card header */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${RULE}`, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', background: '#6f8a5a', borderRadius: '7px', display: 'grid', placeItems: 'center', fontSize: '13px' }}>✨</div>
          <div>
            <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#6f8a5a', lineHeight: 1 }}>Express · STAR Story</p>
            <p style={{ fontFamily: F, fontSize: '11px', color: FAINT, marginTop: '2px' }}>from "Deep Work" + "System Design"</p>
          </div>
        </div>
        {/* body — placeholder for real screenshot */}
        <div style={{ padding: '14px 16px', position: 'relative' }}>
          {/* placeholder overlay — remove this div and drop in <Image> to swap */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'rgba(245,242,236,.82)', backdropFilter: 'blur(2px)', zIndex: 2, borderRadius: '0 0 12px 12px' }}>
            <span style={{ fontSize: '20px' }}>🖼</span>
            <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 600, color: FAINT, letterSpacing: '1px', textTransform: 'uppercase' }}>Screenshot placeholder</p>
            <p style={{ fontFamily: F, fontSize: '11px', color: FAINT }}>Replace with real Express output</p>
          </div>
          {/* blurred preview content underneath */}
          {[
            { label: 'Situation', text: 'Led backend architecture for a high-traffic search feature serving 2M daily requests…' },
            { label: 'Task', text: 'Reduce p99 latency below 200ms without a full rewrite…' },
            { label: 'Action', text: 'Applied deep-work scheduling to eliminate context switches, then systematically profiled…' },
            { label: 'Result', text: 'Reduced latency by 64%. Presented at eng all-hands and promoted to tech lead…' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <span style={{ fontFamily: F, fontSize: '10px', fontWeight: 700, color: TERRACOTTA, minWidth: '58px', paddingTop: '1px' }}>{row.label}</span>
              <p style={{ fontFamily: F, fontSize: '12px', color: INK2, lineHeight: 1.5, margin: 0 }}>{row.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK }}>
      <style>{`
        .ld-book {
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease;
        }
        .ld-book:hover {
          transform: translateY(-18px);
          box-shadow: 0 18px 32px -8px rgba(42,38,32,.35), inset -3px 0 6px rgba(0,0,0,.18) !important;
        }
        .hero-grid  { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; }
        .price-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 700px; margin: 0 auto; }
        .nav-link   { font-family: ${F}; font-size: 14px; font-weight: 500; color: ${INK2}; text-decoration: none; transition: color 0.15s; }
        .nav-link:hover { color: ${INK}; }
        @media (max-width: 768px) {
          .hero-grid  { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-visual{ display: none !important; }
          .price-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column; align-items: flex-start !important; }
          .hero-h1    { font-size: 36px !important; }
          .nav-links  { display: none !important; }
        }
        #demo, #features, #pricing { scroll-margin-top: 64px; }
      `}</style>

      {/* ── Nav ── */}
      <nav style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', padding: '0 32px', height: '60px', borderBottom: `1px solid ${RULE}`, background: BG, position: 'sticky', top: 0, zIndex: 50 }}>
        {/* Logo — left */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: TERRACOTTA, display: 'grid', placeItems: 'center' }}>
            <svg width="16" height="16" viewBox="0 0 18 18" fill="none">
              <rect x="3" y="4" width="2" height="10" rx="1" fill="white" opacity="0.9" />
              <rect x="7" y="2" width="2" height="14" rx="1" fill="white" />
              <rect x="11" y="5" width="2" height="9" rx="1" fill="white" opacity="0.75" />
              <rect x="15" y="3" width="1.5" height="12" rx="0.75" fill="white" opacity="0.6" />
            </svg>
          </div>
          <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: INK }}>Braindump</span>
        </Link>
        {/* Section links — center */}
        <div className="nav-links" style={{ display: 'flex', gap: '32px' }}>
          <a href="#demo" className="nav-link">How it works</a>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
        {/* Auth — right */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Link href="/login" style={{ fontFamily: F, fontSize: '14px', fontWeight: 600, color: INK2, textDecoration: 'none' }}>Log in</Link>
          <Link href="/signup">
            <button style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 10px -4px rgba(181,70,47,.5)' }}>
              Get started free
            </button>
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-grid" style={{ maxWidth: '1100px', margin: '0 auto', padding: '72px 32px 56px' }}>
        <div>
          <p style={{ fontFamily: F, fontSize: '14px', fontWeight: 600, color: INK2, marginBottom: '16px' }}>
            For people who read a lot and want to show for it — in interviews, at work, everywhere.
          </p>
          <h1 className="hero-h1" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '52px', lineHeight: 1.08, color: INK, marginBottom: '20px' }}>
            Read it once.<br />
            <span style={{ color: TERRACOTTA }}>Actually retain</span><br />
            what matters.
          </h1>
          <p style={{ fontFamily: F, fontSize: '17px', color: INK2, lineHeight: 1.65, marginBottom: '32px', maxWidth: '440px' }}>
            Paste a URL or note. Braindump extracts key ideas, builds flashcards, and schedules reviews — then turns your library into talking points, STAR stories, and interview answers on demand.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <Link href="/signup">
              <button style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '14px 28px', borderRadius: '10px', border: 'none', background: TERRACOTTA, color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '15px', cursor: 'pointer', boxShadow: '0 8px 24px -8px rgba(181,70,47,.55)' }}>
                Start for free <ArrowRight style={{ width: '16px', height: '16px' }} />
              </button>
            </Link>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', padding: '14px 24px', borderRadius: '10px', border: `1px solid ${RULE}`, background: CARD, color: INK2, fontFamily: F, fontWeight: 600, fontSize: '15px', textDecoration: 'none' }}>
              Log in
            </Link>
          </div>
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

        <div className="hero-visual" style={{ display: 'flex', flexDirection: 'column' }}>
          <HeroShelf />
        </div>
      </section>

      {/* ── Demo / How it works ── */}
      <section id="demo" style={{ background: CARD, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: '72px 32px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '52px' }}>
            <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>How it works</p>
            <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: INK }}>From reading to ready — in four steps</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              {
                n: '01',
                color: TERRACOTTA,
                title: 'Capture anything',
                body: 'Paste a URL, drop in raw notes, or type a concept. AI reads it, pulls out the key ideas, and stores everything in your personal library — organised by topic.',
                aside: (
                  <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '10px', padding: '14px 16px', fontSize: '13px', fontFamily: F, color: INK2 }}>
                    <p style={{ fontWeight: 600, color: INK, marginBottom: '6px' }}>🔗 medium.com/deep-work-summary</p>
                    <p style={{ color: '#6f8a5a', fontWeight: 600, fontSize: '11px', letterSpacing: '1px', marginBottom: '8px' }}>✓ 6 key ideas extracted · 8 flashcards generated</p>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {['Focus', 'Deep Work', 'Productivity'].map(t => (
                        <span key={t} style={{ background: CARD, border: `1px solid ${RULE}`, borderRadius: '4px', padding: '2px 8px', fontSize: '11px', color: INK2 }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                n: '02',
                color: '#c79a3e',
                title: 'Review at the right moment',
                body: 'Spaced repetition surfaces each card just before your memory fades. A few minutes a day is all it takes to move knowledge from short-term to long-term.',
                aside: (
                  <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '10px', padding: '14px 16px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{ position: 'absolute', top: 0, right: '8px', width: '7px', height: '22px', background: '#c79a3e', borderRadius: '0 0 3px 3px' }} />
                      <p style={{ fontFamily: SERIF, fontSize: '13px', fontWeight: 600, color: INK, marginBottom: '10px', lineHeight: 1.4, paddingRight: '20px' }}>What makes "deep work" different from ordinary focus?</p>
                    </div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                      {[['Again', TERRACOTTA], ['Hard', '#9c7a23'], ['Good', '#46557a'], ['Easy', '#4f6b3a']].map(([l, c]) => (
                        <div key={l} style={{ flex: 1, border: `1px solid ${c}`, color: c, borderRadius: '6px', padding: '4px 0', fontSize: '11px', fontWeight: 700, textAlign: 'center', fontFamily: F }}>{l}</div>
                      ))}
                    </div>
                  </div>
                ),
              },
              {
                n: '03',
                color: '#46557a',
                title: 'Prove you know it',
                body: 'Type an explanation in your own words. AI scores your comprehension, tells you what you nailed, and surfaces the gaps — so you actually close them.',
                aside: (
                  <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '10px', padding: '14px 16px', fontFamily: F, fontSize: '12px' }}>
                    <p style={{ color: INK2, lineHeight: 1.5, marginBottom: '10px', fontStyle: 'italic' }}>"Deep work is concentrating on a cognitively demanding task without switching contexts…"</p>
                    <div style={{ background: 'rgba(111,138,90,.1)', border: '1px solid rgba(111,138,90,.3)', borderRadius: '7px', padding: '9px 12px' }}>
                      <p style={{ fontWeight: 700, color: '#4f6b3a', marginBottom: '3px' }}>✓ 84% comprehension</p>
                      <p style={{ color: INK2 }}>Gap: mention the Newport scheduling framework.</p>
                    </div>
                  </div>
                ),
              },
              {
                n: '04',
                color: '#6f8a5a',
                title: 'Express it on demand',
                body: 'Pick a format — talking points, STAR story, LinkedIn bio. Braindump pulls from your library and generates polished output in seconds, ready to use in interviews or writing.',
                aside: (
                  <div style={{ background: BG, border: `1px solid ${RULE}`, borderRadius: '10px', padding: '14px 16px', fontFamily: F, fontSize: '12px' }}>
                    <p style={{ fontWeight: 700, color: '#6f8a5a', marginBottom: '10px', fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>✨ STAR Story · generated</p>
                    {[['Situation', 'Led architecture for a 2M-req/day search feature…'], ['Task', 'Cut p99 latency below 200ms without a rewrite…'], ['Action', 'Applied deep-work blocks, profiled bottlenecks…'], ['Result', 'Latency down 64%. Promoted to tech lead.']].map(([l, t]) => (
                      <div key={l} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 700, color: TERRACOTTA, minWidth: '56px', fontSize: '11px', paddingTop: '1px' }}>{l}</span>
                        <span style={{ color: INK2, lineHeight: 1.5 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                ),
              },
            ].map((step, idx) => (
              <div key={step.n} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center', padding: '40px 0', borderTop: idx > 0 ? `1px solid ${RULE}` : 'none' }}>
                <div style={{ order: idx % 2 === 0 ? 0 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '13px', color: step.color, letterSpacing: '1px' }}>{step.n}</span>
                    <div style={{ height: '1px', width: '24px', background: step.color, opacity: 0.4 }} />
                  </div>
                  <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '22px', color: INK, marginBottom: '12px', lineHeight: 1.2 }}>{step.title}</h3>
                  <p style={{ fontFamily: F, fontSize: '15px', color: INK2, lineHeight: 1.7 }}>{step.body}</p>
                </div>
                <div style={{ order: idx % 2 === 0 ? 1 : 0 }}>
                  {step.aside}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features (interactive accordion) ── */}
      <section id="features" style={{ background: BG, borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, padding: '72px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase', color: TERRACOTTA, marginBottom: '12px' }}>Features</p>
            <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', color: INK }}>Every tool in the loop — try them live</h2>
          </div>
          <FeatureCards />
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: '72px 32px' }}>
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
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '6px' }}>
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '36px', color: INK }}>$8</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: INK2 }}>/mo</span>
              <span style={{ fontFamily: F, fontSize: '11px', fontWeight: 700, background: 'rgba(181,70,47,.12)', color: TERRACOTTA, borderRadius: '4px', padding: '2px 6px', marginLeft: '4px' }}>save 33%</span>
            </div>
            <p style={{ fontFamily: F, fontSize: '13px', fontWeight: 500, color: INK2, marginBottom: '20px' }}>
              Billed annually ($96/yr) — or $12/mo month-to-month.
            </p>
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
      <section style={{ background: CARD, borderTop: `1px solid ${RULE}`, padding: '80px 32px', textAlign: 'center' }}>
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
