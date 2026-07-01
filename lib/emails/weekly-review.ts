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

export async function sendWeeklyReviewEmail(
  userId: string,
  email: string,
  name: string,
  dueCount: number
): Promise<void> {
  const reviewUrl = await buildAutoLoginUrl(userId, '/review');
  const plural = dueCount === 1 ? '' : 's';

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      `You've got <strong>${dueCount} item${plural}</strong> due for review this week — a few ` +
      'minutes now keeps them from slipping away.'
    ),
    buildEmailButton(reviewUrl, 'Start reviewing →'),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject: `${dueCount} learning${plural} ready to review`,
    html: buildEmailShell(body, buildEmailFooter(userId, 'weeklyReview')),
  });
}
