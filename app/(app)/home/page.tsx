'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Brain, Clock, Sparkles, CheckCircle2, Plus, BookOpen } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { getDashboardStats, type DashboardData, type VolumeStatus } from '@/lib/actions/insights'
import { DashboardTour } from '@/components/dashboard-tour'
import { StreakCard } from '@/components/streak-card'
import { topicGradient } from '@/lib/book-colors'

const F = "'Inter', system-ui, sans-serif"
const SERIF = "'Spectral', Georgia, serif"

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
        <div className="text-muted-foreground text-sm" style={{ fontFamily: F }}>Loading…</div>
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

  const firstName = data.userName?.split(' ')[0] ?? 'there'

  return (
    <div className="flex flex-col h-full">
      {!data.tourSeen && <DashboardTour />}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-10 md:px-8">

        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ fontFamily: F, color: 'var(--color-muted-foreground)' }}>
            {format(new Date(), 'EEEE, MMM d').toUpperCase()}
          </p>
          <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '32px', lineHeight: 1.15, color: 'var(--color-foreground)', margin: 0 }}>
            Welcome back, {firstName}
          </h1>
          <p className="mt-1" style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)' }}>
            You&apos;ve shelved {data.total} learning{data.total !== 1 ? 's' : ''} across {data.topicCount} volume{data.topicCount !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Streak + stats row */}
        <div
          className="mb-6"
          style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '12px' }}
        >
          <StreakCard
            current={data.streak}
            longest={data.longestStreak}
            freezeTokens={data.freezeTokens}
            activeToday={data.streakActiveToday}
            history={data.streakHistory}
            initialShareToken={data.shareToken}
          />

          {/* Library card */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <BookOpen size={16} style={{ color: '#b5462f' }} />
              <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Your library</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '44px', lineHeight: 1, color: 'var(--color-foreground)' }}>{data.total}</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', fontWeight: 500 }}>learnings</span>
            </div>
            {/* Topic colour bars */}
            {data.topTopics.length > 0 && (
              <>
                <div className="flex gap-1.5 mb-2">
                  {data.topTopics.map(({ topic, color }) => (
                    <div
                      key={topic}
                      style={{ flex: 1, height: '4px', borderRadius: '2px', background: color }}
                    />
                  ))}
                </div>
                <p style={{ fontFamily: F, fontSize: '11px', color: 'var(--color-muted-foreground)' }}>
                  {data.topTopics.map(t => t.topic).join(' · ')}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div
          className="mb-6"
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}
        >
          {/* Mastered */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Brain size={16} style={{ color: '#46557a' }} />
              <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Mastered</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '44px', lineHeight: 1, color: 'var(--color-foreground)' }}>{data.masteredCount}</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)' }}>/ {data.total}</span>
            </div>
            <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)' }}>Fully taught back</p>
          </div>

          {/* Ready to revisit */}
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} style={{ color: '#6f8a5a' }} />
              <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>Ready to revisit</span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '44px', lineHeight: 1, color: 'var(--color-foreground)' }}>{data.due}</span>
              <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)' }}>due</span>
            </div>
            <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)' }}>
              {data.dueThisWeek > data.due ? `${data.dueThisWeek - data.due} more this week` : 'All caught up this week'}
            </p>
          </div>
        </div>

        {/* CTA row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <Link href="/capture" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', borderRadius: '14px', border: 'none', cursor: 'pointer',
                background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700,
                fontSize: '15px', padding: '16px', boxShadow: '0 6px 16px -6px rgba(181,70,47,.55)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Plus size={18} />
              Capture a learning
            </button>
          </Link>
          <Link href="/review" style={{ textDecoration: 'none' }}>
            <button
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '8px', borderRadius: '14px', border: '1px solid var(--color-border)',
                cursor: 'pointer', background: 'var(--color-card)', color: 'var(--color-foreground)',
                fontFamily: F, fontWeight: 700, fontSize: '15px', padding: '16px',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <CheckCircle2 size={18} style={{ color: '#6f8a5a' }} />
              Review {data.due > 0 ? `${data.due} due` : 'flashcards'}
            </button>
          </Link>
        </div>

        {/* Pick up where you left off */}
        {data.recentVolumes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 style={{ fontFamily: SERIF, fontWeight: 600, fontSize: '20px', color: 'var(--color-foreground)', margin: 0 }}>
                Pick up where you left off
              </h2>
              <Link href="/library" style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)', textDecoration: 'none' }}>
                All volumes →
              </Link>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
              {data.recentVolumes.map(vol => (
                <VolumeCard key={vol.id} vol={vol} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function VolumeCard({ vol }: { vol: VolumeStatus }) {
  const grad = topicGradient(vol.topic)
  const status = getVolumeStatus(vol)

  return (
    <Link href={`/library/${vol.id}`} style={{ textDecoration: 'none' }}>
      <div
        className="rounded-2xl overflow-hidden transition-all"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          cursor: 'pointer',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px -8px rgba(42,38,32,.15)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
        }}
      >
        {/* Book cover */}
        <div style={{ background: grad, padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <div
            style={{
              width: '44px', height: '58px', borderRadius: '4px', flexShrink: 0,
              background: 'rgba(255,255,255,0.18)',
              boxShadow: 'inset -3px 0 6px rgba(0,0,0,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {vol.confidence >= 80 && (
              <CheckCircle2 size={18} color="rgba(255,255,255,0.9)" />
            )}
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '15px', color: '#fff', margin: 0, lineHeight: 1.3 }} className="line-clamp-2">
              {vol.title}
            </p>
            <p style={{ fontFamily: F, fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: '3px 0 0', fontWeight: 500 }}>
              {vol.topic} volume
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: '3px', background: 'var(--color-border)' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, vol.confidence)}%`,
              background: status.barColor,
              transition: 'width 0.4s ease',
            }}
          />
        </div>

        {/* Status row */}
        <div style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {status.icon}
          <span style={{ fontFamily: F, fontSize: '12px', fontWeight: 600, color: status.color }}>
            {status.label}
          </span>
        </div>
      </div>
    </Link>
  )
}

function getVolumeStatus(vol: VolumeStatus): {
  label: string
  color: string
  barColor: string
  icon: React.ReactNode
} {
  if (vol.dueCount > 0) {
    return {
      label: `${vol.dueCount} of ${vol.totalCards} cards · due today`,
      color: '#b5462f',
      barColor: '#b5462f',
      icon: <Clock size={13} color="#b5462f" />,
    }
  }
  if (vol.confidence >= 80) {
    const days = vol.daysUntilNextReview
    return {
      label: days !== null ? `Mastered · revisit in ${days} day${days !== 1 ? 's' : ''}` : 'Mastered',
      color: '#6f8a5a',
      barColor: '#6f8a5a',
      icon: <CheckCircle2 size={13} color="#6f8a5a" />,
    }
  }
  if (vol.hasSummary) {
    return {
      label: 'Summary ready · express it',
      color: '#46557a',
      barColor: '#46557a',
      icon: <Sparkles size={13} color="#46557a" />,
    }
  }
  return {
    label: `${vol.totalCards} card${vol.totalCards !== 1 ? 's' : ''} · review when ready`,
    color: 'var(--color-muted-foreground)',
    barColor: '#c79a3e',
    icon: <BookOpen size={13} color="var(--color-muted-foreground)" />,
  }
}
