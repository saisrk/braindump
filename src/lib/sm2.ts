import { ReviewItem } from './types';

/**
 * SM-2 Spaced Repetition Algorithm
 * rating: 1 (blackout) to 5 (perfect recall)
 */
export function sm2(item: ReviewItem, rating: number): ReviewItem {
  const clampedRating = Math.max(1, Math.min(5, rating));

  let { srInterval, srEase } = item;

  // Update ease factor
  const newEase = srEase + (0.1 - (5 - clampedRating) * (0.08 + (5 - clampedRating) * 0.02));
  const clampedEase = Math.max(1.3, newEase);

  // Calculate new interval
  let newInterval: number;
  if (clampedRating < 3) {
    // Failed — reset to beginning
    newInterval = 1;
  } else if (srInterval === 0) {
    newInterval = 1;
  } else if (srInterval === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(srInterval * clampedEase);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + newInterval);

  return {
    ...item,
    srInterval: newInterval,
    srEase: clampedEase,
    dueDate: dueDate.toISOString(),
    lastReviewed: new Date().toISOString(),
  };
}
