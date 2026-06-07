'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { PageHeader } from '@/components/ui/page-header'
import { runExpress } from '@/lib/actions/express'
import type { ExpressResult } from '@/lib/ai/express'

type ExpressMode = 'select' | 'generating' | 'result'

const formats = [
  { id: 'talking-points', name: 'Talking Points', desc: 'Key points for interviews or conversations', color: '#b5462f', icon: '◉' },
  { id: 'star', name: 'STAR Stories', desc: 'Situation, Task, Action, Result framework', color: '#c79a3e', icon: '★' },
  { id: 'profile', name: 'Profile Summary', desc: 'Professional profile or bio snippet', color: '#46557a', icon: '◈' },
  { id: 'summary', name: 'Learning Summary', desc: 'Markdown summary for sharing', color: '#6f8a5a', icon: '▦' },
]

export default function ExpressPage() {
  const [mode, setMode] = useState<ExpressMode>('select')
  const [result, setResult] = useState<ExpressResult | null>(null)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (format: string) => {
    setMode('generating')
    try {
      const res = await runExpress({ format: format as any })
      if (res.ok && res.result) {
        setResult(res.result)
        setMode('result')
      } else {
        setMode('select')
      }
    } catch {
      setMode('select')
    }
  }

  const formatOutput = (res: ExpressResult): string => {
    if (res.talkingPoints) return res.talkingPoints.map((p) => `• ${p.headline}\n  ${p.detail}`).join('\n\n')
    if (res.starAnswers) return res.starAnswers.map((a) => `Q: ${a.prompt}\n\nS: ${a.situation}\nT: ${a.task}\nA: ${a.action}\nR: ${a.result}`).join('\n\n---\n\n')
    if (res.profileBullets) return res.profileBullets.map((b) => `• ${b}`).join('\n')
    if (res.narrative) return res.narrative
    return ''
  }

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(formatOutput(result))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Express"
          title="Turn your shelves into content"
          subtitle="Pull your learnings back out, articulated and ready"
          className="mb-6"
        />

        {mode === 'select' && (
          <div className="max-w-2xl space-y-3">
            {formats.map((f) => (
              <div
                key={f.id}
                className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4 transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
                onClick={() => handleGenerate(f.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl grid place-items-center text-white text-lg flex-shrink-0"
                    style={{ background: f.color }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h4 className="font-display font-semibold text-foreground">{f.name}</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">{f.desc}</p>
                  </div>
                </div>
                <button
                  className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
                  onClick={(e) => { e.stopPropagation(); handleGenerate(f.id); }}
                >
                  Generate →
                </button>
              </div>
            ))}
          </div>
        )}

        {mode === 'generating' && (
          <div className="max-w-2xl flex flex-col items-center justify-center min-h-64 rounded-xl border border-border bg-card">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <p className="font-display text-muted-foreground italic">Generating your content…</p>
          </div>
        )}

        {mode === 'result' && result && (
          <div className="max-w-2xl space-y-4">
            <div className="rounded-xl border border-border bg-card p-8">
              <pre className="font-display text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {formatOutput(result)}
              </pre>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setMode('select')}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
