import 'server-only';

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
