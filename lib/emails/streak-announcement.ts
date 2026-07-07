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
import { TRIAL_DAYS, type Entitlement } from '@/lib/entitlements';

export interface StreakAnnouncementTrial {
  entitlement: Entitlement;
  /** 1-based day within the 7-day trial, or null when not on trial. */
  trialDayNumber: number | null;
  /** Whole days of trial access remaining, or null when not on trial. */
  trialDaysLeft: number | null;
}

/** Builds the one contextual line telling the user where they stand today. */
function trialLine(info: StreakAnnouncementTrial): string {
  if (info.entitlement === 'trial' && info.trialDayNumber) {
    const left = info.trialDaysLeft ?? 0;
    const plural = left === 1 ? '' : 's';
    const leftPhrase =
      left > 0 ? ` — ${left} day${plural} of full access left` : '';
    return (
      `You're on <strong>day ${info.trialDayNumber} of your ${TRIAL_DAYS}-day free trial</strong>` +
      `${leftPhrase}. Every capture, quiz, and teach-back keeps your streak alive.`
    );
  }
  if (info.entitlement === 'pro') {
    return (
      "You're a <strong>Braindump Pro</strong> member — thanks for the support. " +
      'Every capture, quiz, and teach-back keeps your streak alive.'
    );
  }
  return (
    'Your free trial has wrapped up, but your streak and sharing are still yours — ' +
    'keep the momentum going.'
  );
}

/**
 * One-off announcement introducing sharable learning streaks. Deep-links the
 * user straight to their dashboard (auto-login) and tells them where they are
 * in their free trial today.
 */
export async function sendStreakAnnouncementEmail(
  userId: string,
  email: string,
  name: string,
  trial: StreakAnnouncementTrial
): Promise<void> {
  const dashboardUrl = await buildAutoLoginUrl(userId, '/home');

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      'Your learning streak just got social. 🔥 We now show your daily streak right ' +
        'on your dashboard — current run, longest streak, and a 14-day activity map — ' +
        'and you can share it with the world with one tap.'
    ),
    buildEmailParagraph(trialLine(trial)),
    buildEmailButton(dashboardUrl, 'Open your dashboard →'),
    buildEmailParagraph(
      'Want to show it off? Flip on <strong>Streak Sharing</strong> from your dashboard ' +
        '(or Settings) to get a public link — it shows your streak and totals, never your ' +
        'notes or content, and you can turn it off anytime.'
    ),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject: 'New: share your learning streak 🔥',
    html: buildEmailShell(body, buildPlainEmailFooter()),
  });
}
