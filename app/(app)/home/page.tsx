'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Flame, BookOpen, Brain, CheckCircle2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats } from '@/lib/actions/insights'

interface DashboardData {
  streak: number
  todayLearnings: number
  due: number
  total: number
}

export default function HomePage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const stats = await getDashboardStats()
        setData(stats)
      } catch (error) {
        console.error('[v0] Failed to load dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data) {
    return (
      <EmptyState
        icon={<Brain className="h-12 w-12" />}
        title="Dashboard unavailable"
        description="There was an error loading your dashboard."
      />
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          title={`Today, ${format(new Date(), 'MMM d')}`}
          subtitle="Your learning progress for today"
          className="mb-4"
        />
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6 mb-8">
          {/* Streak */}
          <Card className="flex flex-col items-center justify-center p-4 md:p-6">
            <Flame className="h-8 w-8 text-orange-500 mb-2" />
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {data.streak}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              Day Streak
            </div>
          </Card>

          {/* Learned Today */}
          <Card className="flex flex-col items-center justify-center p-4 md:p-6">
            <Brain className="h-8 w-8 text-blue-500 mb-2" />
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {data.todayLearnings}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              Learned Today
            </div>
          </Card>

          {/* Due for Review */}
          <Card className="flex flex-col items-center justify-center p-4 md:p-6">
            <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {data.due}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              Due for Review
            </div>
          </Card>

          {/* Total */}
          <Card className="flex flex-col items-center justify-center p-4 md:p-6">
            <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
            <div className="text-3xl md:text-4xl font-bold text-foreground">
              {data.total}
            </div>
            <div className="text-xs md:text-sm text-muted-foreground text-center">
              Total Learnings
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <Link href="/capture" className="no-underline">
              <Button className="w-full" size="lg">
                <Plus className="mr-2 h-4 w-4" />
                New Learning
              </Button>
            </Link>
            {data.due > 0 && (
              <Link href="/review" className="no-underline">
                <Button variant="outline" className="w-full" size="lg">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Review Now ({data.due})
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Insights Section */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Progress</h2>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Consistency Score</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {Math.round((data.streak / 30) * 100)}%
                </p>
              </div>
              <Badge>
                {data.streak >= 7 ? 'On Fire!' : data.streak >= 3 ? 'Keep it up!' : 'Build it up!'}
              </Badge>
            </div>
          </Card>
        </div>
      </div>
      </div>
    </div>
  )
}
