import { NextResponse } from 'next/server';
import { db } from '@/db';
import { verificationTokens, users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signIn } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email, otp } = await request.json();

  if (!email || !otp) {
    return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // Look up the stored token.
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, normalised));

  if (!record) {
    return NextResponse.json({ error: 'No code found. Request a new one.' }, { status: 400 });
  }

  if (new Date() > record.expires) {
    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalised));
    return NextResponse.json({ error: 'Code expired. Request a new one.' }, { status: 400 });
  }

  if (record.token !== String(otp).trim()) {
    return NextResponse.json({ error: 'Incorrect code. Try again.' }, { status: 400 });
  }

  // Valid — consume the token.
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalised));

  // Upsert user (create if first time, otherwise just return existing).
  let [user] = await db.select().from(users).where(eq(users.email, normalised));
  if (!user) {
    [user] = await db
      .insert(users)
      .values({ email: normalised, emailVerified: new Date() })
      .returning();

    // Create profile row for new users.
    await db.insert(userProfiles).values({ userId: user.id }).onConflictDoNothing();
  } else if (!user.emailVerified) {
    // Mark existing user as verified on first successful OTP.
    await db
      .update(users)
      .set({ emailVerified: new Date() })
      .where(eq(users.id, user.id));
  }

  return NextResponse.json({ ok: true, userId: user.id, email: user.email });
}
