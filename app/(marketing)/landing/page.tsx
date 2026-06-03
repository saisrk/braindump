import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* HUD Navigation */}
      <nav className="flex justify-between items-center px-7 py-5 border-b border-border sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {/* Diamond Logo */}
          <div 
            className="h-9 w-9 flex-shrink-0 border-2 border-primary relative flex items-center justify-center"
            style={{
              transform: 'rotate(45deg)',
              boxShadow: '0 0 16px rgba(0, 240, 255, 0.3), inset 0 0 10px rgba(0, 240, 255, 0.1)',
            }}
          >
            <div 
              className="w-2 h-2 bg-primary"
              style={{
                boxShadow: '0 0 8px rgba(0, 240, 255, 0.6)',
                transform: 'rotate(-45deg)',
              }}
            />
          </div>
          <h1 className="text-base font-bold tracking-wider text-foreground" style={{ fontFamily: 'Chakra Petch' }}>
            BRAINDUMP
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button 
              className="px-6 py-2.5 text-xs font-semibold tracking-wide border border-primary text-primary hover:bg-primary hover:text-background transition-all duration-200"
              style={{
                background: 'rgba(0, 240, 255, 0.06)',
                fontFamily: 'Chakra Petch',
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
          <p className="text-xs tracking-widest text-success uppercase mb-6" style={{ fontFamily: 'Share Tech Mono' }}>
            // COGNITION SYSTEM ONLINE
          </p>
          
          <h2 className="text-5xl md:text-6xl font-bold text-foreground leading-tight tracking-tight mb-6" style={{ fontFamily: 'Chakra Petch' }}>
            REMEMBER{' '}
            <span className="text-primary" style={{ textShadow: '0 0 24px rgba(0, 240, 255, 0.6)' }}>
              EVERYTHING
            </span>
            {' '}YOU LEARN
          </h2>
          
          <p className="text-lg text-muted-foreground mb-10 font-medium">
            Capture knowledge from anywhere, review with AI-powered spaced repetition, and express your learnings with confidence.
          </p>
          
          <Link href="/home">
            <button 
              className="px-10 py-4 text-base font-bold tracking-wide text-background inline-flex items-center gap-3 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #6af0ff)',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
                fontFamily: 'Chakra Petch',
              }}
            >
              START LEARNING
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
          
          <p className="mt-8 text-xs tracking-widest text-muted-foreground" style={{ fontFamily: 'Share Tech Mono' }}>
            [ CAPTURE ] · [ REVIEW ] · [ TEACH BACK ] · [ EXPRESS ]
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-7 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4" style={{ fontFamily: 'Chakra Petch' }}>
              YOUR COMPLETE LEARNING SYSTEM
            </h2>
            <p className="text-muted-foreground text-lg">
              Four powerful tools working together to help you learn, retain, and apply knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: '⚡', title: 'QUICK CAPTURE', desc: 'Paste URLs, write notes, or upload files. AI instantly summarizes and organizes your learnings.' },
              { icon: '◆', title: 'SMART REVIEW', desc: 'Spaced repetition flashcards adapt to your memory. Review at the perfect moment to never forget.' },
              { icon: '■', title: 'TEACH BACK', desc: 'Explain concepts in your own words. AI evaluates your understanding and identifies gaps.' },
              { icon: '✦', title: 'EXPRESS MODE', desc: 'Generate talking points, STAR stories, or profile summaries from your captured knowledge.' },
            ].map((feat, i) => (
              <div 
                key={i}
                className="relative border border-border bg-card p-6 transition-all hover:border-primary/50"
                style={{
                  background: 'rgba(6, 22, 28, 0.62)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary" style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }} />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary" style={{ boxShadow: '0 0 10px rgba(0, 240, 255, 0.2)' }} />
                
                <p className="text-2xl mb-3">{feat.icon}</p>
                <h4 className="font-bold tracking-wide text-foreground mb-2" style={{ fontFamily: 'Chakra Petch' }}>
                  {feat.title}
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
                <p className="absolute top-4 right-4 text-xs text-muted-foreground" style={{ fontFamily: 'Share Tech Mono' }}>
                  0{i + 1}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-7 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4" style={{ fontFamily: 'Chakra Petch' }}>
              HOW IT WORKS
            </h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to transform how you learn and retain information.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'CAPTURE', desc: 'Save articles, notes, or ideas. AI extracts key insights and creates review cards.' },
              { num: '2', title: 'REVIEW', desc: 'Practice with spaced repetition. The app schedules reviews at optimal intervals.' },
              { num: '3', title: 'APPLY', desc: 'Use Express mode to articulate your knowledge in interviews, meetings, or content.' },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div 
                  className="h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center text-xl font-bold border-2 border-primary"
                  style={{
                    color: '#00f0ff',
                    background: 'rgba(0, 240, 255, 0.05)',
                    boxShadow: '0 0 22px rgba(0, 240, 255, 0.2)',
                  }}
                >
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2 tracking-wide" style={{ fontFamily: 'Chakra Petch' }}>
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-7">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4 tracking-tight" style={{ fontFamily: 'Chakra Petch' }}>
            START BUILDING YOUR KNOWLEDGE TODAY
          </h2>
          <p className="text-muted-foreground mb-8 text-lg">
            Join learners who are capturing, retaining, and expressing their knowledge with Braindump.
          </p>
          <Link href="/home">
            <button 
              className="px-10 py-4 text-base font-bold tracking-wide text-background inline-flex items-center gap-3 transition-all duration-200 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #00f0ff, #6af0ff)',
                boxShadow: '0 0 30px rgba(0, 240, 255, 0.4)',
                fontFamily: 'Chakra Petch',
              }}
            >
              GET STARTED
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto px-7">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold tracking-wider text-foreground" style={{ fontFamily: 'Chakra Petch' }}>
              BRAINDUMP
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built for learners who want to remember everything.
          </p>
        </div>
      </footer>
    </div>
  )
}
