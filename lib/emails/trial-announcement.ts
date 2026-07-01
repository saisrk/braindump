import 'server-only';
import {
  buildAutoLoginUrl,
  buildPlainEmailFooter,
  buildEmailShell,
  buildEmailButton,
  buildEmailParagraph,
  buildEmailGreeting,
  sendRawEmail,
} from '@/lib/email';

/**
 * One-off announcement for accounts that existed before the 7-day free
 * trial launched — they already got `proTrialEndsAt` backfilled by
 * migration 0014, this just tells them so.
 */
export async function sendTrialAnnouncementEmail(
  userId: string,
  email: string,
  name: string,
  trialDaysLeft: number
): Promise<void> {
  const libraryUrl = await buildAutoLoginUrl(userId, '/library');
  const plural = trialDaysLeft === 1 ? '' : 's';

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      "We've just introduced <strong>Braindump Pro</strong> — and as a thank you for being here " +
      "already, we've given your account full access to everything in it: quizzes, unlimited " +
      'teach-backs, unlimited Express generations, and priority processing.'
    ),
    buildEmailButton(libraryUrl, 'See what\'s unlocked →'),
    buildEmailParagraph(
      `This full access runs for <strong>${trialDaysLeft} more day${plural}</strong> — no card on ` +
      'file, nothing charged automatically. If you want to keep it after that, you can subscribe ' +
      'any time from Settings.'
    ),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject: "You've got full access to Braindump Pro — free for a limited time",
    html: buildEmailShell(body, buildPlainEmailFooter()),
  });
}
