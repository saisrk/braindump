'use client'

import { useState } from 'react'
import { Loader2, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/ui/page-header'
import { runExpress } from '@/lib/actions/express'

type ExpressMode = 'select' | 'generating' | 'result'

export default function ExpressPage() {
  const [mode, setMode] = useState<ExpressMode>('select')
  const [output, setOutput] = useState<string>('')
  const [copied, setCopied] = useState(false)

  const formats = [
    {
      id: 'talking-points',
      name: 'Talking Points',
      desc: 'Key points for interviews or conversations',
    },
    {
      id: 'star-story',
      name: 'STAR Stories',
      desc: 'Situation, Task, Action, Result framework',
    },
    {
      id: 'profile',
      name: 'Profile Summary',
      desc: 'Professional profile or bio snippet',
    },
  ]

  const handleGenerate = async (format: string) => {
    setMode('generating')
    try {
      const result = await runExpress({ format: format as any })
      if (result.ok && result.result) {
        setOutput(result.result.content)
        setMode('result')
      }
    } catch (error) {
      console.error('[v0] Express generation failed:', error)
      setMode('select')
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col">
      <PageHeader
        title="Express Mode"
        description="Turn your learnings into professional content"
      />

      <div className="flex-1 overflow-auto px-4 py-6 md:px-8">
        {mode === 'select' && (
          <div className="max-w-2xl space-y-4">
            <p className="text-sm text-muted-foreground mb-6">
              Choose a format to generate professional content from your learnings
            </p>
            {formats.map((format) => (
              <Card
                key={format.id}
                onClick={() => handleGenerate(format.id)}
                className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
              >
                <h3 className="font-semibold text-foreground mb-1">{format.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{format.desc}</p>
                <Button size="sm" variant="outline">
                  Generate
                </Button>
              </Card>
            ))}
          </div>
        )}

        {mode === 'generating' && (
          <div className="max-w-2xl">
            <Card className="p-12 flex flex-col items-center justify-center min-h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Generating your content...</p>
            </Card>
          </div>
        )}

        {mode === 'result' && (
          <div className="max-w-2xl space-y-6">
            <Card className="p-8 bg-muted/50">
              <div className="prose prose-sm max-w-none text-foreground dark:prose-invert whitespace-pre-wrap">
                {output}
              </div>
            </Card>
            <div className="flex gap-3">
              <Button
                onClick={handleCopy}
                variant="outline"
                className="flex-1"
              >
                <Copy className="mr-2 h-4 w-4" />
                {copied ? 'Copied!' : 'Copy'}
              </Button>
              <Button
                onClick={() => setMode('select')}
                variant="outline"
                className="flex-1"
              >
                Generate Another
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
