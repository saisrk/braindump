import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HUD Navigation */}
      <nav className="flex justify-between items-center px-7 py-4.5 border-b" style={{ borderBottomColor: 'rgba(0, 240, 255, 0.18)', position: 'relative', zIndex: 50 }}>
        <div className="flex items-center gap-3.25">
          {/* Diamond Logo */}
          <div 
            className="h-9 w-9 flex-shrink-0 border-2 relative flex items-center justify-center"
            style={{
              borderColor: '#00f0ff',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 16px #00f0ff, inset 0 0 10px rgba(0, 240, 255, 0.3)',
            }}
          >
            <div 
              className="w-2 h-2"
              style={{
                background: '#00f0ff',
                boxShadow: '0 0 8px #00f0ff',
                transform: 'rotate(-45deg)',
              }}
            />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-foreground" style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: '20px', letterSpacing: '5px' }}>
            BRAINDUMP
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button 
              className="px-5.5 py-2.75 text-xs font-semibold transition-all duration-200 hover:text-background group"
              style={{
                fontFamily: 'Chakra Petch',
                fontWeight: 600,
                fontSize: '13px',
                letterSpacing: '2px',
                border: '1px solid #00f0ff',
                color: '#00f0ff',
                background: 'rgba(0, 240, 255, 0.06)',
                cursor: 'pointer',
              }}
            >
              OPEN APP
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 md:py-28 text-center relative">
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(900px 600px at 70% -5%, rgba(0, 240, 255, 0.08), transparent 60%)',
          }}
        />
        
        <div className="relative z-10 max-w-2xl mx-auto px-7">
          <p className="text-xs tracking-widest text-success uppercase mb-6" style={{ fontFamily: 'Share Tech Mono', fontSize: '12px', letterSpacing: '5px', color: '#00ff9c' }}>
            // COGNITION SYSTEM ONLINE
          </p>
          
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6" style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: '62px', letterSpacing: '1px', lineHeight: '1.04', textShadow: '0 0 40px rgba(0, 240, 255, 0.3)' }}>
            REMEMBER{' '}
            <span className="text-primary" style={{ color: '#00f0ff', textShadow: '0 0 24px #00f0ff' }}>
              EVERYTHING
            </span>
            {' '}YOU LEARN
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 font-medium" style={{ fontSize: '21px', color: '#5e93a0', fontWeight: 500, maxWidth: '600px', margin: '0 auto 36px' }}>
            Capture knowledge from anywhere, review with AI-powered spaced repetition, and express your learnings with confidence.
          </p>
          
          <Link href="/home">
            <button 
              className="px-10 py-4 text-base font-bold tracking-wide text-background inline-flex items-center gap-3 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #7af6ff)',
                boxShadow: '0 0 30px -4px #00f0ff',
                fontFamily: 'Chakra Petch',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '3px',
                padding: '16px 38px',
                color: '#021014',
                cursor: 'pointer',
              }}
            >
              START LEARNING
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          
          <p className="text-xs tracking-widest text-muted-foreground mt-10" style={{ fontFamily: 'Share Tech Mono', fontSize: '11px', letterSpacing: '3px', color: '#274b54', marginTop: '40px' }}>
            [ CAPTURE ] [ REVIEW ] [ TEACH BACK ] [ EXPRESS ]
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-7">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h3 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: '34px', letterSpacing: '1px' }}>YOUR COMPLETE LEARNING SYSTEM</h3>
            <p className="text-lg text-muted-foreground" style={{ color: '#5e93a0', fontSize: '17px' }}>Four powerful tools working together to help you learn, retain, and apply knowledge.</p>
          </div>
          
          <div className="grid gap-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
            {[
              { icon: '⚡', title: 'QUICK CAPTURE', desc: 'Paste URLs, write notes, or upload files. AI instantly summarizes and organizes your learnings.' },
              { icon: '💎', title: 'SMART REVIEW', desc: 'Spaced repetition flashcards adapt to your memory. Review at the perfect moment to never forget.' },
              { icon: '🎯', title: 'TEACH BACK', desc: 'Explain concepts in your own words. AI evaluates your understanding and identifies gaps.' },
              { icon: '✨', title: 'EXPRESS MODE', desc: 'Turn your library into polished outputs — talking points, interview stories, LinkedIn bios, and more. In seconds.' },
            ].map((feat, i) => (
              <div 
                key={i}
                style={{
                  border: '1px solid rgba(0, 240, 255, 0.18)',
                  background: 'rgba(4, 18, 24, 0.62)',
                  backdropFilter: 'blur(8px)',
                  padding: '24px 20px 26px',
                  position: 'relative',
                }}
              >
                {/* Corner brackets */}
                <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '14px', height: '14px', border: '2px solid #00f0ff', borderRight: 'none', borderBottom: 'none' }} />
                <div style={{ position: 'absolute', top: '-1px', right: '-1px', width: '14px', height: '14px', border: '2px solid #00f0ff', borderLeft: 'none', borderBottom: 'none' }} />
                
                <div style={{ fontSize: '22px', marginBottom: '18px', color: '#00f0ff', width: '46px', height: '46px', display: 'grid', placeItems: 'center', border: '1px solid rgba(0, 240, 255, 0.4)', background: 'rgba(0, 240, 255, 0.05)' }}>
                  {feat.icon}
                </div>
                <h4 style={{ fontFamily: 'Chakra Petch', fontWeight: 600, fontSize: '18px', marginBottom: '8px', letterSpacing: '0.5px', color: '#cdf6ff' }}>
                  {feat.title}
                </h4>
                <p style={{ fontSize: '15px', color: '#5e93a0', lineHeight: '1.5' }}>
                  {feat.desc}
                </p>
                <div style={{ position: 'absolute', bottom: '-1px', left: '-1px', width: '14px', height: '14px', border: '2px solid #00f0ff', borderRight: 'none', borderTop: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '14px', height: '14px', border: '2px solid #00f0ff', borderLeft: 'none', borderTop: 'none' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Express Showcase */}
      <section className="py-16 px-7" style={{ background: 'rgba(4,18,24,0.4)', borderTop: '1px solid rgba(0,240,255,0.10)', borderBottom: '1px solid rgba(0,240,255,0.10)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest mb-3" style={{ fontFamily: 'Share Tech Mono', fontSize: '11px', letterSpacing: '4px', color: '#00ff9c' }}>
              // EXPRESS MODE
            </p>
            <h3 className="text-4xl font-bold mb-3" style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: '34px', letterSpacing: '1px' }}>
              KNOWLEDGE YOU CAN <span style={{ color: '#00f0ff', textShadow: '0 0 18px #00f0ff' }}>ACTUALLY USE</span>
            </h3>
            <p style={{ color: '#5e93a0', fontSize: '17px', maxWidth: '560px', margin: '0 auto' }}>
              Most people capture knowledge and never touch it again. Express turns your library into polished outputs — right when you need them.
            </p>
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {[
              {
                icon: '◉',
                color: '#b5462f',
                name: 'Talking Points',
                trigger: 'Before a presentation, meeting, or podcast',
                gain: 'Walk in knowing exactly what to say. Your learnings become sharp, sequenced claims you can speak to confidently — no notes needed.',
              },
              {
                icon: '★',
                color: '#c79a3e',
                name: 'STAR Stories',
                trigger: 'Before a job interview or performance review',
                gain: 'Turn abstract knowledge into interview-ready stories. Every answer follows the Situation-Task-Action-Result format recruiters expect.',
              },
              {
                icon: '◈',
                color: '#46557a',
                name: 'Profile Summary',
                trigger: 'Updating your LinkedIn bio, speaker bio, or CV',
                gain: 'A crisp paragraph showing what you know, not just what you\'ve done. Positions you as someone who actively builds expertise.',
              },
              {
                icon: '▦',
                color: '#6f8a5a',
                name: 'Learning Summary',
                trigger: 'Sharing with your team or writing a newsletter',
                gain: 'A structured write-up your colleagues can read — the kind of internal post that makes you look like a thought leader, written in seconds.',
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid rgba(0,240,255,0.14)',
                  background: 'rgba(4,18,24,0.7)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '4px',
                  padding: '24px',
                  position: 'relative',
                }}
              >
                <div style={{ position: 'absolute', top: '-1px', left: '-1px', width: '12px', height: '12px', border: '2px solid #00f0ff', borderRight: 'none', borderBottom: 'none' }} />
                <div style={{ position: 'absolute', bottom: '-1px', right: '-1px', width: '12px', height: '12px', border: '2px solid #00f0ff', borderLeft: 'none', borderTop: 'none' }} />

                <div className="flex items-start gap-4">
                  <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: f.color, display: 'grid', placeItems: 'center', fontSize: '18px', color: '#fff', flexShrink: 0 }}>
                    {f.icon}
                  </div>
                  <div>
                    <h4 style={{ fontFamily: 'Chakra Petch', fontWeight: 600, fontSize: '16px', color: '#cdf6ff', marginBottom: '4px' }}>
                      {f.name}
                    </h4>
                    <p style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px', color: f.color, marginBottom: '10px', fontFamily: 'Share Tech Mono' }}>
                      {f.trigger}
                    </p>
                    <p style={{ fontSize: '14px', color: '#5e93a0', lineHeight: '1.6' }}>
                      {f.gain}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <p style={{ color: '#5e93a0', fontSize: '14px' }}>
              Pick a format, choose which shelves to draw from, and Express does the rest.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-7">
        <div className="max-w-6xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-10" style={{ fontFamily: 'Chakra Petch', fontWeight: 700, fontSize: '34px', letterSpacing: '1px' }}>HOW IT WORKS</h3>
          
          <div className="grid gap-6" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '44px' }}>
            {[
              { num: '1', title: 'CAPTURE', desc: 'Save articles, notes, or ideas. AI extracts the key concepts automatically.' },
              { num: '2', title: 'REVIEW', desc: 'Practice with spaced repetition. The app schedules reviews at the optimal time.' },
              { num: '3', title: 'APPLY', desc: 'Use Express mode to articulate your knowledge when it matters most.' },
            ].map((step, i) => (
              <div key={i} style={{ textAlign: 'center', position: 'relative' }}>
                <div 
                  style={{
                    width: '58px',
                    height: '58px',
                    border: '2px solid #00f0ff',
                    borderRadius: '50%',
                    fontSize: '22px',
                    fontFamily: 'Chakra Petch',
                    fontWeight: 700,
                    color: '#00f0ff',
                    boxShadow: '0 0 22px -4px #00f0ff',
                    background: 'rgba(0, 240, 255, 0.05)',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  {step.num}
                </div>
                <h4 style={{ fontFamily: 'Chakra Petch', fontWeight: 600, fontSize: '19px', marginBottom: '8px', color: '#cdf6ff' }}>
                  {step.title}
                </h4>
                <p style={{ color: '#5e93a0', fontSize: '15px', lineHeight: '1.5', maxWidth: '280px', margin: '0 auto' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-center px-7 mb-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-xs tracking-widest text-success uppercase mb-4" style={{ fontFamily: 'Share Tech Mono', fontSize: '12px', letterSpacing: '5px', color: '#00ff9c' }}>
            READY TO START?
          </p>
          <Link href="/home">
            <button 
              className="px-10 py-4 text-base font-bold tracking-wide text-background inline-flex items-center gap-3 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #7af6ff)',
                boxShadow: '0 0 30px -4px #00f0ff',
                fontFamily: 'Chakra Petch',
                fontWeight: 700,
                fontSize: '15px',
                letterSpacing: '3px',
                padding: '16px 38px',
                color: '#021014',
                cursor: 'pointer',
              }}
            >
              GET STARTED
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
