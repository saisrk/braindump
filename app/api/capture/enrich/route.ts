import { NextResponse } from 'next/server';
import { db } from '@/db';
import { learnings, reviewItems } from '@/db/schema';
import { and, eq } from 'drizzle-orm';
import { analyzeCapture } from '@/lib/actions/capture';
import { generateReviewItems } from '@/lib/ai/capture';
import { todayISO } from '@/lib/utils';
import { revalidatePath } from 'next/cache';
import { getOptionalUserId } from '@/lib/session';

export const dynamic = 'force-dynamic';
// Allow up to 60 seconds for AI analysis.
export const maxDuration = 60;

export async function POST(request: Request) {
  const userId = await getOptionalUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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

    // Verify ownership before doing any work.
    const [owned] = await db
      .select({ id: learnings.id })
      .from(learnings)
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, userId)));
    if (!owned) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
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
        .set({
          status: 'failed',
          title: 'Analysis failed — tap to retry',
          failureReason: result.errorKind ?? 'ai_failed',
        })
        .where(and(eq(learnings.id, learningId), eq(learnings.userId, userId)));
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
      .where(and(eq(learnings.id, learningId), eq(learnings.userId, userId)));

    // Generate review items best-effort.
    try {
      const items = await generateReviewItems({
        title: s.title,
        summary: s.summary,
        keyPoints: s.keyPoints,
        sourceContent: result.resolvedContent,
      });
      if (items.length) {
        await db.insert(reviewItems).values(
          items.map((it) => ({
            userId,
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
        .set({ status: 'failed', title: 'Analysis failed — tap to retry', failureReason: 'ai_failed' })
        .where(and(eq(learnings.id, learningId), eq(learnings.userId, userId)));
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
