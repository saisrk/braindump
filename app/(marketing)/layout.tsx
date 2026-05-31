import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Braindump - Remember Everything You Learn',
  description: 'Capture knowledge, review with AI-powered spaced repetition, and express your learnings with confidence.',
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}
