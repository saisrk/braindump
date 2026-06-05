import Link from 'next/link';
import { Learning } from '@/lib/types';

interface LearningCardProps {
  learning: Learning;
  lastTeachBackScore?: number;
}

const difficultyColors: Record<Learning['difficulty'], string> = {
  beginner: 'text-green-400 bg-green-950 border-green-800',
  intermediate: 'text-yellow-400 bg-yellow-950 border-yellow-800',
  advanced: 'text-red-400 bg-red-950 border-red-800',
};

const sourceTypeIcon: Record<Learning['sourceType'], string> = {
  url: '🔗',
  text: '📝',
  wizard: '🧙',
};

export default function LearningCard({ learning, lastTeachBackScore }: LearningCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 hover:border-slate-700 transition-colors">
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-slate-100 font-semibold text-sm leading-snug flex-1">
          {learning.title}
        </h3>
        <span className="text-base shrink-0">{sourceTypeIcon[learning.sourceType]}</span>
      </div>

      {/* Summary */}
      <p className="text-slate-400 text-xs leading-relaxed line-clamp-3">
        {learning.summary}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        {/* Tags */}
        <div className="flex flex-wrap gap-1 flex-1 min-w-0">
          {learning.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="text-xs bg-slate-800 text-slate-400 rounded-md px-2 py-0.5 border border-slate-700"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Difficulty badge */}
        <span
          className={`text-xs border rounded-md px-2 py-0.5 shrink-0 ${difficultyColors[learning.difficulty]}`}
        >
          {learning.difficulty}
        </span>

        {/* Teach-back score badge */}
        {lastTeachBackScore !== undefined && (
          <span
            className={`text-xs border rounded-md px-2 py-0.5 shrink-0 ${
              lastTeachBackScore >= 80
                ? 'text-green-400 bg-green-950 border-green-800'
                : lastTeachBackScore >= 60
                ? 'text-yellow-400 bg-yellow-950 border-yellow-800'
                : 'text-red-400 bg-red-950 border-red-800'
            }`}
          >
            Last: {lastTeachBackScore}
          </span>
        )}
      </div>

      {/* Date + teach-back link */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800">
        <div className="text-xs text-slate-600">
          {new Date(learning.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          {learning.topic && (
            <span className="ml-2 text-slate-700">· {learning.topic}</span>
          )}
        </div>
        <Link
          href={`/teach-back/${learning.id}`}
          className="text-xs text-violet-400 hover:text-violet-300 transition-colors shrink-0"
        >
          Teach back →
        </Link>
      </div>
    </div>
  );
}
