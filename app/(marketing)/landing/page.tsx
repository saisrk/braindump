import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { 
  Brain, 
  Zap, 
  MessageSquare, 
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-foreground">Braindump</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground tracking-tight text-balance">
              Remember Everything You Learn
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
              Capture knowledge from anywhere, review with AI-powered spaced repetition, 
              and express your learnings with confidence.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="w-full sm:w-auto text-base px-8">
                  Start Learning Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              Your Complete Learning System
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Four powerful tools working together to help you learn, retain, and apply knowledge.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Quick Capture</h3>
              <p className="text-sm text-muted-foreground">
                Paste URLs, write notes, or upload files. AI instantly summarizes and organizes your learnings.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Smart Review</h3>
              <p className="text-sm text-muted-foreground">
                Spaced repetition flashcards adapt to your memory. Review at the perfect moment to never forget.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Teach Back</h3>
              <p className="text-sm text-muted-foreground">
                Explain concepts in your own words. AI evaluates your understanding and identifies gaps.
              </p>
            </Card>

            <Card className="p-6 bg-background border-border hover:border-primary/50 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">Express Mode</h3>
              <p className="text-sm text-muted-foreground">
                Generate talking points, STAR stories, or profile summaries from your captured knowledge.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
              Three simple steps to transform how you learn and retain information.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Capture</h3>
                <p className="text-sm text-muted-foreground">
                  Save articles, notes, or ideas. AI extracts key insights and creates review cards.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Review</h3>
                <p className="text-sm text-muted-foreground">
                  Practice with spaced repetition. The app schedules reviews at optimal intervals.
                </p>
              </div>

              <div className="text-center">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Apply</h3>
                <p className="text-sm text-muted-foreground">
                  Use Express mode to articulate your knowledge in interviews, meetings, or content.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  Built for Lifelong Learners
                </h2>
                <ul className="space-y-4">
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">AI-powered summaries save hours of note-taking</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">SM-2 algorithm proven to boost retention by 200%</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">Teach-back method identifies knowledge gaps</span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    <span className="text-foreground">Track your learning streak and consistency</span>
                  </li>
                </ul>
              </div>
              <Card className="p-8 bg-background">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-2xl">🔥</span>
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-foreground">30 day</p>
                      <p className="text-sm text-muted-foreground">Learning streak</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-foreground">127</p>
                      <p className="text-xs text-muted-foreground">Learnings captured</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-foreground">94%</p>
                      <p className="text-xs text-muted-foreground">Retention rate</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Start Building Your Knowledge Today
            </h2>
            <p className="text-muted-foreground mb-8">
              Join learners who are capturing, retaining, and expressing their knowledge with Braindump.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-base px-8">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Braindump</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for learners who want to remember everything.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
