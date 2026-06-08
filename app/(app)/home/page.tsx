'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Flame, BookOpen, Brain, CheckCircle2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { getDashboardStats } from '@/lib/actions/insights'
import { topicGradient } from '@/lib/book-colors'

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
    getDashboardStats()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
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

  const consistencyPct = Math.min(100, Math.round((data.streak / 30) * 100))

  const recentTopics = [
    { topic: 'REST APIs', status: '3 of 5 cards · due today' },
    { topic: 'Transformers', status: 'summary ready' },
    { topic: 'React Hooks', status: 'mastered' },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">
            Today, {format(new Date(), 'MMM d')}
          </p>
          <h1 className="font-display font-bold text-foreground" style={{ fontSize: '28px' }}>
            Good {getTimeOfDay()}, Learner
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Your reading progress today</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 mb-8">
          <StatCard icon={<Flame className="h-6 w-6" style={{ color: '#b5462f' }} />} value={data.streak} label="Day Streak" />
          <StatCard icon={<Brain className="h-6 w-6" style={{ color: '#46557a' }} />} value={data.todayLearnings} label="Read Today" />
          <StatCard icon={<CheckCircle2 className="h-6 w-6" style={{ color: '#6f8a5a' }} />} value={data.due} label="To Revisit" />
          <StatCard icon={<BookOpen className="h-6 w-6" style={{ color: '#c79a3e' }} />} value={data.total} label="Volumes" />
        </div>

        {/* Quick actions */}
        <p className="font-display font-semibold text-foreground mb-3">Quick actions</p>
        <Link href="/capture" className="block mb-6">
          <button
            className="w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold py-4 transition-all hover:-translate-y-0.5"
            style={{ background: '#b5462f', boxShadow: '0 8px 16px -8px rgba(181,70,47,.6)' }}
          >
            <Plus className="h-5 w-5" />
            Shelve a new learning
          </button>
        </Link>

        {/* Reading consistency */}
        <p className="font-display font-semibold text-foreground mb-3">Reading consistency</p>
        <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">This month</p>
            <p className="font-display font-bold text-3xl" style={{ color: '#b5462f' }}>{consistencyPct}%</p>
          </div>
          <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${consistencyPct}%`, background: 'linear-gradient(90deg,#c97a4a,#b5462f)' }}
            />
          </div>
        </div>

        {/* Continue reading */}
        {data.total > 0 && (
          <>
            <p className="font-display font-semibold text-foreground mb-3">Continue reading</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentTopics.map((item) => (
                <Link key={item.topic} href="/library" className="no-underline">
                  <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow">
                    <div
                      className="w-8 h-12 rounded flex-shrink-0"
                      style={{ background: topicGradient(item.topic), boxShadow: 'inset -2px 0 4px rgba(0,0,0,.2)' }}
                    />
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">{item.topic}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.status}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center text-center">
      <div className="mb-2">{icon}</div>
      <p className="font-display font-bold text-3xl text-foreground">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground mt-1">{label}</p>
    </div>
  )
}

function getTimeOfDay() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}
