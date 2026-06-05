import { Streak } from '@/lib/types';

interface StreakBadgeProps {
  streak: Streak;
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
      <div className="text-2xl">🔥</div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-violet-400">{streak.currentCount}</span>
          <span className="text-sm text-slate-400">day streak</span>
        </div>
        <div className="text-xs text-slate-500">Longest: {streak.longest} days</div>
      </div>
      {streak.freezeTokens > 0 && (
        <div className="ml-auto flex items-center gap-1 text-xs text-blue-400 bg-blue-950 rounded-lg px-2 py-1">
          <span>🧊</span>
          <span>{streak.freezeTokens} freeze</span>
        </div>
      )}
    </div>
  );
}
