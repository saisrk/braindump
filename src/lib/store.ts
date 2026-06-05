'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState, Learning, ReviewItem, Streak } from './types';
import { sm2 } from './sm2';

const today = new Date().toISOString();
const yesterday = new Date(Date.now() - 86400000).toISOString();

const sampleLearnings: Learning[] = [
  {
    id: 'sample-1',
    title: 'React Hooks: useState and useEffect',
    sourceType: 'text',
    summary:
      'React hooks allow functional components to use state and lifecycle features. useState returns a stateful value and a setter. useEffect runs side effects after renders, with an optional cleanup function and dependency array to control when it re-runs.',
    tags: ['react', 'javascript', 'hooks', 'frontend'],
    topic: 'Frontend Development',
    difficulty: 'intermediate',
    createdAt: yesterday,
  },
  {
    id: 'sample-2',
    title: 'TypeScript Generics Explained',
    sourceType: 'url',
    sourceRef: 'https://www.typescriptlang.org/docs/handbook/2/generics.html',
    summary:
      'Generics allow you to write reusable code that works with multiple types while maintaining type safety. They are like variables for types, letting you parameterize functions, interfaces, and classes. Constraints (extends) limit which types can be passed in.',
    tags: ['typescript', 'generics', 'types'],
    topic: 'Programming Languages',
    difficulty: 'intermediate',
    createdAt: yesterday,
  },
  {
    id: 'sample-3',
    title: 'Spaced Repetition: How Memory Works',
    sourceType: 'text',
    summary:
      'Spaced repetition exploits the psychological spacing effect: reviewing material at increasing intervals dramatically improves long-term retention compared to massed practice. The SM-2 algorithm calculates optimal review intervals based on self-rated recall quality (1-5), adjusting the ease factor per card.',
    tags: ['learning', 'memory', 'spaced-repetition', 'productivity'],
    topic: 'Learning Science',
    difficulty: 'beginner',
    createdAt: today,
  },
];

const sampleReviewItems: ReviewItem[] = [
  {
    id: 'review-1',
    learningId: 'sample-1',
    type: 'flashcard',
    question: 'What does useState return in React?',
    answer: 'useState returns a tuple: the current state value and a setter function to update it.',
    srInterval: 1,
    srEase: 2.5,
    dueDate: today,
    lastReviewed: undefined,
  },
  {
    id: 'review-2',
    learningId: 'sample-1',
    type: 'flashcard',
    question: 'What is the dependency array in useEffect used for?',
    answer:
      'The dependency array controls when the effect re-runs. An empty array means run once on mount; listed values mean re-run when those values change.',
    srInterval: 1,
    srEase: 2.5,
    dueDate: today,
    lastReviewed: undefined,
  },
  {
    id: 'review-3',
    learningId: 'sample-2',
    type: 'quiz',
    question: 'What is the purpose of generics in TypeScript?',
    answer:
      'Generics let you write reusable, type-safe code that works with multiple types by parameterizing functions, interfaces, and classes.',
    srInterval: 1,
    srEase: 2.5,
    dueDate: today,
    lastReviewed: undefined,
  },
];

const initialStreak: Streak = {
  currentCount: 3,
  longest: 7,
  lastActiveDate: today,
  freezeTokens: 1,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      learnings: sampleLearnings,
      reviewItems: sampleReviewItems,
      streak: initialStreak,

      addLearning: (learning: Learning) => {
        const quizItems: ReviewItem[] = [
          {
            id: `review-${Date.now()}-1`,
            learningId: learning.id,
            type: 'flashcard',
            question: `What is the main idea of "${learning.title}"?`,
            answer: learning.summary.split('.')[0] + '.',
            srInterval: 0,
            srEase: 2.5,
            dueDate: new Date().toISOString(),
          },
          {
            id: `review-${Date.now()}-2`,
            learningId: learning.id,
            type: 'quiz',
            question: `Which topic area does "${learning.title}" belong to, and what difficulty level is it?`,
            answer: `It belongs to ${learning.topic} and is classified as ${learning.difficulty} difficulty.`,
            srInterval: 0,
            srEase: 2.5,
            dueDate: new Date().toISOString(),
          },
        ];

        set((state) => ({
          learnings: [learning, ...state.learnings],
          reviewItems: [...quizItems, ...state.reviewItems],
        }));
      },

      updateReviewItem: (id: string, rating: number) => {
        const state = get();
        const item = state.reviewItems.find((r) => r.id === id);
        if (!item) return;

        const updated = sm2(item, rating);

        set((state) => ({
          reviewItems: state.reviewItems.map((r) => (r.id === id ? updated : r)),
        }));
      },
    }),
    {
      name: 'braindump-storage',
    }
  )
);
