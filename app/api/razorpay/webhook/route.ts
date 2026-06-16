import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature } from '@/lib/razorpay';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('x-razorpay-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });
  if (!verifyWebhookSignature(body, sig)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  let event: { event: string; payload: Record<string, unknown> };
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  try {
    switch (event.event) {
      case 'subscription.activated':
      case 'subscription.charged': {
        const sub = (event.payload as { subscription?: { entity?: Record<string, unknown> } })
          ?.subscription?.entity;
        if (!sub) break;

        const userId = (sub.notes as Record<string, string>)?.userId;
        if (!userId) break;

        const currentEnd = sub.current_end as number | null;
        const endsAt = currentEnd ? new Date(currentEnd * 1000) : null;

        await db
          .update(userProfiles)
          .set({ isPro: true, stripeSubscriptionId: sub.id as string, proSubscriptionEndsAt: endsAt, updatedAt: new Date() })
          .where(eq(userProfiles.userId, userId));
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.expired': {
        const sub = (event.payload as { subscription?: { entity?: Record<string, unknown> } })
          ?.subscription?.entity;
        if (!sub) break;

        const userId = (sub.notes as Record<string, string>)?.userId;
        if (!userId) break;

        await db
          .update(userProfiles)
          .set({ isPro: false, stripeSubscriptionId: null, proSubscriptionEndsAt: null, updatedAt: new Date() })
          .where(eq(userProfiles.userId, userId));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[razorpay webhook]', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
