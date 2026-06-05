'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { summarize } from '@/lib/mockAI';
import { Learning } from '@/lib/types';

interface SummarizeResult {
  title: string;
  summary: string;
  tags: string[];
  topic: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export default function CaptureForm() {
  const router = useRouter();
  const addLearning = useStore((s) => s.addLearning);

  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SummarizeResult | null>(null);

  // Editable fields from result
  const [title, setTitle] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsAnalyzing(true);
    try {
      const res = await summarize(input);
      setResult(res);
      setTitle(res.title);
      setTagsInput(res.tags.join(', '));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    setIsSaving(true);

    const isUrl =
      input.trim().startsWith('http://') || input.trim().startsWith('https://');

    const learning: Learning = {
      id: `learning-${Date.now()}`,
      title: title.trim() || result.title,
      sourceType: isUrl ? 'url' : 'text',
      sourceRef: isUrl ? input.trim() : undefined,
      summary: result.summary,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean),
      topic: result.topic,
      difficulty: result.difficulty,
      createdAt: new Date().toISOString(),
    };

    addLearning(learning);
    router.push('/');
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setTitle('');
    setTagsInput('');
  };

  return (
    <div className="space-y-5">
      {!result ? (
        /* Step 1: Input */
        <div className="space-y-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste a URL or text you want to learn from..."
            rows={6}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-violet-500 text-sm resize-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={!input.trim() || isAnalyzing}
            className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            {isAnalyzing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-violet-300 border-t-transparent rounded-full animate-spin" />
                Analyzing...
              </span>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      ) : (
        /* Step 2: Review & confirm */
        <div className="space-y-5">
          {/* AI result banner */}
          <div className="flex items-center gap-2 text-xs text-violet-400 bg-violet-950 border border-violet-800 rounded-xl px-3 py-2">
            <span>✨</span>
            <span>AI summary ready — review and edit before saving</span>
          </div>

          {/* Editable title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 text-sm"
            />
          </div>

          {/* Summary (read-only display) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Summary
            </label>
            <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 text-sm leading-relaxed">
              {result.summary}
            </div>
          </div>

          {/* Meta row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Topic
              </label>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-sm">
                {result.topic}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Difficulty
              </label>
              <div className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-300 text-sm capitalize">
                {result.difficulty}
              </div>
            </div>
          </div>

          {/* Editable tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Tags
              <span className="normal-case font-normal ml-1 text-slate-600">(comma-separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-violet-500 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3.5 rounded-xl text-sm transition-colors border border-slate-700"
            >
              Start over
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-[2] bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save to Library'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
