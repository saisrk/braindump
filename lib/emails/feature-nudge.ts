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

export type NudgeFeature = 'teachback' | 'quiz' | 'express';

export async function sendFeatureNudgeEmail(
  userId: string,
  email: string,
  name: string,
  feature: NudgeFeature,
  learningTitle: string | null,
  deepLink: string
): Promise<void> {
  const url = await buildAutoLoginUrl(userId, deepLink);

  const verb =
    feature === 'teachback'
      ? 'taught back'
      : feature === 'quiz'
      ? 'quizzed yourself on'
      : 'turned into content';

  const ctaLabel =
    feature === 'teachback'
      ? `Try Teach Back${learningTitle ? ` on "${learningTitle}"` : ''} →`
      : feature === 'quiz'
      ? `Take a quiz${learningTitle ? ` on "${learningTitle}"` : ''} →`
      : 'Try Express →';

  const subject =
    learningTitle && feature !== 'express'
      ? `${feature === 'teachback' ? 'Teach back' : 'Test yourself on'} "${learningTitle}"`
      : 'Turn what you learned into something useful';

  const body = [
    buildEmailGreeting(name),
    buildEmailParagraph(
      `You haven't ${verb} anything in a few days. A quick round-trip locks in what you've ` +
      "captured — and it takes 2 minutes."
    ),
    buildEmailButton(url, ctaLabel),
  ].join('\n');

  await sendRawEmail({
    to: email,
    subject,
    html: buildEmailShell(body, buildEmailFooter(userId, 'featureNudge')),
  });
}
