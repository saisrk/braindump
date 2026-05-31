'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle2, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { getReviewItems } from '@/lib/actions/insights'
import { gradeReviewItem } from '@/lib/actions/review'
import type { DueReviewItem } from '@/lib/data/reviews'

export default function ReviewPage() {
  const router = useRouter()
  const [items, setItems] = useState<DueReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [showing, setShowing] = useState<'question' | 'answer'>('question')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getReviewItems()
        setItems(data)
      } catch (error) {
        console.error('[v0] Failed to load reviews:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-12 w-12" />}
        title="All caught up!"
        description="You have no items due for review right now."
        action={
          <Button onClick={() => router.push('/home')}>
            Back to Home
          </Button>
        }
      />
    )
  }

  const item = items[current]
  const progress = Math.round(((current + 1) / items.length) * 100)

  const handleRating = async (confidence: number) => {
    setReviewing(true)
    try {
      const gradeMap = { 1: 'hard', 2: 'good', 3: 'easy' } as const
      await gradeReviewItem({ itemId: item.id, grade: gradeMap[confidence as 1 | 2 | 3] })
      if (current < items.length - 1) {
        setCurrent(current + 1)
        setShowing('question')
      } else {
        router.push('/home')
      }
    } catch (error) {
      console.error('[v0] Review submission failed:', error)
    } finally {
      setReviewing(false)
    }
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Review Session"
        subtitle={`${current + 1} of ${items.length} items`}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Card */}
        <div className="max-w-2xl">
          <Card className="p-8 min-h-96 flex flex-col justify-center mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">
                {showing === 'question' ? 'Question' : 'Answer'}
              </p>
              <div className="text-2xl font-semibold text-foreground leading-relaxed">
                {showing === 'question' ? item.question : item.answer}
              </div>
            </div>
          </Card>

          {/* Reveal Button */}
          {showing === 'question' && (
            <Button
              variant="outline"
              onClick={() => setShowing('answer')}
              className="w-full mb-6"
              size="lg"
            >
              <HelpCircle className="mr-2 h-4 w-4" />
              Show Answer
            </Button>
          )}

          {/* Confidence Rating */}
          {showing === 'answer' && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                How confident are you in your answer?
              </p>
              <div className="grid grid-cols-3 gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleRating(1)}
                  disabled={reviewing}
                  className="flex flex-col items-center justify-center h-20"
                >
                  {reviewing && <Loader2 className="h-4 w-4 animate-spin mb-2" />}
                  <span className="text-xs text-muted-foreground">Not sure</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleRating(2)}
                  disabled={reviewing}
                  className="flex flex-col items-center justify-center h-20"
                >
                  {reviewing && <Loader2 className="h-4 w-4 animate-spin mb-2" />}
                  <span className="text-xs text-muted-foreground">Somewhat sure</span>
                </Button>
                <Button
                  onClick={() => handleRating(3)}
                  disabled={reviewing}
                  className="flex flex-col items-center justify-center h-20"
                >
                  {reviewing && <Loader2 className="h-4 w-4 animate-spin mb-2" />}
                  <span className="text-xs">Very sure</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
