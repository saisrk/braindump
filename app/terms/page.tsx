import type { Metadata } from 'next';
import { LegalShell } from '@/components/legal/LegalShell';
import { CONTACT_EMAIL } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Service — Braindump',
  description: 'The terms that govern your use of Braindump.',
  alternates: { canonical: 'https://brain-dump.co/terms' },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" lastUpdated="June 28, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Braindump (the &ldquo;Service&rdquo;),
        operated by <strong>Sai Sreevals Consultancy</strong>. By creating an account or using the Service, you agree to these Terms.
        If you do not agree, do not use the Service.
      </p>

      <h2>1. The service</h2>
      <p>
        Braindump lets you capture content, generate AI study material (summaries, flashcards, quizzes, teach-backs), and retain
        knowledge through spaced repetition. We may modify or discontinue features at any time.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You sign in with your email address using a one-time code. You are responsible for keeping access to your email account
        secure and for all activity under your account. You must provide accurate information and be at least 13 years old.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or to capture content you do not have the right to use.</li>
        <li>Abuse, overload, scrape, or attempt to disrupt the Service.</li>
        <li>Reverse engineer, resell, or attempt to access the Service&rsquo;s underlying systems without authorization.</li>
      </ul>

      <h2>4. Your content</h2>
      <p>
        You retain ownership of the content you capture. By using the Service, you grant us a limited license to store, process,
        and transmit your content as needed to operate the Service&mdash;including sending it to our AI provider to generate study
        material on your behalf. You are responsible for the content you capture.
      </p>

      <h2>5. Subscriptions &amp; billing</h2>
      <ul>
        <li><strong>Free plan:</strong> includes a limited number of captures and learnings as described on our pricing page.</li>
        <li><strong>Pro plan:</strong> unlocks higher limits, quizzes, and additional features for a recurring fee.</li>
        <li>Paid subscriptions are billed through Stripe and renew automatically until cancelled.</li>
        <li>You may cancel any time from Settings; access continues until the end of the current billing period. Refunds are handled on a case-by-case basis&mdash;contact us.</li>
      </ul>

      <h2>6. AI-generated content</h2>
      <p>
        AI-generated summaries, flashcards, and quizzes may contain errors or omissions. They are study aids, not professional,
        legal, medical, or financial advice. Verify important information independently.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including its software, design, and branding, is owned by us and protected by applicable laws. These Terms do
        not grant you any rights to our intellectual property except as needed to use the Service.
      </p>

      <h2>8. Termination</h2>
      <p>
        You may stop using the Service and delete your account at any time. We may suspend or terminate your access if you violate
        these Terms or use the Service in a way that risks harm to us or others.
      </p>

      <h2>9. Disclaimers &amp; limitation of liability</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law, we are
        not liable for any indirect, incidental, or consequential damages, or for any loss of data, arising from your use of the
        Service.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of India, without regard to conflict-of-law principles. Any disputes will be subject
        to the exclusive jurisdiction of the courts located in <strong>Chennai, India</strong>.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these Terms from time to time. Material changes will be reflected by the &ldquo;Last updated&rdquo; date
        above. Continued use after changes constitutes acceptance.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms? Contact us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalShell>
  );
}
