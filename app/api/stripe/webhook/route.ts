import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) return NextResponse.json({ error: 'No signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.subscription) break;

        const subId = typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription.id;

        const sub = await stripe.subscriptions.retrieve(subId);
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
        const endsAt = new Date(periodEnd * 1000);

        await db
          .update(userProfiles)
          .set({ isPro: true, stripeSubscriptionId: sub.id, proSubscriptionEndsAt: endsAt, updatedAt: new Date() })
          .where(eq(userProfiles.userId, userId));
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        if (!userId) break;

        const isActive = event.type === 'customer.subscription.updated'
          && (sub.status === 'active' || sub.status === 'trialing');

        const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
        const endsAt = periodEnd ? new Date(periodEnd * 1000) : null;

        await db
          .update(userProfiles)
          .set({
            isPro: isActive,
            stripeSubscriptionId: isActive ? sub.id : null,
            proSubscriptionEndsAt: isActive ? endsAt : null,
            updatedAt: new Date(),
          })
          .where(eq(userProfiles.userId, userId));
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[stripe webhook]', err);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
