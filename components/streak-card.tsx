'use client'

import { useState } from 'react'
import { Flame, Snowflake, Share2, Check, Link2 } from 'lucide-react'
import { enableStreakSharing, disableStreakSharing } from '@/lib/actions/streak-share'
import type { StreakDay } from '@/lib/actions/insights'

const F = "'Inter', system-ui, sans-serif"
const SERIF = "'Spectral', Georgia, serif"

const MILESTONES = [3, 7, 14, 30, 50, 100, 200, 365]

interface StreakCardProps {
  current: number
  longest: number
  freezeTokens: number
  activeToday: boolean
  history: StreakDay[]
  initialShareToken: string | null
}

function milestoneHint(current: number, longest: number): string {
  if (current === 0) return 'Capture or review something today to start a streak'
  if (current >= longest) return current === 1 ? 'Your streak begins' : 'Personal best — keep it alive'
  const next = MILESTONES.find((m) => m > current)
  if (next) {
    const away = next - current
    return `${away} day${away === 1 ? '' : 's'} to a ${next}-day streak`
  }
  const away = longest - current
  return `${away} day${away === 1 ? '' : 's'} to match your best`
}

export function StreakCard({
  current,
  longest,
  freezeTokens,
  activeToday,
  history,
  initialShareToken,
}: StreakCardProps) {
  const [shareToken, setShareToken] = useState<string | null>(initialShareToken)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/streak/${shareToken}`
    : null

  const handleShare = async () => {
    if (busy) return
    setBusy(true)
    try {
      let token = shareToken
      if (!token) {
        const res = await enableStreakSharing()
        if (!res.ok || !res.token) return
        token = res.token
        setShareToken(token)
      }
      const url = `${window.location.origin}/share/streak/${token}`
      const shareData = {
        title: 'My learning streak on Braindump',
        text: `I'm on a ${current}-day learning streak on Braindump 🔥`,
        url,
      }
      if (navigator.share) {
        try {
          await navigator.share(shareData)
          return
        } catch {
          // user cancelled or share failed — fall back to copy
        }
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[streak-card] share error:', err)
    } finally {
      setBusy(false)
    }
  }

  const handleRevoke = async () => {
    if (busy) return
    setBusy(true)
    try {
      await disableStreakSharing()
      setShareToken(null)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} style={{ color: '#b5462f' }} />
        <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>
          Learning streak
        </span>
        {freezeTokens > 0 && (
          <span
            className="ml-auto flex items-center gap-1"
            style={{
              fontFamily: F, fontSize: '11px', fontWeight: 600, color: '#46557a',
              background: 'rgba(70,85,122,0.1)', borderRadius: '99px', padding: '2px 8px',
            }}
            title={`${freezeTokens} freeze token${freezeTokens === 1 ? '' : 's'} — a skipped day won't break your streak`}
          >
            <Snowflake size={11} />
            {freezeTokens}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2 mb-1">
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '44px', lineHeight: 1, color: 'var(--color-foreground)' }}>
          {current}
        </span>
        <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', fontWeight: 500 }}>
          day{current === 1 ? '' : 's'}
        </span>
        <span style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', marginLeft: 'auto' }}>
          Longest: {longest}
        </span>
      </div>

      <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', marginBottom: '12px' }}>
        {milestoneHint(current, longest)}
      </p>

      {/* 14-day activity strip */}
      <div className="flex gap-1 mb-4" aria-label="Last 14 days of activity">
        {history.map((d, i) => {
          const isToday = i === history.length - 1
          return (
            <div
              key={d.date}
              title={`${d.date}${d.active ? ' · active' : ''}`}
              style={{
                flex: 1,
                height: '22px',
                borderRadius: '4px',
                background: d.active ? '#b5462f' : 'var(--color-border)',
                opacity: d.active ? (isToday ? 1 : 0.85) : 0.4,
                border: isToday ? '1.5px solid #b5462f' : '1.5px solid transparent',
                boxSizing: 'border-box',
              }}
            />
          )
        })}
      </div>

      {/* Share controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleShare}
          disabled={busy}
          style={{
            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            borderRadius: '10px', border: 'none', cursor: busy ? 'wait' : 'pointer',
            background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '13px',
            padding: '10px', opacity: busy ? 0.7 : 1,
          }}
        >
          {copied ? <Check size={15} /> : <Share2 size={15} />}
          {copied ? 'Link copied' : shareToken ? 'Share streak' : 'Share my streak'}
        </button>
        {shareToken && (
          <button
            onClick={handleRevoke}
            disabled={busy}
            title="Stop sharing — makes your public streak link private again"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '10px', border: '1px solid var(--color-border)', cursor: busy ? 'wait' : 'pointer',
              background: 'var(--color-card)', color: 'var(--color-muted-foreground)',
              padding: '10px 12px',
            }}
          >
            <Link2 size={15} />
          </button>
        )}
      </div>
      {shareUrl && (
        <p style={{ fontFamily: F, fontSize: '11px', color: 'var(--color-muted-foreground)', marginTop: '8px', wordBreak: 'break-all' }}>
          Public link active · {shareUrl}
        </p>
      )}
    </div>
  )
}
