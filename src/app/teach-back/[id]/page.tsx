'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useStore } from '@/lib/store';
import { gradeTeachBack } from '@/lib/mockAI';
import { TeachBack, TeachBackFeedback } from '@/lib/types';

function scoreColor(score: number): string {
  if (score >= 80) return 'text-green-400';
  if (score >= 60) return 'text-yellow-400';
  return 'text-red-400';
}

function scoreBorderColor(score: number): string {
  if (score >= 80) return 'border-green-500';
  if (score >= 60) return 'border-yellow-500';
  return 'border-red-500';
}

export default function TeachBackPage() {
  const params = useParams();
  const router = useRouter();
  const learningId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { learnings, addTeachBack } = useStore();
  const learning = learnings.find((l) => l.id === learningId);

  const [step, setStep] = useState<'explain' | 'feedback'>('explain');
  const [explanation, setExplanation] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [feedback, setFeedback] = useState<TeachBackFeedback | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!learning) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-100">Not found</h1>
        <p className="text-slate-500 text-sm">This learning doesn't exist.</p>
        <Link href="/">
          <button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors">
            Go home
          </button>
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (explanation.trim().length < 10 || isGrading || submitted) return;
    setIsGrading(true);
    setSubmitted(true);
    try {
      const result = await gradeTeachBack(explanation, learning.summary);
      const tb: TeachBack = {
        id: `tb-${Date.now()}`,
        learningId: learning.id,
        userExplanation: explanation,
        aiFeedback: result,
        score: result.score,
        createdAt: new Date().toISOString(),
      };
      addTeachBack(tb);
      setFeedback(result);
      setStep('feedback');
    } finally {
      setIsGrading(false);
    }
  };

  if (step === 'explain') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/library" className="text-slate-500 hover:text-slate-300 transition-colors text-sm">
            ← Library
          </Link>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Teach back</h1>
          <p className="text-sm text-slate-500 mt-1">Explain this in your own words</p>
        </div>

        {/* Learning reference */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
          <p className="text-xs text-violet-400 uppercase tracking-wider font-semibold">Concept</p>
          <h2 className="text-slate-100 font-semibold text-sm">{learning.title}</h2>
          <p className="text-slate-400 text-xs leading-relaxed">{learning.summary}</p>
        </div>

        {/* Explanation textarea */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your explanation
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            placeholder="Explain this concept as if teaching it to someone else..."
            rows={7}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
          />
          <p className="text-xs text-slate-600 text-right">{explanation.trim().length} chars</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={explanation.trim().length < 10 || isGrading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
        >
          {isGrading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
              Checking...
            </span>
          ) : (
            'Check my understanding'
          )}
        </button>
      </div>
    );
  }

  if (!feedback) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Your results</h1>
        <p className="text-sm text-slate-500 mt-1">{learning.title}</p>
      </div>

      {/* Score ring */}
      <div className="flex justify-center py-2">
        <div
          className={`w-28 h-28 rounded-full border-4 ${scoreBorderColor(feedback.score)} flex flex-col items-center justify-center`}
        >
          <span className={`text-4xl font-bold ${scoreColor(feedback.score)}`}>
            {feedback.score}
          </span>
          <span className="text-xs text-slate-500 mt-0.5">/ 100</span>
        </div>
      </div>

      {/* Overall feedback */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm leading-relaxed">
        {feedback.overallFeedback}
      </div>

      {/* Strengths */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-green-400 uppercase tracking-wider">What you nailed</p>
        <ul className="space-y-1.5">
          {feedback.strengths.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-green-400 shrink-0">✓</span>
              {s}
            </li>
          ))}
        </ul>
      </div>

      {/* Improvements */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">Gaps to address</p>
        <ul className="space-y-1.5">
          {feedback.improvements.map((imp, i) => (
            <li key={i} className="flex gap-2 text-sm text-slate-300">
              <span className="text-orange-400 shrink-0">→</span>
              {imp}
            </li>
          ))}
        </ul>
      </div>

      {/* Follow-up questions */}
      {feedback.followUpQuestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-violet-400 uppercase tracking-wider">Think about this</p>
          <ul className="space-y-2">
            {feedback.followUpQuestions.map((q, i) => (
              <li
                key={i}
                className="bg-slate-900 border border-violet-900 rounded-xl px-4 py-3 text-sm text-slate-300 leading-relaxed"
              >
                {q}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Done */}
      <button
        onClick={() => router.push('/')}
        className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
      >
        Done
      </button>
    </div>
  );
}
