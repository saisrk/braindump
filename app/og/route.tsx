import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: '#f5f2ec',
          padding: '64px 80px',
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Warm texture overlay */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #f5f2ec 0%, #ede8df 100%)', display: 'flex' }} />

        {/* Content */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '48px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#b5462f', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: '18px' }}>B</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '22px', color: '#2a2620', letterSpacing: '-0.5px' }}>Braindump</span>
          </div>

          {/* Main headline */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <p style={{ fontSize: '18px', fontWeight: 600, color: '#b5462f', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'Georgia, serif' }}>
              Knowledge externalization engine
            </p>
            <h1 style={{ fontSize: '72px', fontWeight: 700, color: '#2a2620', lineHeight: 1.05, margin: '0 0 24px', letterSpacing: '-1px' }}>
              Read it once.{'\n'}
              <span style={{ color: '#b5462f' }}>Remember it</span>{' '}forever.
            </h1>
            <p style={{ fontSize: '24px', color: '#7c7361', lineHeight: 1.5, maxWidth: '680px', margin: 0 }}>
              Capture → AI flashcards → spaced repetition → Express your knowledge
            </p>
          </div>

          {/* Bottom: mini book spines */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: '40px' }}>
            {[
              { h: 80, bg: 'linear-gradient(160deg,#c97a4a,#b5462f)' },
              { h: 64, bg: 'linear-gradient(160deg,#7a9e68,#5a7a4a)' },
              { h: 88, bg: 'linear-gradient(160deg,#5c6e99,#3d4f72)' },
              { h: 72, bg: 'linear-gradient(160deg,#d4a843,#b5892a)' },
              { h: 80, bg: 'linear-gradient(160deg,#9e6080,#7a4060)' },
              { h: 60, bg: 'linear-gradient(160deg,#c97a4a,#b5462f)' },
              { h: 76, bg: 'linear-gradient(160deg,#5c6e99,#3d4f72)' },
            ].map((b, i) => (
              <div key={i} style={{ width: '28px', height: `${b.h}px`, background: b.bg, borderRadius: '2px 4px 4px 2px', boxShadow: 'inset 2px 0 0 rgba(255,255,255,.2)', display: 'flex' }} />
            ))}
            <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', color: '#aaa190', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Free to start · No credit card needed</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
