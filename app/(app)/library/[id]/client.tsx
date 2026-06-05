'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { learnings } from '@/db/schema'
import type { InferSelectModel } from 'drizzle-orm'

type Learning = InferSelectModel<typeof learnings>

interface LearningDetailClientProps {
  learning: Learning
  reviewCount: number
  teachBackCount: number
  learningId: string
}

export function LearningDetailClient({
  learning,
  reviewCount,
  teachBackCount,
  learningId,
}: LearningDetailClientProps) {
  const router = useRouter()

  return (
    <>
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
        <Button
          variant="outline"
          onClick={() => router.push(`/teachback?learningId=${learningId}`)}
          className="flex-1"
        >
          Teach Back
        </Button>
        <Button onClick={() => router.push('/review')} className="flex-1">
          Review Now
        </Button>
      </div>
    </>
  )
}
