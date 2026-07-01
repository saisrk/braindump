import 'server-only';
import {
  buildAutoLoginUrl,
  buildEmailFooter,
  buildEmailShell,
  buildEmailButton,
  buildEmailParagraph,
  buildEmailGreeting,
  sendRawEmail,
} from '@/lib/email';

export async function sendTrialEndedEmail(userId: string, email: string, name: string): Promise<void> {
  const pricingUrl = await buildAutoLoginUrl(userId, '/pricing');

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      'Your 7-day free trial just ended. Your library, streak, and progress are all saved and ' +
      'waiting — you just need Pro to keep going.'
    ),
    buildEmailButton(pricingUrl, 'See plans & subscribe →'),
    buildEmailParagraph(
      'Braindump Pro keeps capture, review, quizzes, teach-backs, and Express fully unlocked, ' +
      'billed monthly or annually — see current pricing. Cancel anytime.'
    ),
    buildEmailParagraph('Questions? Just reply to this email.'),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject: 'Your Braindump trial has ended',
    html: buildEmailShell(body, buildEmailFooter(userId, 'trialEnded')),
  });
}
