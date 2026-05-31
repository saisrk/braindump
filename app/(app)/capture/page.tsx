'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { analyzeCapture, saveCapture } from '@/lib/actions/capture'

type CaptureMode = 'quick' | 'wizard' | 'result'

export default function CapturePage() {
  const router = useRouter()
  const [mode, setMode] = useState<CaptureMode>('quick')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ title: string; content: string } | null>(null)

  const categories = ['general', 'technical', 'business', 'personal', 'research']

  const handleQuickCapture = async () => {
    if (!url && !text) return
    setLoading(true)
    try {
      const content = url || text
      const sourceType = url ? 'url' : 'text'
      const result = await analyzeCapture({
        content,
        sourceType: sourceType as 'url' | 'text' | 'file' | 'wizard',
        sourceRef: source || undefined,
      })
      if (result.ok && result.summary) {
        setSummary({ title: result.summary.title, content: result.summary.content })
        setMode('result')
      }
    } catch (error) {
      console.error('[v0] Capture failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (mode === 'quick') {
      setMode('wizard')
    } else if (mode === 'wizard') {
      handleQuickCapture()
    }
  }

  const handleDone = () => {
    router.push('/home')
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Capture Learning"
        description="Save what you&apos;re learning right now"
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        {mode === 'quick' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Capture</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL (optional)
                  </label>
                  <Input
                    placeholder="Paste a URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Or write a note
                  </label>
                  <Textarea
                    placeholder="What did you learn today?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleNext}
                    disabled={loading || (!url && !text)}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next: Organize
                  </Button>
                  <Button variant="outline" onClick={() => setMode('result')} className="flex-1">
                    Skip Details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'wizard' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Organize Your Learning</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 rounded-lg border transition-colors capitalize ${
                          category === cat
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Source (e.g., Twitter, Blog, Book)
                  </label>
                  <Input
                    placeholder="e.g., Hacker News, Personal thought"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('quick')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Summary
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'result' && summary && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Captured Successfully!</h2>
                <Badge>New</Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Title</p>
                  <p className="text-lg font-semibold text-foreground">{summary.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Summary</p>
                  <p className="text-foreground leading-relaxed">{summary.content}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What&apos;s Next?</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Now teach back what you learned to reinforce the knowledge, then we&apos;ll add it to your spaced repetition schedule.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleDone} className="flex-1">
                  Skip to Library
                </Button>
                <Button onClick={() => router.push('/teachback')} className="flex-1">
                  Teach Back Now
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

  const handleNext = () => {
    if (mode === 'quick') {
      setMode('wizard')
    } else if (mode === 'wizard') {
      handleQuickCapture()
    }
  }

  const handleDone = () => {
    router.push('/home')
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Capture Learning"
        description="Save what you&apos;re learning right now"
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        {mode === 'quick' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Quick Capture</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL (optional)
                  </label>
                  <Input
                    placeholder="Paste a URL..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    type="url"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Or write a note
                  </label>
                  <Textarea
                    placeholder="What did you learn today?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="flex gap-3">
                  <Button
                    onClick={handleNext}
                    disabled={loading || (!url && !text)}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Next: Organize
                  </Button>
                  <Button variant="outline" onClick={() => setMode('result')} className="flex-1">
                    Skip Details
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'wizard' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Organize Your Learning</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Category
                  </label>
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-2 rounded-lg border transition-colors capitalize ${
                          category === cat
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-foreground hover:bg-muted'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Source (e.g., Twitter, Blog, Book)
                  </label>
                  <Input
                    placeholder="e.g., Hacker News, Personal thought"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setMode('quick')}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Summary
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {mode === 'result' && summary && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6 border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-foreground">Captured Successfully!</h2>
                <Badge>New</Badge>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Title</p>
                  <p className="text-lg font-semibold text-foreground">{summary.title}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">AI Summary</p>
                  <p className="text-foreground leading-relaxed">{summary.summary}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-foreground mb-4">What&apos;s Next?</h3>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Now teach back what you learned to reinforce the knowledge, then we&apos;ll add it to your spaced repetition schedule.
                </p>
              </div>
              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={handleDone} className="flex-1">
                  Skip to Library
                </Button>
                <Button onClick={() => router.push('/teachback')} className="flex-1">
                  Teach Back Now
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
