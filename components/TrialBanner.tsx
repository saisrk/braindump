import Link from 'next/link';

const F = 'Inter, system-ui, sans-serif';

/**
 * Slim banner shown across the app while a user is on their free trial,
 * nudging them toward subscribing before it ends.
 */
export function TrialBanner({ daysLeft }: { daysLeft: number | null }) {
  const days = daysLeft ?? 0;
  const label =
    days <= 0
      ? 'Your free trial ends today'
      : days === 1
        ? '1 day left in your free trial'
        : `${days} days left in your free trial`;

  return (
    <div
      className="flex items-center justify-center gap-3 px-4 py-2 text-center"
      style={{ background: 'rgba(199,154,62,0.12)', borderBottom: '1px solid rgba(199,154,62,0.35)' }}
    >
      <span style={{ fontFamily: F, fontSize: '13px', color: '#a8842f', fontWeight: 600 }}>
        {label}
      </span>
      <Link
        href="/pricing"
        style={{
          fontFamily: F,
          fontSize: '13px',
          fontWeight: 700,
          color: '#b5462f',
          textDecoration: 'none',
        }}
      >
        Upgrade →
      </Link>
    </div>
  );
}
