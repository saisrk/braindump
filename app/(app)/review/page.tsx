'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { BookLoader } from '@/components/ui/book-loader'
import { getReviewItems } from '@/lib/actions/insights'
import { gradeReviewItem } from '@/lib/actions/review'
import type { DueReviewItem } from '@/lib/data/reviews'

const MIN_LOADER_MS = 2500

export default function ReviewPage() {
  const router = useRouter()
  const [items, setItems] = useState<DueReviewItem[]>([])
  const [loading, setLoading] = useState(true)
  const [current, setCurrent] = useState(0)
  const [showing, setShowing] = useState<'question' | 'answer'>('question')
  const [reviewing, setReviewing] = useState(false)

  useEffect(() => {
    const start = Date.now()
    getReviewItems()
      .then((data) => {
        const elapsed = Date.now() - start
        const delay = Math.max(0, MIN_LOADER_MS - elapsed)
        setTimeout(() => {
          setItems(data)
          setLoading(false)
        }, delay)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
          <BookLoader variant="review" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<CheckCircle2 className="h-12 w-12" />}
        title="All caught up!"
        description="You have no items due for review right now."
        action={<Button onClick={() => router.push('/home')}>Back to Home</Button>}
      />
    )
  }

  const item = items[current]
  const progress = Math.round(((current + 1) / items.length) * 100)

  const handleRating = async (grade: 'again' | 'hard' | 'good' | 'easy') => {
    setReviewing(true)
    try {
      await gradeReviewItem({ itemId: item.id, grade })
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
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Recall · {items.length} card{items.length !== 1 ? 's' : ''} due
          </p>
          <h1 className="font-display font-bold text-foreground" style={{ fontSize: '28px' }}>Smart Review</h1>
          <p className="text-sm text-muted-foreground mt-1">Recall before you reveal — pulled from your books</p>
        </div>

        {/* Flashcard */}
        <div className="flex justify-center mb-6">
          <div
            className="relative w-full max-w-xl rounded-2xl bg-card border border-border flex flex-col justify-center text-center"
            style={{ minHeight: '280px', padding: '40px 34px', boxShadow: '0 24px 60px -40px rgba(42,38,32,.5)' }}
          >
            {/* Gold corner bookmark */}
            <div
              className="absolute top-0 right-8 w-3.5 h-12 rounded-b"
              style={{ background: '#c79a3e', boxShadow: '0 3px 5px rgba(0,0,0,.2)' }}
            />

            <p className="absolute top-5 left-6 text-xs uppercase tracking-widest text-muted-foreground">
              {item.learningTitle} · Card {current + 1} of {items.length}
            </p>

            <div className="mt-6">
              <p className="font-display font-semibold text-foreground leading-snug" style={{ fontSize: '22px' }}>
                {showing === 'question' ? item.question : item.answer}
              </p>
            </div>

            {showing === 'question' && (
              <button
                onClick={() => setShowing('answer')}
                className="mt-6 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
              >
                ▸ tap to reveal answer
              </button>
            )}
          </div>
        </div>

        {/* Rating buttons — 4 grades */}
        {showing === 'answer' && (
          <div className="flex gap-3 justify-center max-w-xl mx-auto mb-6">
            {[
              { grade: 'again' as const, label: 'Again', sub: '<1m', color: '#b5462f' },
              { grade: 'hard' as const, label: 'Hard', sub: '10m', color: '#9c7a23' },
              { grade: 'good' as const, label: 'Good', sub: '1d', color: '#46557a' },
              { grade: 'easy' as const, label: 'Easy', sub: '4d', color: '#4f6b3a' },
            ].map(({ grade, label, sub, color }) => (
              <button
                key={grade}
                onClick={() => handleRating(grade)}
                disabled={reviewing}
                className="flex-1 rounded-xl border bg-card py-3 font-semibold text-sm transition-all hover:shadow-md disabled:opacity-50"
                style={{ borderColor: color, color }}
              >
                {label}
                <span className="block text-[10px] opacity-60 mt-0.5 font-normal">{sub}</span>
              </button>
            ))}
          </div>
        )}

        {/* Progress */}
        <div className="max-w-xl mx-auto text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
            Session progress · {current + 1} of {items.length}
          </p>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, background: '#b5462f' }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
