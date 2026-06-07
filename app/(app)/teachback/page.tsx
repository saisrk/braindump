'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { submitTeachBack } from '@/lib/actions/teachback'
import type { TeachBackFeedback } from '@/lib/ai/teachback'

type TeachbackStep = 'intro' | 'input' | 'result'

export default function TeachbackPage() {
  const router = useRouter()
  const [step, setStep] = useState<TeachbackStep>('intro')
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null)
  // Mock learning ID - in a real app this would be passed or extracted from route
  const mockLearningId = 'learning-1'

  const handleSubmit = async () => {
    if (!explanation.trim()) return
    setLoading(true)
    try {
      const result = await submitTeachBack({
        learningId: mockLearningId,
        explanation,
      })
      if (result.ok && result.feedback) {
        setFeedback(result.feedback)
        setStep('result')
      }
    } catch (error) {
      console.error('[v0] Teachback failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          title="Teach Back"
          subtitle="Explain what you learned in your own words"
          className="mb-4"
        />
        {step === 'intro' && (
          <div className="max-w-2xl">
            <Card className="p-8 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  Teach Back Method
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  The best way to learn is to teach. Explain what you just learned in your own words as if you&apos;re teaching someone else. This reinforces your understanding and helps us identify gaps.
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Explain the concept</p>
                    <p className="text-xs text-muted-foreground">In your own words, like you&apos;re teaching a friend</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Get AI feedback</p>
                    <p className="text-xs text-muted-foreground">We&apos;ll review your explanation and suggest improvements</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Schedule for review</p>
                    <p className="text-xs text-muted-foreground">We&apos;ll add it to your spaced repetition schedule</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => setStep('input')} className="w-full">
                Let&apos;s Begin
              </Button>
            </Card>
          </div>
        )}

        {step === 'input' && (
          <div className="max-w-2xl">
            <Card className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Your Explanation
                </label>
                <Textarea
                  placeholder="Explain what you learned. Be thorough and detailed..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={8}
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('intro')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={loading || !explanation.trim()}
                  className="flex-1"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Get Feedback
                </Button>
              </div>
            </Card>
          </div>
        )}

        {step === 'result' && feedback && (
          <div className="max-w-2xl space-y-6">
            <Card className={`p-6 border-l-4 ${
              feedback.verdict === 'strong' ? 'border-l-success bg-success/5' :
              feedback.verdict === 'partial' ? 'border-l-warning bg-warning/5' :
              'border-l-danger bg-danger/5'
            }`}>
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${
                  feedback.verdict === 'strong' ? 'text-success' :
                  feedback.verdict === 'partial' ? 'text-warning' :
                  'text-danger'
                }`} />
                <div>
                  <h3 className="font-semibold text-foreground">
                    {feedback.verdict === 'strong' && 'Excellent Teach Back!'}
                    {feedback.verdict === 'partial' && 'Good Effort!'}
                    {feedback.verdict === 'shaky' && 'Keep Learning!'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comprehension: {feedback.gapScore}%
                  </p>
                </div>
              </div>
              
              <p className="text-sm text-foreground italic mb-4">
                {feedback.encouragement}
              </p>

              {feedback.nailed.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">What you got right:</p>
                  <ul className="space-y-1">
                    {feedback.nailed.map((item, idx) => (
                      <li key={idx} className="text-xs text-foreground flex gap-2">
                        <span>✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.gaps.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-foreground mb-2">Areas to improve:</p>
                  <ul className="space-y-1">
                    {feedback.gaps.map((item, idx) => (
                      <li key={idx} className="text-xs text-foreground flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feedback.followUpQuestions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Next steps:</p>
                  <ul className="space-y-1">
                    {feedback.followUpQuestions.map((q, idx) => (
                      <li key={idx} className="text-xs text-foreground flex gap-2">
                        <span>Q:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => router.push('/library')}
                className="flex-1"
              >
                View Library
              </Button>
              <Button onClick={() => router.push('/home')} className="flex-1">
                Back to Home
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
