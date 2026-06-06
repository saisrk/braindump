'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Loader2, Plus, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { PageHeader } from '@/components/ui/page-header'
import { Badge } from '@/components/ui/badge'
import { analyzeCapture, saveCapture, analyzeContentMetadata } from '@/lib/actions/capture'
import { isVideoUrl } from '@/lib/video-detection'
import type { ContentMetadata } from '@/lib/actions/capture'

type CaptureMode = 'quick' | 'wizard' | 'organize' | 'result'

export default function CapturePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [mode, setMode] = useState<CaptureMode>('quick')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [category, setCategory] = useState('general')
  const [source, setSource] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState<{ title: string; summary: string; resolvedContent?: string; sourceRef?: string } | null>(null)
  const [metadata, setMetadata] = useState<ContentMetadata | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)

  const categories = ['general', 'technical', 'business', 'personal', 'research']

  const handleQuickCapture = async () => {
    if (!url && !text) return
    setLoading(true)
    setAnalyzeError(null)
    try {
      const content = url || text
      const sourceType = url ? 'url' : 'text'
      const result = await analyzeCapture({
        content,
        sourceType: sourceType as 'url' | 'text' | 'file' | 'wizard',
        sourceRef: source || undefined,
      })
      if (result.ok && result.summary) {
        setSummary({ 
          title: result.summary.title, 
          summary: result.summary.summary,
          resolvedContent: result.resolvedContent,
          sourceRef: url || source,
        })
        // If URL provided, go to organize metadata step; otherwise jump to result
        if (url) {
          setMode('organize')
        } else {
          setMode('result')
        }
      } else {
        setAnalyzeError(result.error || 'Failed to analyze')
      }
    } catch (error) {
      console.error('[v0] Capture failed:', error)
      setAnalyzeError('An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleOrganizeMetadata = async () => {
    if (!summary?.sourceRef) return
    setLoading(true)
    setAnalyzeError(null)
    try {
      // Check if it's a video
      const isVideo = isVideoUrl(summary.sourceRef)
      
      const result = await analyzeContentMetadata({
        sourceRef: summary.sourceRef,
        sourceType: isVideo ? 'video' : 'url',
        resolvedContent: summary.resolvedContent || summary.summary,
      })

      if (result.ok && result.metadata) {
        setMetadata(result.metadata)
        setMode('result')
      } else {
        setAnalyzeError(result.error || 'Failed to analyze metadata')
      }
    } catch (error) {
      console.error('[v0] Metadata analysis failed:', error)
      setAnalyzeError('Failed to analyze content')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (mode === 'quick') {
      setMode('wizard')
    } else if (mode === 'wizard') {
      handleQuickCapture()
    } else if (mode === 'organize') {
      handleOrganizeMetadata()
    }
  }

  const handleDone = () => {
    router.push('/home')
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Capture Learning"
        subtitle="Save what you&apos;re learning right now"
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

        {mode === 'organize' && summary && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">
                {metadata ? 'Content Analyzed' : 'Analyzing Content...'}
              </h2>
              
              {analyzeError && (
                <div className="flex gap-2 p-3 mb-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{analyzeError}</p>
                </div>
              )}

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2 text-muted-foreground">Analyzing your content...</span>
                </div>
              ) : metadata ? (
                <div className="space-y-4">
                  {metadata.author && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Author</p>
                      <p className="font-medium text-foreground">{metadata.author}</p>
                    </div>
                  )}
                  
                  {metadata.domain && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Source Domain</p>
                      <p className="font-medium text-foreground">{metadata.domain}</p>
                    </div>
                  )}
                  
                  {metadata.publishDate && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Published</p>
                      <p className="font-medium text-foreground">{new Date(metadata.publishDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {metadata.contentType && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Content Type</p>
                      <Badge className="capitalize">{metadata.contentType}</Badge>
                    </div>
                  )}

                  {metadata.videoTitle && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Video Title</p>
                      <p className="font-medium text-foreground">{metadata.videoTitle}</p>
                    </div>
                  )}

                  {metadata.videoChannel && (
                    <div className="pb-3 border-b border-border">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Channel</p>
                      <p className="font-medium text-foreground">{metadata.videoChannel}</p>
                    </div>
                  )}
                  
                  {metadata.keyPoints.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Key Takeaways</p>
                      <ul className="space-y-1">
                        {metadata.keyPoints.map((point, idx) => (
                          <li key={idx} className="text-sm text-foreground flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
              
              <div className="flex gap-3 pt-6 mt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setMode('wizard')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button
                  onClick={() => setMode('result')}
                  className="flex-1"
                >
                  Continue
                </Button>
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
              {session?.user ? (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Teach back what you learned to reinforce it, then we&apos;ll add it to your spaced repetition schedule.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleDone} className="flex-1">
                      Skip to Library
                    </Button>
                    <Button onClick={() => router.push('/teachback')} className="flex-1">
                      Teach Back Now
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-6">
                    Sign in to save this to your library, start spaced repetition reviews, and test your understanding with teach-back.
                  </p>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => router.push('/login')} className="flex-1">
                      Sign in
                    </Button>
                    <Button onClick={() => router.push('/login')} className="flex-1">
                      Create account
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

