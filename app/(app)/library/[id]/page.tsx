import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { getLearning } from '@/lib/data/learnings'
import { LearningDetailClient } from './client'

export default async function LearningDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  try {
    const result = await getLearning('', id)
    if (!result) {
      redirect('/library')
    }

    const { learning, reviewItems, teachBacks } = result
    const reviewCount = reviewItems?.length ?? 0
    const teachBackCount = teachBacks?.length ?? 0

    return (
      <div className="flex flex-col">
        <PageHeader
          title={learning.title}
          subtitle={learning.topic ? `Topic: ${learning.topic}` : 'Your learning'}
        />

        <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
          <div className="max-w-2xl space-y-6">
            <LearningDetailClient
              learning={learning}
              reviewCount={reviewCount}
              teachBackCount={teachBackCount}
              learningId={id}
            />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('[v0] Failed to load learning:', error)
    redirect('/library')
  }
}
