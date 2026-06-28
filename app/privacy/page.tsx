import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CONTACT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy — Braindump',
  description: 'How Braindump collects, uses, and protects your data.',
  alternates: { canonical: 'https://brain-dump.co/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" lastUpdated="June 28, 2026">
      <p>
        This Privacy Policy explains how Braindump (&ldquo;Braindump&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;), operated by
        {' '}<strong>Sai Sreevals Consultancy</strong>, collects, uses, and protects your information when you use our website and
        application at brain-dump.co (the &ldquo;Service&rdquo;). By using the Service, you agree to this policy.
      </p>

      <h2>1. Who we are</h2>
      <p>
        Braindump is a knowledge-externalization tool that helps you capture what you learn, generate AI study material,
        and retain it through spaced repetition. If you have any questions about this policy, contact us at{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>2. Information we collect</h2>
      <ul>
        <li><strong>Account information:</strong> your email address, which we use for passwordless sign-in via one-time codes.</li>
        <li><strong>Content you create:</strong> the articles, URLs, notes, and files you capture, along with AI-generated summaries, flashcards, quizzes, and teach-back responses.</li>
        <li><strong>Usage &amp; activity data:</strong> review history, streaks, and feature usage needed to operate spaced repetition and show your progress.</li>
        <li><strong>Billing data:</strong> if you subscribe to Pro, subscription status and customer identifiers. Card details are handled by our payment processor and are never stored on our servers.</li>
        <li><strong>Technical data:</strong> basic device and analytics information collected automatically.</li>
      </ul>

      <h2>3. Third-party processors</h2>
      <p>We share data with the following service providers only as needed to run the Service:</p>
      <ul>
        <li><strong>Anthropic</strong> — to analyze captured content and generate summaries, flashcards, and quizzes.</li>
        <li><strong>Resend</strong> — to send transactional emails (sign-in codes, daily digests, support replies).</li>
        <li><strong>Stripe</strong> — to process Pro subscription payments.</li>
        <li><strong>Vercel</strong> — for hosting and privacy-friendly usage analytics.</li>
        <li><strong>Our database provider</strong> — to securely store your account and content.</li>
      </ul>

      <h2>4. How we use your data</h2>
      <ul>
        <li>To provide and maintain the Service and your account.</li>
        <li>To generate AI study material from the content you capture.</li>
        <li>To schedule reviews and track your learning progress.</li>
        <li>To send you daily review digests, which you can disable any time in Settings.</li>
        <li>To process subscriptions and prevent abuse.</li>
      </ul>

      <h2>5. Cookies &amp; tracking</h2>
      <p>
        We use a session cookie to keep you signed in and privacy-friendly analytics to understand aggregate usage. We do not
        sell your personal data or use third-party advertising trackers.
      </p>

      <h2>6. Data retention &amp; deletion</h2>
      <p>
        We retain your data for as long as your account is active. You can permanently delete your account, along with all your
        learnings, review cards, and history, at any time from the Settings page. Deletion is immediate and irreversible.
      </p>

      <h2>7. Your rights</h2>
      <p>
        Depending on your jurisdiction (including under India&rsquo;s Digital Personal Data Protection Act and the GDPR where
        applicable), you may have the right to access, correct, export, or delete your personal data. To exercise these rights,
        contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>

      <h2>8. Security</h2>
      <p>
        We protect your data with encryption in transit, rate-limited authentication, and access controls. No system is perfectly
        secure, but we take reasonable measures to safeguard your information.
      </p>

      <h2>9. Children</h2>
      <p>The Service is not directed at children under 13, and we do not knowingly collect their data.</p>

      <h2>10. Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Material changes will be reflected by the &ldquo;Last updated&rdquo; date above.
        Continued use of the Service after changes constitutes acceptance.
      </p>

      <h2>11. Contact</h2>
      <p>
        Questions? Reach us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{' '}
        or <strong>F8 Rani Residency A-Block, Velachery Main road, Sembakkam, Chennai - 73</strong>.
      </p>
    </LegalShell>
  );
}
