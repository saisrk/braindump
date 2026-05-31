/**
 * SM-2 spaced-repetition scheduling (SuperMemo 2).
 *
 * Grades follow the standard 0-5 quality scale, but the UI exposes 4 buttons
 * mapped to: Again (2), Hard (3), Good (4), Easy (5).
 */

export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

export interface SrState {
  /** Repetition interval in days. */
  interval: number;
  /** Ease factor (>= 1.3). */
  ease: number;
}

export interface SrResult extends SrState {
  /** Number of consecutive correct recalls (kept implicitly via interval steps). */
  dueDate: string; // ISO date (YYYY-MM-DD)
}

/** UI button -> SM-2 quality grade. */
export const GRADE_MAP = {
  again: 2 as ReviewGrade,
  hard: 3 as ReviewGrade,
  good: 4 as ReviewGrade,
  easy: 5 as ReviewGrade,
};

export type GradeLabel = keyof typeof GRADE_MAP;

function addDaysISO(days: number, from = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

/**
 * Compute the next SM-2 schedule given the previous state and a recall grade.
 */
export function schedule(prev: SrState, grade: ReviewGrade): SrResult {
  const ease = Math.max(
    1.3,
    prev.ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  );

  let interval: number;

  if (grade < 3) {
    // Failed recall — reset to the first step.
    interval = 1;
  } else if (prev.interval <= 1) {
    interval = grade === 5 ? 4 : 1;
  } else if (prev.interval <= 4) {
    interval = 6;
  } else {
    interval = Math.round(prev.interval * ease);
  }

  return {
    interval,
    ease: Math.round(ease * 100) / 100,
    dueDate: addDaysISO(interval),
  };
}

/**
 * Confidence (0-100) derived from an item's ease + interval, for display.
 */
export function confidenceFromSr(interval: number, ease: number): number {
  const intervalScore = Math.min(1, Math.log2(interval + 1) / Math.log2(60));
  const easeScore = Math.min(1, Math.max(0, (ease - 1.3) / (2.8 - 1.3)));
  return Math.round((intervalScore * 0.6 + easeScore * 0.4) * 100);
}

export function confidenceLabel(score: number): 'Low' | 'Medium' | 'High' {
  if (score < 34) return 'Low';
  if (score < 67) return 'Medium';
  return 'High';
}
