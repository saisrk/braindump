'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Flame, Snowflake, Share2, Check, Link2, Sparkles } from 'lucide-react'
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

type StreakTier = 'lapsed' | 'building' | 'strong'

/** Tiered tone for returning users — distinct from the brand-new spotlight. */
function tierInfo(current: number, longest: number): { tier: StreakTier; badge: string; message: string } {
  if (current === 0) {
    return {
      tier: 'lapsed',
      badge: 'Pick it back up',
      message: longest > 1
        ? `You've hit ${longest} days before — one capture or review today starts a new run.`
        : 'One capture or review today gets you going again.',
    }
  }
  if (current < 3) {
    return {
      tier: 'building',
      badge: 'Building momentum',
      message: `Off to a good start. ${milestoneHint(current, longest)} — a little consistency turns this into a habit.`,
    }
  }
  return {
    tier: 'strong',
    badge: '🔥 On a roll',
    message: `You're on fire — ${milestoneHint(current, longest)}. Don't break the chain!`,
  }
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

  // First-time spotlight: nobody has ever been active — the flame/heatmap have
  // nothing to show yet, so lead with an invitation instead of a "0".
  const isNew = current === 0 && !history.some((d) => d.active)
  const { tier, badge, message } = tierInfo(current, longest)

  if (isNew) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(181,70,47,0.08), rgba(199,154,62,0.08))',
          border: '1.5px dashed rgba(181,70,47,0.35)',
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} style={{ color: '#b5462f' }} />
          <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: '#b5462f' }}>
            Your streak starts today
          </span>
        </div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '24px', color: 'var(--color-foreground)', margin: '0 0 6px' }}>
          Capture or review one thing to light the flame 🔥
        </h2>
        <p style={{ fontFamily: F, fontSize: '13px', color: 'var(--color-muted-foreground)', margin: '0 0 16px', maxWidth: '480px' }}>
          Every day you show up counts. Come back tomorrow to keep it going — Braindump tracks it for you.
        </p>
        <Link href="/capture" style={{ textDecoration: 'none' }}>
          <button
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px', borderRadius: '10px', border: 'none',
              cursor: 'pointer', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700,
              fontSize: '14px', padding: '11px 20px', boxShadow: '0 6px 16px -6px rgba(181,70,47,.5)',
            }}
          >
            <Flame size={16} />
            Capture your first learning
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: 'var(--color-card)', border: '1px solid var(--color-border)' }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} style={{ color: tier === 'lapsed' ? 'var(--color-muted-foreground)' : '#b5462f' }} />
        <span style={{ fontFamily: F, fontSize: '13px', fontWeight: 600, color: 'var(--color-muted-foreground)' }}>
          Learning streak
        </span>
        <span
          style={{
            fontFamily: F, fontSize: '11px', fontWeight: 700,
            color: tier === 'strong' ? '#b5462f' : tier === 'building' ? '#9c7a23' : 'var(--color-muted-foreground)',
            background: tier === 'strong' ? 'rgba(181,70,47,0.1)' : tier === 'building' ? 'rgba(199,154,62,0.12)' : 'var(--color-border)',
            borderRadius: '99px', padding: '2px 9px',
          }}
        >
          {badge}
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

      {/* Hero row: big number on the left, heatmap fills the rest on wide screens */}
      <div className="streak-hero-row" style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flexShrink: 0 }}>
          <div className="flex items-baseline gap-2">
            <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '56px', lineHeight: 1, color: 'var(--color-foreground)' }}>
              {current}
            </span>
            <span style={{ fontFamily: F, fontSize: '14px', color: 'var(--color-muted-foreground)', fontWeight: 500 }}>
              day{current === 1 ? '' : 's'}
            </span>
          </div>
          <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', margin: '2px 0 0' }}>
            Longest: {longest}
          </p>
          <p style={{ fontFamily: F, fontSize: '12px', color: 'var(--color-muted-foreground)', marginTop: '8px', maxWidth: '240px' }}>
            {message}
          </p>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: '220px' }}>
          <div className="flex gap-1" aria-label="Last 14 days of activity">
            {history.map((d, i) => {
              const isToday = i === history.length - 1
              return (
                <div
                  key={d.date}
                  title={`${d.date}${d.active ? ' · active' : ''}`}
                  style={{
                    flex: 1,
                    height: '28px',
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
          <div className="flex items-center gap-2" style={{ marginTop: '14px' }}>
            <button
              onClick={handleShare}
              disabled={busy}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
                borderRadius: '10px', border: 'none', cursor: busy ? 'wait' : 'pointer',
                background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '13px',
                padding: '9px 16px', opacity: busy ? 0.7 : 1,
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
                  padding: '9px 12px',
                }}
              >
                <Link2 size={15} />
              </button>
            )}
            {shareUrl && (
              <p style={{ fontFamily: F, fontSize: '11px', color: 'var(--color-muted-foreground)', margin: 0, wordBreak: 'break-all' }}>
                Link active
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
