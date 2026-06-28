'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CONTACT_EMAIL, CONTACT_X_HANDLE, CONTACT_X_URL } from '@/lib/constants';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";
const TERRACOTTA = '#b5462f';
const INK = '#2a2620';
const INK2 = '#7c7361';
const FAINT = '#aaa190';
const RULE = '#e6e0d4';
const BG = '#f5f2ec';
const CARD = '#ffffff';

const linkStyle = { fontFamily: F, fontSize: '13px', color: INK2, textDecoration: 'none' } as const;
const inputStyle = {
  width: '100%',
  background: BG,
  border: `1px solid ${RULE}`,
  borderRadius: '10px',
  padding: '12px',
  fontSize: '14px',
  fontFamily: F,
  color: INK,
  boxSizing: 'border-box' as const,
};

export function ContactClient() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [hp, setHp] = useState(''); // honeypot
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const valid = /\S+@\S+\.\S+/.test(email) && message.trim().length > 0;

  const submit = async () => {
    if (!valid || state === 'sending') return;
    setState('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name, message, company: hp }),
      });
      if (res.ok) {
        setState('sent');
        setName('');
        setEmail('');
        setMessage('');
      } else {
        setState('error');
      }
    } catch {
      setState('error');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: BG, color: INK }}>
      <header style={{ borderBottom: `1px solid ${RULE}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '18px', color: INK, textDecoration: 'none' }}>Braindump</Link>
        <Link href="/" style={{ ...linkStyle, color: TERRACOTTA, fontWeight: 600 }}>← Back to home</Link>
      </header>

      <main style={{ maxWidth: '620px', margin: '0 auto', padding: '56px 24px 80px' }}>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '40px', lineHeight: 1.15, marginBottom: '12px' }}>Contact us</h1>
        <p style={{ fontFamily: F, fontSize: '15px', lineHeight: 1.7, color: INK2, marginBottom: '8px' }}>
          Questions, feedback, or bug reports? Email us directly at{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: TERRACOTTA, textDecoration: 'underline' }}>{CONTACT_EMAIL}</a>{' '}
          or message us on X at{' '}
          <a href={CONTACT_X_URL} target="_blank" rel="noopener noreferrer" style={{ color: TERRACOTTA, textDecoration: 'underline' }}>{CONTACT_X_HANDLE}</a>.
          We usually reply within a couple of business days.
        </p>

        <div style={{ background: CARD, border: `1px solid ${RULE}`, borderRadius: '16px', padding: '24px', marginTop: '32px' }}>
          <label style={{ display: 'block', fontFamily: F, fontSize: '13px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Name <span style={{ color: FAINT, fontWeight: 400 }}>(optional)</span></label>
          <input value={name} onChange={(e) => setName(e.target.value)} style={{ ...inputStyle, marginBottom: '16px' }} />

          <label style={{ display: 'block', fontFamily: F, fontSize: '13px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" style={{ ...inputStyle, marginBottom: '16px' }} />

          <label style={{ display: 'block', fontFamily: F, fontSize: '13px', fontWeight: 600, color: INK, marginBottom: '6px' }}>Message</label>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="How can we help?" style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} />

          {/* Honeypot — hidden from users, bots fill it */}
          <input
            value={hp}
            onChange={(e) => setHp(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />

          <button
            onClick={submit}
            disabled={!valid || state === 'sending' || state === 'sent'}
            style={{
              marginTop: '18px',
              width: '100%',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: state === 'sent' ? '#6f8a5a' : TERRACOTTA,
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              fontFamily: F,
              cursor: !valid || state === 'sending' || state === 'sent' ? 'not-allowed' : 'pointer',
              opacity: !valid ? 0.5 : 1,
            }}
          >
            {state === 'sending' ? 'Sending…' : state === 'sent' ? "Sent ✓ — we'll be in touch" : state === 'error' ? 'Failed — try again' : 'Send message'}
          </button>
          {state === 'sent' && (
            <p style={{ fontFamily: F, fontSize: '13px', color: INK2, marginTop: '12px', textAlign: 'center' }}>Thanks for reaching out!</p>
          )}
        </div>
      </main>

      <footer style={{ borderTop: `1px solid ${RULE}`, padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '15px', color: INK }}>Braindump</span>
        <p style={{ fontFamily: F, fontSize: '12px', color: FAINT }}>Knowledge externalization engine · {new Date().getFullYear()}</p>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <Link href="/privacy" style={linkStyle}>Privacy</Link>
          <Link href="/terms" style={linkStyle}>Terms</Link>
          <a href={CONTACT_X_URL} target="_blank" rel="noopener noreferrer" style={linkStyle}>X</a>
        </div>
      </footer>
    </div>
  );
}
