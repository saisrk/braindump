import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Zap } from 'lucide-react'

interface VideoUpgradePromptProps {
  onUpgrade?: () => void
  onDismiss?: () => void
}

export function VideoUpgradePrompt({
  onUpgrade,
  onDismiss,
}: VideoUpgradePromptProps) {
  return (
    <Card className="p-6 border-2 border-amber-500 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">
            Video Learning - Pro Feature
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Learn from YouTube, Vimeo, and other video platforms. Our AI automatically analyzes video content, extracts key moments, and creates review cards tailored to your learning style.
          </p>
          <div className="flex gap-3">
            {onUpgrade && (
              <Button
                onClick={onUpgrade}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Upgrade to Pro
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="outline"
              >
                Later
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
