import { NextResponse } from 'next/server';
import { getOptionalUserId } from '@/lib/session';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { CONTACT_EMAIL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const userId = await getOptionalUserId();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { message } = await request.json();
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }

  const [user] = await db.select({ email: users.email }).from(users).where(eq(users.id, userId));

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@brain-dump.co',
    to: CONTACT_EMAIL,
    subject: `Braindump feedback from ${user?.email ?? userId}`,
    html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${message.trim().replace(/</g, '&lt;')}</pre><p style="color:#64748b;font-size:12px">From: ${user?.email ?? userId}</p>`,
  });

  return NextResponse.json({ ok: true });
}
