'use server';

import { db } from '@/db';
import { users, userProfiles, learnings, reviewItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { requireUserId } from '@/lib/session';
import { todayISO } from '@/lib/utils';
import { redirect } from 'next/navigation';

// Starter learnings seeded per topic so new users land in a non-empty app.
const SEED_LEARNINGS: Record<string, { title: string; summary: string; topic: string; keyPoints: string[] }> = {
  AI: {
    title: 'How Transformer Attention Works',
    summary:
      'Transformers use a self-attention mechanism that lets every token in a sequence directly attend to every other token. A query, key, and value vector is computed for each token; the dot-product of queries with keys (scaled by √d) produces attention weights, which are used to blend the value vectors into a contextual representation.',
    topic: 'AI',
    keyPoints: [
      'Each token produces query, key, and value vectors',
      'Attention score = softmax(QKᵀ / √d) × V',
      'Multi-head attention runs this in parallel with different projections',
      'Enables capturing long-range dependencies without recurrence',
    ],
  },
  Leadership: {
    title: 'Psychological Safety — What It Is and Why It Matters',
    summary:
      'Psychological safety is the belief that one can speak up, make mistakes, or ask questions without fear of punishment or humiliation. Google\'s Project Aristotle found it to be the single strongest predictor of high-performing teams — more important than individual talent or clear goals.',
    topic: 'Leadership',
    keyPoints: [
      'Teams with high psychological safety learn faster and take smarter risks',
      'Leaders build it by modelling vulnerability and rewarding candour',
      'Absence shows up as silence in meetings and withheld bad news',
      'Amy Edmondson coined the term; Project Aristotle popularised it',
    ],
  },
  Coding: {
    title: 'Why Immutability Makes Code Easier to Reason About',
    summary:
      'Immutable data structures cannot be changed after creation. Because no hidden mutations exist, functions behave predictably given the same inputs, making bugs easier to reproduce and fix. Languages like Clojure and Elm embrace it fully; React and Redux borrow the pattern for state management.',
    topic: 'Coding',
    keyPoints: [
      'No shared mutable state eliminates an entire class of race conditions',
      'Pure functions are trivially testable — same in, same out',
      'Structural sharing keeps memory cost low in practice',
      'Undo/redo and time-travel debugging become straightforward',
    ],
  },
  Design: {
    title: 'The Three Levels of Design: Visceral, Behavioral, Reflective',
    summary:
      "Don Norman's model splits user experience into three layers: visceral (immediate aesthetic reaction), behavioral (ease of use), and reflective (meaning and identity the product confers). Great products nail all three — they feel beautiful, work effortlessly, and make users feel good about themselves for using them.",
    topic: 'Design',
    keyPoints: [
      'Visceral: first impression, look and feel',
      'Behavioral: usability, feedback, error recovery',
      'Reflective: self-image, memory, storytelling',
      'Most design critique stays at the visceral level — go deeper',
    ],
  },
  Science: {
    title: 'The Spacing Effect: Why Distributed Practice Beats Cramming',
    summary:
      'The spacing effect (Ebbinghaus, 1885) shows that information reviewed at increasing intervals is retained far longer than the same time spent in a single study session. Spaced repetition systems like SM-2 formalise this by scheduling reviews just before forgetting is predicted to occur.',
    topic: 'Science',
    keyPoints: [
      'Forgetting curves flatten with each spaced review',
      'Optimal gap roughly doubles after each successful recall',
      'Works for motor skills and procedural knowledge too',
      "This app uses SM-2 — you're already benefiting from this",
    ],
  },
  Business: {
    title: 'Jobs to Be Done: Why People "Hire" Products',
    summary:
      'Clayton Christensen\'s Jobs to Be Done framework says customers don\'t buy products — they hire them to make progress in a specific circumstance. A milkshake isn\'t competing with other milkshakes; it\'s competing with a banana and a bagel for the morning commute job. Understanding the job reshapes positioning, pricing, and product decisions.',
    topic: 'Business',
    keyPoints: [
      'Focus on the job, not the customer segment or product category',
      'Functional, emotional, and social dimensions all exist in every job',
      'Switch interviews reveal what the old solution was and why it failed',
      'Jobs are stable; solutions come and go',
    ],
  },
  'Personal Dev': {
    title: 'Fixed vs Growth Mindset (Carol Dweck)',
    summary:
      "Carol Dweck's research shows that people who believe abilities are malleable (growth mindset) outperform those who see them as fixed talents. Growth mindset people treat failure as information, seek harder challenges, and improve more over time. The difference often traces back to the type of praise received in childhood.",
    topic: 'Personal Dev',
    keyPoints: [
      'Fixed mindset: ability is innate, failure threatens identity',
      'Growth mindset: ability grows with effort and strategy',
      'Praise the process ("you worked hard") not the trait ("you\'re smart")',
      'Mindset is domain-specific and can be cultivated deliberately',
    ],
  },
};

const FALLBACK_LEARNING = {
  title: 'How Spaced Repetition Works (and Why This App Uses It)',
  summary:
    'Spaced repetition is a learning technique that schedules reviews at increasing intervals based on how well you remember each item. Ebbinghaus\'s forgetting curve shows memory decays predictably — reviewing just before the point of forgetting re-consolidates the memory and extends the next interval. The SM-2 algorithm, used by Anki and this app, calculates optimal intervals automatically.',
  topic: 'Learning Science',
  keyPoints: [
    'Memory decays on a predictable forgetting curve',
    'Each spaced review slows the decay rate',
    "SM-2 adjusts intervals based on your confidence rating",
    'Twenty minutes/week beats four hours of cramming for long-term retention',
  ],
};

export async function completeOnboarding(name: string, goals: string[]): Promise<void> {
  const userId = await requireUserId();
  const today = todayISO();

  // Update display name on the auth record.
  await db
    .update(users)
    .set({ name: name.trim() || null, updatedAt: new Date() })
    .where(eq(users.id, userId));

  // Profile row is always created at sign-in; just update it.
  // Fallback insert handles edge case where profile doesn't exist yet.
  const updated = await db
    .update(userProfiles)
    .set({ goals, onboardedAt: new Date(), updatedAt: new Date() })
    .where(eq(userProfiles.userId, userId))
    .returning({ userId: userProfiles.userId });

  if (updated.length === 0) {
    await db
      .insert(userProfiles)
      .values({ userId, goals, onboardedAt: new Date() });
  }

  // Seed up to 2 relevant starter learnings so the app isn't empty.
  const seeds = goals
    .map((g) => SEED_LEARNINGS[g])
    .filter(Boolean)
    .slice(0, 2);

  if (seeds.length === 0) seeds.push(FALLBACK_LEARNING);

  for (const seed of seeds) {
    const [learning] = await db
      .insert(learnings)
      .values({
        userId,
        title: seed.title,
        sourceType: 'sample',
        summary: seed.summary,
        topic: seed.topic,
        tags: [seed.topic.toLowerCase().replace(/ /g, '-')],
        difficulty: 2,
        keyPoints: seed.keyPoints,
        isAiGenerated: true,
      })
      .returning({ id: learnings.id });

    // Create two review items per seed learning.
    await db.insert(reviewItems).values([
      {
        userId,
        learningId: learning.id,
        type: 'recall',
        question: `What is the core idea behind: "${seed.title}"?`,
        answer: seed.summary,
        dueDate: today,
        srInterval: 1,
        srEase: 2.5,
      },
      {
        userId,
        learningId: learning.id,
        type: 'recall',
        question: `Name one key point from "${seed.title}".`,
        answer: seed.keyPoints[0],
        dueDate: today,
        srInterval: 1,
        srEase: 2.5,
      },
    ]);
  }

  redirect('/home');
}
