import { cn } from '@/lib/utils';
import { confidenceLabel } from '@/lib/sr';

function signalColor(score: number): string {
  if (score < 34) return 'bg-signal-low';
  if (score < 67) return 'bg-signal-mid';
  return 'bg-signal-high';
}

export function ConfidenceBar({
  score,
  showLabel = true,
  className,
}: {
  score: number;
  showLabel?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="meter"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Confidence"
      >
        <div
          className={cn('h-full rounded-full transition-all', signalColor(score))}
          style={{ width: `${Math.max(4, score)}%` }}
        />
      </div>
      {showLabel && (
        <span className="w-14 flex-shrink-0 text-right text-xs font-medium text-muted-foreground">
          {confidenceLabel(score)}
        </span>
      )}
    </div>
  );
}

export function DifficultyDots({ level }: { level: number | null }) {
  const n = level ?? 0;
  return (
    <div className="flex items-center gap-0.5" aria-label={`Difficulty ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full',
            i <= n ? 'bg-brand-500' : 'bg-muted'
          )}
        />
      ))}
    </div>
  );
}
