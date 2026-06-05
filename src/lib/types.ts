export type SourceType = 'url' | 'text' | 'wizard';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Learning {
  id: string;
  title: string;
  sourceType: SourceType;
  sourceRef?: string;
  summary: string;
  tags: string[];
  topic: string;
  difficulty: Difficulty;
  createdAt: string; // ISO string
}

export interface ReviewItem {
  id: string;
  learningId: string;
  type: 'flashcard' | 'quiz';
  question: string;
  answer: string;
  srInterval: number;   // days
  srEase: number;       // SM-2 ease factor
  dueDate: string;      // ISO string
  lastReviewed?: string;
}

export interface Streak {
  currentCount: number;
  longest: number;
  lastActiveDate: string;
  freezeTokens: number;
}

export interface AppState {
  learnings: Learning[];
  reviewItems: ReviewItem[];
  streak: Streak;
  addLearning: (learning: Learning) => void;
  updateReviewItem: (id: string, rating: number) => void;
}
