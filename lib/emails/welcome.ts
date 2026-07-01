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

export async function sendWelcomeEmail(
  userId: string,
  email: string,
  name: string,
  firstLearningId: string | null
): Promise<void> {
  const teachbackPath = firstLearningId ? `/teachback?learningId=${firstLearningId}` : '/teachback';

  const [reviewUrl, teachbackUrl, libraryUrl] = await Promise.all([
    buildAutoLoginUrl(userId, '/review'),
    buildAutoLoginUrl(userId, teachbackPath),
    buildAutoLoginUrl(userId, '/library'),
  ]);

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      "You're in — your <strong>7-day full-access trial</strong> just started. Everything's unlocked: " +
      'capture, spaced-repetition review, quizzes, teach-backs, and Express.'
    ),
    buildEmailParagraph('Here\'s where to start:'),
    buildEmailButton(reviewUrl, 'Review your first cards →'),
    buildEmailButton(teachbackUrl, 'Try a Teach Back →'),
    buildEmailButton(libraryUrl, 'See your library →'),
    buildEmailParagraph(
      'Tip: the fastest way to remember something long-term is to test yourself on it within a ' +
      'day of capturing it — that\'s what Review and Teach Back are for.'
    ),
    buildEmailParagraph(
      "Your trial ends in 7 days. No card required — we'll email you before it does, and you decide then."
    ),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject: 'Your 7-day free trial starts now 🧠',
    html: buildEmailShell(body, buildPlainEmailFooter()),
  });
}
