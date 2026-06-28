import type { Metadata } from 'next';
import { ContactClient } from './client';

export const metadata: Metadata = {
  title: 'Contact — Braindump',
  description: 'Get in touch with the Braindump team.',
  alternates: { canonical: 'https://brain-dump.co/contact' },
};

export default function ContactPage() {
  return <ContactClient />;
}
