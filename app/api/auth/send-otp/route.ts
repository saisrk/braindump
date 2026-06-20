import { NextResponse } from 'next/server';
import { db } from '@/db';
import { verificationTokens, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { signIn } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const normalised = email.trim().toLowerCase();

  // Generate OTP — hardcoded in dev, random 6 digits in production.
  const otp =
    process.env.NODE_ENV !== 'production'
      ? '123456'
      : String(Math.floor(100000 + Math.random() * 900000));

  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Rate limit: reject if a token was created within the last 60 seconds.
  const [existing] = await db
    .select({ createdAt: verificationTokens.createdAt })
    .from(verificationTokens)
    .where(eq(verificationTokens.identifier, normalised));
  if (existing && Date.now() - existing.createdAt.getTime() < 60_000) {
    return NextResponse.json(
      { error: 'Please wait before requesting another code.' },
      { status: 429 }
    );
  }

  // Upsert — replace any existing token for this email.
  await db
    .delete(verificationTokens)
    .where(eq(verificationTokens.identifier, normalised));

  await db.insert(verificationTokens).values({
    identifier: normalised,
    token: otp,
    expires,
  });

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[auth] Dev OTP for ${normalised}: ${otp}`);
    return NextResponse.json({ ok: true });
  }

  // Send via Resend in production.
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? 'noreply@brain-dump.co',
      to: normalised,
      subject: `${otp} — your Braindump sign-in code`,
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
          <h2 style="margin:0 0 8px;">Your sign-in code</h2>
          <p style="margin:0 0 24px;color:#64748b;">Enter this code in Braindump. It expires in 10 minutes.</p>
          <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#7c3aed;">${otp}</div>
          <p style="margin:32px 0 0;font-size:12px;color:#94a3b8;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[auth] Failed to send OTP email', err);
    return NextResponse.json({ error: 'Failed to send code. Try again.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
