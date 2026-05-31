'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { getLearning } from '@/lib/data/learnings'
import type { Learning } from '@/db/schema'

interface LearningDetail {
  learning: Learning
  reviewCount: number
  teachBackCount: number
}

export default function LearningDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<LearningDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const result = await getLearning('', id)
        if (result) {
          setData({
            learning: result.learning,
            reviewCount: result.reviewItems?.length ?? 0,
            teachBackCount: result.teachBacks?.length ?? 0,
          })
        }
      } catch (error) {
        console.error('[v0] Failed to load learning:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground mb-4">Learning not found</p>
        <Button onClick={() => router.push('/library')}>Back to Library</Button>
      </div>
    )
  }

  const { learning, reviewCount, teachBackCount } = data

  return (
    <div className="flex flex-col">
      <PageHeader
        title={learning.title}
        subtitle={learning.topic ? `Topic: ${learning.topic}` : 'Your learning'}
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        <div className="max-w-2xl space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => router.push('/library')} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Library
          </Button>

          {/* Main Content */}
          <Card className="p-6">
            <div className="space-y-4">
              {learning.summary && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Summary</h3>
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {learning.summary}
                  </p>
                </div>
              )}

              {learning.tags && learning.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Tags</h3>
                  <div className="flex gap-2 flex-wrap">
                    {learning.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Reviews</p>
                  <p className="text-2xl font-bold text-foreground">{reviewCount}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Teach-backs</p>
                  <p className="text-2xl font-bold text-foreground">{teachBackCount}</p>
                </div>
              </div>

              {learning.sourceRef && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">Source</p>
                  <p className="text-sm text-foreground break-all font-mono">
                    {learning.sourceRef}
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Created {new Date(learning.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push(`/teachback?learningId=${id}`)} className="flex-1">
              Teach Back
            </Button>
            <Button onClick={() => router.push('/review')} className="flex-1">
              Review Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
