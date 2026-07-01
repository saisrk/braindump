import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';
import { nanoid } from 'nanoid';
import { db } from '@/db';
import { emailLoginTokens } from '@/db/schema';

const AUTO_LOGIN_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Creates a single-use auto-login token and returns a link that signs the
 * user straight in (via the `magic-link` credentials provider) and lands
 * them on `deepLink` — used so lifecycle emails don't force an OTP re-entry.
 */
export async function buildAutoLoginUrl(userId: string, deepLink: string): Promise<string> {
  const token = nanoid(32);
  await db.insert(emailLoginTokens).values({
    token,
    userId,
    expiresAt: new Date(Date.now() + AUTO_LOGIN_TOKEN_TTL_MS),
  });
  const to = encodeURIComponent(deepLink);
  return `${APP_URL}/api/auth/magic-login?token=${token}&to=${to}`;
}

export type UnsubscribeType = 'trialEnded' | 'weeklyReview' | 'featureNudge';

function unsubscribeSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not set');
  return secret;
}

/** Stateless one-click unsubscribe link — no login required to click it. */
export function signUnsubscribeToken(userId: string, type: UnsubscribeType): string {
  const payload = `${userId}.${type}`;
  const sig = createHmac('sha256', unsubscribeSecret()).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifyUnsubscribeToken(token: string): { userId: string; type: UnsubscribeType } | null {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const [userId, type, sig] = decoded.split('.');
    if (!userId || !type || !sig) return null;

    const expected = createHmac('sha256', unsubscribeSecret()).update(`${userId}.${type}`).digest('hex');
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    if (type !== 'trialEnded' && type !== 'weeklyReview' && type !== 'featureNudge') return null;
    return { userId, type };
  } catch {
    return null;
  }
}

function buildUnsubscribeUrl(userId: string, type: UnsubscribeType): string {
  const token = signUnsubscribeToken(userId, type);
  return `${APP_URL}/api/email/unsubscribe?u=${token}`;
}

/** Footer with no unsubscribe link — for one-time transactional sends like the welcome email. */
export function buildPlainEmailFooter(): string {
  return `
        <tr><td style="border-top:1px solid #1e293b;padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
            <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none;">Manage email preferences</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">Open Braindump</a>
          </p>
        </td></tr>`;
}

/** Shared footer for lifecycle emails — settings link + per-type unsubscribe. */
export function buildEmailFooter(userId: string, type: UnsubscribeType): string {
  const unsubscribeUrl = buildUnsubscribeUrl(userId, type);
  return `
        <tr><td style="border-top:1px solid #1e293b;padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
            <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none;">Manage email preferences</a>
            &nbsp;·&nbsp;
            <a href="${unsubscribeUrl}" style="color:#6366f1;text-decoration:none;">Unsubscribe</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">Open Braindump</a>
          </p>
        </td></tr>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? 'https://brain-dump.co';
const FROM = 'Braindump <digest@brain-dump.co>';

function buildSubject(dueCount: number, streak: number): string {
  const parts: string[] = [];
  if (dueCount > 0) parts.push(`${dueCount} item${dueCount === 1 ? '' : 's'} due for review`);
  if (streak > 0) parts.push(`${streak} day streak 🔥`);
  return parts.length > 0 ? parts.join(' · ') : 'Your daily Braindump digest';
}

function buildHtml(name: string, dueCount: number, streak: number): string {
  const reviewUrl = `${APP_URL}/review`;
  const greeting = name ? `Hi ${escapeHtml(name.split(' ')[0])},` : 'Hi,';

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;">🧠 Braindump</p>
        </td></tr>

        <!-- Greeting -->
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:16px;color:#cbd5e1;">${greeting}</p>
        </td></tr>

        <!-- Stats row -->
        <tr><td style="padding-bottom:32px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              ${dueCount > 0 ? `
              <td width="50%" style="padding-right:8px;">
                <div style="background:#1e1b4b;border:1px solid #3730a3;border-radius:12px;padding:16px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:800;color:#a5b4fc;">${dueCount}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#818cf8;">items due</p>
                </div>
              </td>` : ''}
              ${streak > 0 ? `
              <td width="50%" style="padding-left:${dueCount > 0 ? '8' : '0'}px;">
                <div style="background:#1c1917;border:1px solid #78350f;border-radius:12px;padding:16px;text-align:center;">
                  <p style="margin:0;font-size:28px;font-weight:800;color:#fbbf24;">${streak}</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#f59e0b;">day streak 🔥</p>
                </div>
              </td>` : ''}
            </tr>
          </table>
        </td></tr>

        <!-- CTA -->
        ${dueCount > 0 ? `
        <tr><td style="padding-bottom:32px;text-align:center;">
          <a href="${reviewUrl}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;">
            Start reviewing →
          </a>
        </td></tr>` : `
        <tr><td style="padding-bottom:32px;text-align:center;">
          <p style="margin:0;font-size:14px;color:#64748b;">No reviews due today — enjoy the day off! 🎉</p>
        </td></tr>`}

        <!-- Footer -->
        <tr><td style="border-top:1px solid #1e293b;padding-top:24px;">
          <p style="margin:0;font-size:12px;color:#475569;text-align:center;">
            <a href="${APP_URL}/settings" style="color:#6366f1;text-decoration:none;">Manage email preferences</a>
            &nbsp;·&nbsp;
            <a href="${APP_URL}" style="color:#6366f1;text-decoration:none;">Open Braindump</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function sendDigestEmail(
  to: string,
  name: string,
  dueCount: number,
  streak: number
): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping digest email');
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: FROM,
    to,
    subject: buildSubject(dueCount, streak),
    html: buildHtml(name, dueCount, streak),
  });

  if (error) {
    console.error('[email] Failed to send digest to', to, error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/** Shared low-level sender used by the lifecycle email templates in lib/emails/*. */
export async function sendRawEmail(opts: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set — skipping email:', opts.subject);
    return;
  }

  const { Resend } = await import('resend');
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: opts.from ?? FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });

  if (error) {
    console.error('[email] Failed to send to', opts.to, error);
    throw new Error(`Email send failed: ${error.message}`);
  }
}

/**
 * Shared dark-theme shell for lifecycle emails — pass a greeting + body HTML
 * (already using the same table-based layout conventions as buildHtml above)
 * and a footer built via buildEmailFooter/buildPlainEmailFooter.
 */
export function buildEmailShell(bodyHtml: string, footerHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#f1f5f9;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;">

        <!-- Header -->
        <tr><td style="padding-bottom:32px;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#f1f5f9;">🧠 Braindump</p>
        </td></tr>

        ${bodyHtml}

        ${footerHtml}

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function buildEmailButton(url: string, label: string): string {
  return `
        <tr><td style="padding-bottom:16px;text-align:center;">
          <a href="${url}" style="display:inline-block;background:#7c3aed;color:#fff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 32px;border-radius:12px;">
            ${escapeHtml(label)}
          </a>
        </td></tr>`;
}

export function buildEmailParagraph(html: string): string {
  return `
        <tr><td style="padding-bottom:20px;">
          <p style="margin:0;font-size:15px;line-height:1.6;color:#cbd5e1;">${html}</p>
        </td></tr>`;
}

export function buildEmailGreeting(name: string): string {
  const greeting = name ? `Hi ${escapeHtml(name.split(' ')[0])},` : 'Hi,';
  return `
        <tr><td style="padding-bottom:24px;">
          <p style="margin:0;font-size:16px;color:#cbd5e1;">${greeting}</p>
        </td></tr>`;
}

export { escapeHtml, APP_URL };
