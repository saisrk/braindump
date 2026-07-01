import { db } from '@/db';
import { reviewItems, users, userProfiles } from '@/db/schema';
import { eq, and, lte } from 'drizzle-orm';
import { Sidebar } from '@/components/navigation/sidebar';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { Paywall } from '@/components/Paywall';
import { TrialBanner } from '@/components/TrialBanner';
import { BookTransitionProvider } from '@/context/book-transition';
import { todayISO } from '@/lib/utils';
import { getOptionalUserId } from '@/lib/session';
import { entitlementInfo, type Entitlement } from '@/lib/entitlements';
import { redirect, RedirectType } from 'next/navigation';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let dueCount = 0;
  let userEmail: string | undefined;
  let userName: string | undefined;
  let entitlement: Entitlement = 'pro';
  let trialDaysLeft: number | null = null;

  try {
    const userId = await getOptionalUserId();

    if (!userId) {
      redirect('/login', RedirectType.replace);
    }

    // Fetch auth record (email/name) and profile (onboarding + entitlement) in parallel.
    const [[user], [profile]] = await Promise.all([
      db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)),
      db
        .select({
          onboardedAt: userProfiles.onboardedAt,
          isPro: userProfiles.isPro,
          proSubscriptionEndsAt: userProfiles.proSubscriptionEndsAt,
          proTrialEndsAt: userProfiles.proTrialEndsAt,
        })
        .from(userProfiles)
        .where(eq(userProfiles.userId, userId)),
    ]);

    if (!profile?.onboardedAt) {
      redirect('/onboarding');
    }
    userEmail = user?.email ?? undefined;
    userName = user?.name ?? undefined;

    const info = entitlementInfo({
      isPro: profile?.isPro ?? false,
      proSubscriptionEndsAt: profile?.proSubscriptionEndsAt ?? null,
      proTrialEndsAt: profile?.proTrialEndsAt ?? null,
    });
    entitlement = info.entitlement;
    trialDaysLeft = info.trialDaysLeft;

    const today = todayISO();
    const dueReviews = await db
      .select({ id: reviewItems.id })
      .from(reviewItems)
      .where(and(eq(reviewItems.userId, userId), lte(reviewItems.dueDate, today)));
    dueCount = dueReviews.length;
  } catch (e) {
    // Re-throw Next.js navigation signals (redirect/notFound) — never swallow these.
    if (isRedirectError(e)) throw e;
    // Suppress genuine db errors (e.g. missing env vars at build time).
  }

  // Hard paywall: a finished trial with no subscription blocks the whole app.
  if (entitlement === 'expired') {
    return <Paywall />;
  }

  return (
    <BookTransitionProvider>
      <div className="flex h-screen flex-col bg-background md:flex-row">
        {/* Sidebar for desktop */}
        <aside className="hidden border-r border-border md:flex md:w-64 md:flex-col">
          <Sidebar
            dueCount={dueCount}
            userEmail={userEmail}
            userName={userName}
          />
        </aside>

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-hidden pb-20 md:pb-0">
          {entitlement === 'trial' && <TrialBanner daysLeft={trialDaysLeft} />}
          {children}
        </main>

        {/* Bottom nav for mobile */}
        <nav className="fixed bottom-0 left-0 right-0 border-t border-border md:hidden">
          <BottomNav />
        </nav>
      </div>
    </BookTransitionProvider>
  );
}
