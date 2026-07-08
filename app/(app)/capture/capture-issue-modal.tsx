'use client';

import Link from 'next/link';
import { CAPTURE_ISSUE_COPY, type CaptureIssueKind } from '@/lib/source-issues';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

export function CaptureIssueModal({
  kind,
  onDismiss,
  actionHref,
}: {
  kind: CaptureIssueKind;
  onDismiss: () => void;
  /** When set, the primary button links here (e.g. back to /capture) instead of just dismissing. */
  actionHref?: string;
}) {
  const copy = CAPTURE_ISSUE_COPY[kind];

  return (
    <div
      onClick={onDismiss}
      style={{
        position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(20,18,14,.45)',
        display: 'grid', placeItems: 'center', padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="rounded-2xl border border-border bg-card"
        style={{ maxWidth: '380px', width: '100%', padding: '28px', boxShadow: '0 24px 60px -20px rgba(0,0,0,.35)' }}
      >
        <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(181,70,47,.12)', border: '1.5px solid rgba(181,70,47,.3)', display: 'grid', placeItems: 'center', margin: '0 auto 20px', fontSize: '26px' }}>
          {copy.icon}
        </div>
        <h2 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '20px', color: 'var(--color-foreground)', textAlign: 'center', marginBottom: '8px' }}>
          {copy.title}
        </h2>
        <p style={{ fontFamily: F, fontSize: '13.5px', color: 'var(--color-muted-foreground)', textAlign: 'center', lineHeight: 1.6, marginBottom: '24px' }}>
          {copy.body}
        </p>
        {actionHref ? (
          <Link
            href={actionHref}
            style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '14px', textAlign: 'center', textDecoration: 'none' }}
          >
            {copy.cta}
          </Link>
        ) : (
          <button
            onClick={onDismiss}
            style={{ width: '100%', padding: '12px 20px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
          >
            {copy.cta}
          </button>
        )}
        {actionHref && (
          <button
            onClick={onDismiss}
            style={{ display: 'block', width: '100%', marginTop: '10px', background: 'transparent', border: 'none', color: 'var(--color-muted-foreground)', fontFamily: F, fontSize: '13px', cursor: 'pointer' }}
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
