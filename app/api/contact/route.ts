import { NextResponse } from 'next/server';
import { CONTACT_EMAIL } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /\S+@\S+\.\S+/;

export async function POST(request: Request) {
  const { email, name, message, company } = await request.json();

  // Honeypot — bots fill the hidden "company" field; silently accept and drop.
  if (company) return NextResponse.json({ ok: true });

  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!message || typeof message !== 'string' || !message.trim()) {
    return NextResponse.json({ error: 'Message is required' }, { status: 400 });
  }
  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message is too long' }, { status: 400 });
  }

  const safeName = typeof name === 'string' ? name.trim().slice(0, 200) : '';
  const safeMessage = message.trim().replace(/</g, '&lt;');
  const fromLine = safeName ? `${safeName} <${email}>` : email;

  const { Resend } = await import('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? 'noreply@brain-dump.co',
    to: CONTACT_EMAIL,
    replyTo: email,
    subject: `Braindump contact from ${fromLine}`,
    html: `<pre style="font-family:sans-serif;white-space:pre-wrap">${safeMessage}</pre><p style="color:#64748b;font-size:12px">From: ${safeName ? `${safeName} ` : ''}&lt;${email}&gt;</p>`,
  });

  return NextResponse.json({ ok: true });
}
