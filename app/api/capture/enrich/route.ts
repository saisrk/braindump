import { NextResponse } from 'next/server';
import { db } from '@/db';
import { learnings, reviewItems } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { analyzeCapture } from '@/lib/actions/capture';
import { generateReviewItems } from '@/lib/ai/capture';
import { todayISO } from '@/lib/utils';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
// Allow up to 60 seconds for AI analysis.
export const maxDuration = 60;

export async function POST(request: Request) {
  let learningId: string | undefined;
  try {
    const body = await request.json();
    learningId = body.learningId as string;
    const content = body.content as string;
    const sourceType = body.sourceType as string;
    const sourceRef = body.sourceRef as string | undefined;

    if (!learningId || !content) {
      return NextResponse.json({ error: 'Missing learningId or content' }, { status: 400 });
    }

    // Run the full AI analysis.
    const result = await analyzeCapture({
      content,
      sourceType: sourceType as 'url' | 'text' | 'file' | 'wizard',
      sourceRef,
    });

    if (!result.ok || !result.summary) {
      await db
        .update(learnings)
        .set({ status: 'failed', title: 'Analysis failed — tap to retry' })
        .where(eq(learnings.id, learningId));
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    const s = result.summary;

    // Update the learning row with real AI data.
    await db
      .update(learnings)
      .set({
        title: s.title,
        summary: s.summary,
        topic: s.topic ?? null,
        tags: s.tags ?? [],
        difficulty: s.difficulty ?? null,
        keyPoints: s.keyPoints ?? [],
        status: 'ready',
      })
      .where(eq(learnings.id, learningId));

    // Generate review items best-effort.
    try {
      const items = await generateReviewItems({
        title: s.title,
        summary: s.summary,
        keyPoints: s.keyPoints,
        sourceContent: result.resolvedContent,
      });
      if (items.length) {
        // Fetch userId from the learning row (enrich route has no session context)
        const [lr] = await db.select({ userId: learnings.userId }).from(learnings).where(eq(learnings.id, learningId!));
        if (lr?.userId) {
          await db.insert(reviewItems).values(
            items.map((it) => ({
              userId: lr.userId,
              learningId: learningId!,
              type: it.type,
              question: it.question,
              answer: it.answer,
              dueDate: todayISO(),
              srInterval: 1,
              srEase: 2.5,
            }))
          );
        }
      }
    } catch (err) {
      console.error('[enrich] generateReviewItems failed:', (err as Error).message);
    }

    revalidatePath('/library');
    revalidatePath('/home');
    revalidatePath('/review');

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[enrich] error:', (err as Error).message);
    if (learningId) {
      await db
        .update(learnings)
        .set({ status: 'failed', title: 'Analysis failed — tap to retry' })
        .where(eq(learnings.id, learningId));
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
