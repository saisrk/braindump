'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/ui/page-header'
import { BookLoader } from '@/components/ui/book-loader'
import { submitTeachBack } from '@/lib/actions/teachback'
import type { TeachBackFeedback } from '@/lib/ai/teachback'

const MIN_LOADER_MS = 2500

type TeachbackStep = 'intro' | 'input' | 'loading' | 'result'

function TeachbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const learningId = searchParams.get('learningId') ?? ''
  const [step, setStep] = useState<TeachbackStep>('intro')
  const [explanation, setExplanation] = useState('')
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null)
  const [limitError, setLimitError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (!explanation.trim()) return
    setLimitError(null)
    setStep('loading')
    const start = Date.now()
    try {
      const result = await submitTeachBack({ learningId, explanation })
      const elapsed = Date.now() - start
      const delay = Math.max(0, MIN_LOADER_MS - elapsed)
      setTimeout(() => {
        if (result.ok && result.feedback) {
          setFeedback(result.feedback)
          setStep('result')
        } else if (result.errorCode === 'pro_required') {
          setLimitError(result.error ?? 'Weekly teach-back limit reached.')
          setStep('input')
        } else {
          setStep('input')
        }
      }, delay)
    } catch (error) {
      console.error('[v0] Teachback failed:', error)
      setStep('input')
    }
  }

  const verdictColor = feedback?.verdict === 'strong' ? '#6f8a5a' : feedback?.verdict === 'partial' ? '#c79a3e' : '#b5462f'

  return (
    <>
      <PageHeader
        eyebrow="Teach Back"
        title="Explain what you learned"
        subtitle="In your own words, like you're teaching a friend"
        className="mb-6"
      />

      {step === 'intro' && (
        <div className="max-w-xl">
          <div className="rounded-xl border border-border bg-card p-8 space-y-6">
            <div>
              <h2 className="font-display font-semibold text-foreground text-xl mb-2">The Teach Back Method</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The best way to learn is to teach. Explain what you just learned as if teaching someone else. This reinforces understanding and helps identify gaps.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { n: '1', title: 'Explain the concept', desc: "In your own words, like you're teaching a friend" },
                { n: '2', title: 'Get AI feedback', desc: "We'll review your explanation and find gaps" },
                { n: '3', title: 'Schedule for review', desc: 'Added to your spaced repetition schedule' },
              ].map((s) => (
                <div key={s.n} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 grid place-items-center font-display font-bold flex-shrink-0"
                    style={{ borderColor: '#b5462f', color: '#b5462f' }}
                  >
                    {s.n}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{s.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setStep('input')}
              className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
              style={{ background: '#b5462f', boxShadow: '0 6px 14px -6px rgba(181,70,47,.6)' }}
            >
              Let&apos;s Begin
            </button>
          </div>
        </div>
      )}

      {step === 'loading' && <BookLoader variant="teachback" />}

      {step === 'input' && (
        <div className="max-w-xl">
          {limitError && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-start gap-3" style={{ background: 'rgba(181,70,47,0.10)', border: '1px solid rgba(181,70,47,0.35)' }}>
              <span className="text-base mt-0.5">🔒</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#b5462f' }}>Weekly limit reached</p>
                <p className="text-xs text-muted-foreground mt-0.5">{limitError}</p>
                <a href="/pricing" className="text-xs font-semibold mt-2 inline-block" style={{ color: '#b5462f' }}>Upgrade to Pro →</a>
              </div>
            </div>
          )}
          <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <label className="block font-display font-semibold text-foreground">Your Explanation</label>
            <Textarea
              placeholder="Explain what you learned. Be thorough and detailed…"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={8}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setStep('intro')}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!explanation.trim()}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white disabled:opacity-50 transition-all"
                style={{ background: '#b5462f' }}
              >
                Get Feedback
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 'result' && feedback && (
        <div className="max-w-xl space-y-4">
          <div
            className="rounded-xl border-l-4 p-6"
            style={{ borderLeftColor: verdictColor, background: `${verdictColor}08`, borderTop: '1px solid var(--color-border)', borderRight: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}
          >
            <div className="flex items-start gap-3 mb-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: verdictColor }} />
              <div>
                <h3 className="font-display font-semibold text-foreground">
                  {feedback.verdict === 'strong' ? 'Excellent Teach Back!' : feedback.verdict === 'partial' ? 'Good Effort!' : 'Keep Learning!'}
                </h3>
                <p className="text-xs text-muted-foreground">Comprehension: {feedback.gapScore}%</p>
              </div>
            </div>
            <p className="font-display italic text-sm text-foreground mb-4">{feedback.encouragement}</p>

            {feedback.nailed.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-foreground mb-2">What you got right:</p>
                <ul className="space-y-1">{feedback.nailed.map((item, i) => <li key={i} className="text-xs text-foreground flex gap-2"><span style={{ color: '#6f8a5a' }}>✓</span>{item}</li>)}</ul>
              </div>
            )}
            {feedback.gaps.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-foreground mb-2">Areas to improve:</p>
                <ul className="space-y-1">{feedback.gaps.map((item, i) => <li key={i} className="text-xs text-foreground flex gap-2"><span>•</span>{item}</li>)}</ul>
              </div>
            )}
            {feedback.followUpQuestions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground mb-2">Next steps:</p>
                <ul className="space-y-1">{feedback.followUpQuestions.map((q, i) => <li key={i} className="text-xs text-foreground flex gap-2"><span>Q:</span>{q}</li>)}</ul>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push('/library')}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              View Library
            </button>
            <button
              onClick={() => router.push('/home')}
              className="flex-1 rounded-lg py-2.5 text-sm font-semibold text-white transition-all"
              style={{ background: '#b5462f' }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default function TeachbackPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <Suspense fallback={<BookLoader variant="teachback" />}>
          <TeachbackContent />
        </Suspense>
      </div>
    </div>
  )
}
