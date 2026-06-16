'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Sun, Moon, Trash2, ChevronDown, Zap } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import { useTheme } from 'next-themes';
import { logout } from '@/lib/actions/auth';
import { savePreferences, deleteAccount, type UserPreferences, type ReviewDifficulty } from '@/lib/actions/settings';
import { cancelSubscription } from '@/lib/actions/billing';

const F = "'Inter', system-ui, sans-serif";
const SERIF = "'Spectral', Georgia, serif";

const DIFFICULTY_OPTIONS: { value: ReviewDifficulty; label: string; desc: string }[] = [
  { value: 'relaxed', label: 'Relaxed', desc: 'Longer gaps — good for casual review' },
  { value: 'standard', label: 'Standard', desc: 'Default SM-2 scheduling' },
  { value: 'intensive', label: 'Intensive', desc: 'Shorter gaps — maximum retention' },
];

function Select({ value, options, onChange, disabled }: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          appearance: 'none',
          background: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          borderRadius: '8px',
          padding: '7px 32px 7px 12px',
          fontSize: '13px',
          fontWeight: 600,
          fontFamily: F,
          color: 'var(--color-foreground)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown style={{ position: 'absolute', right: '8px', width: '14px', height: '14px', color: 'var(--color-muted-foreground)', pointerEvents: 'none' }} />
    </div>
  );
}

function Toggle({ checked, onChange, disabled }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        background: checked ? '#b5462f' : 'var(--color-border)',
        position: 'relative', transition: 'background 0.2s ease', flexShrink: 0,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span style={{
        position: 'absolute', top: '3px', left: checked ? '23px' : '3px',
        width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
        transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,.2)',
      }} />
    </button>
  );
}

interface Props {
  initialSettings: UserPreferences;
  isPro: boolean;
  subscriptionEndsAt: Date | null;
}

export function SettingsClient({ initialSettings, isPro, subscriptionEndsAt }: Props) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [logging, setLogging] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [difficulty, setDifficulty] = useState<ReviewDifficulty>(initialSettings.reviewDifficulty);
  const [digestEnabled, setDigestEnabled] = useState(initialSettings.dailyDigestEnabled);

  const handleLogout = async () => {
    setLogging(true);
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error(err);
      setLogging(false);
    }
  };

  const handleDifficultyChange = async (v: string) => {
    const val = v as ReviewDifficulty;
    setDifficulty(val);
    setSaving(true);
    await savePreferences({ reviewDifficulty: val });
    setSaving(false);
  };

  const handleDigestToggle = async (v: boolean) => {
    setDigestEnabled(v);
    setSaving(true);
    await savePreferences({ dailyDigestEnabled: v });
    setSaving(false);
  };

  const handleManageSubscription = async () => {
    if (!confirm('Cancel your subscription at the end of the current billing period?')) return;
    setPortalLoading(true);
    try {
      await cancelSubscription();
      router.refresh();
    } catch {
      setPortalLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const difficultyDesc = DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.desc ?? '';
  const renewsLabel = subscriptionEndsAt
    ? subscriptionEndsAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-8 md:px-8">
        <PageHeader
          eyebrow="Configuration"
          title="Settings"
          subtitle="Customize your Braindump experience"
          className="mb-6"
        />

        <div className="max-w-2xl space-y-5">

          {/* Appearance */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-primary mb-5">Appearance</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">Theme</p>
                <p className="text-sm text-muted-foreground mt-0.5">Choose your preferred reading light</p>
              </div>
              <div className="flex border border-border rounded-lg overflow-hidden">
                {[
                  { value: 'light', label: 'Light', icon: <Sun className="h-3.5 w-3.5" /> },
                  { value: 'dark', label: 'Dark', icon: <Moon className="h-3.5 w-3.5" /> },
                  { value: 'system', label: 'System', icon: null },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-colors border-r border-border last:border-0"
                    style={
                      theme === t.value
                        ? { background: '#b5462f', color: '#fff' }
                        : { background: 'transparent', color: 'var(--color-muted-foreground)' }
                    }
                  >
                    {t.icon}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subscription */}
          <div className="rounded-xl border border-border bg-card p-6" style={isPro ? { borderColor: 'rgba(181,70,47,.4)', boxShadow: '0 4px 20px -8px rgba(181,70,47,.2)' } : {}}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-primary">Plan</h3>
              {isPro && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(181,70,47,0.1)', color: '#b5462f', fontFamily: F, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', padding: '3px 10px', borderRadius: '99px', border: '1px solid rgba(181,70,47,.3)' }}>
                  <Zap style={{ width: '10px', height: '10px' }} />
                  PRO
                </span>
              )}
            </div>

            {isPro ? (
              <div className="divide-y divide-border">
                <div className="pb-4">
                  <p className="font-semibold text-foreground">Braindump Pro</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {renewsLabel ? `Renews ${renewsLabel}` : 'Active subscription'}
                  </p>
                </div>
                <div className="pt-4">
                  <button
                    onClick={handleManageSubscription}
                    disabled={portalLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-all"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }}
                  >
                    {portalLoading ? 'Cancelling…' : 'Cancel subscription'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-semibold text-foreground">Free</p>
                <p className="text-sm text-muted-foreground mt-0.5 mb-4">5 captures/day · 1 free Express generation</p>
                <button
                  onClick={() => router.push('/pricing')}
                  style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontFamily: F, fontWeight: 700, fontSize: '14px', cursor: 'pointer', boxShadow: '0 6px 16px -6px rgba(181,70,47,.5)' }}
                >
                  <Zap style={{ width: '15px', height: '15px' }} />
                  Upgrade to Pro — from $8/mo
                </button>
              </div>
            )}
          </div>

          {/* Learning Preferences */}
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-semibold text-primary">Learning Preferences</h3>
              {saving && <span style={{ fontSize: '12px', color: 'var(--color-muted-foreground)', fontFamily: F }}>Saving…</span>}
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-start justify-between py-4 first:pt-0 gap-4">
                <div>
                  <p className="font-semibold text-foreground">Review Difficulty</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{difficultyDesc}</p>
                </div>
                <Select
                  value={difficulty}
                  options={DIFFICULTY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  onChange={handleDifficultyChange}
                  disabled={saving}
                />
              </div>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="font-semibold text-foreground">Daily Reminder</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {digestEnabled ? 'Email digest sent each morning with due reviews' : 'Get notified about due reviews by email'}
                  </p>
                </div>
                <Toggle checked={digestEnabled} onChange={handleDigestToggle} disabled={saving} />
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-primary mb-5">Account</h3>
            <div className="divide-y divide-border">
              <div className="py-4 first:pt-0">
                <p className="font-semibold text-foreground mb-0.5">Session</p>
                <p className="text-sm text-muted-foreground mb-3">Log out and sign in on another device or account.</p>
                <button
                  onClick={handleLogout}
                  disabled={logging}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-all"
                  style={{ borderColor: '#b5462f', color: '#b5462f' }}
                >
                  <LogOut className="h-4 w-4" />
                  {logging ? 'Logging out…' : 'Logout'}
                </button>
              </div>
              <div className="py-4">
                <p className="font-semibold text-foreground mb-0.5">Delete Account</p>
                <p className="text-sm text-muted-foreground mb-3">Permanently remove your account and all data. This cannot be undone.</p>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border py-3 text-sm font-semibold transition-all"
                  style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted-foreground)' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#b5462f'; e.currentTarget.style.color = '#b5462f'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-muted-foreground)'; }}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-muted/50 p-5">
            <p className="text-sm text-muted-foreground">Braindump v1.0 · Knowledge externalization engine.</p>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(42,38,32,0.6)', padding: '20px' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowDeleteModal(false); }}
        >
          <div style={{ background: 'var(--color-card)', borderRadius: '16px', border: '1px solid var(--color-border)', padding: '28px', maxWidth: '420px', width: '100%', boxShadow: '0 24px 48px -12px rgba(42,38,32,0.4)' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(181,70,47,0.12)', display: 'grid', placeItems: 'center', marginBottom: '16px' }}>
              <Trash2 style={{ width: '20px', height: '20px', color: '#b5462f' }} />
            </div>
            <h3 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: '20px', color: 'var(--color-foreground)', marginBottom: '10px' }}>
              Delete your account?
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--color-muted-foreground)', fontFamily: F, marginBottom: '24px' }}>
              This will permanently delete your account, all learnings, review cards, and history. There is no way to recover this data.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowDeleteModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid var(--color-border)', background: 'var(--color-card)', color: 'var(--color-foreground)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: F }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', background: '#b5462f', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: deleting ? 'not-allowed' : 'pointer', opacity: deleting ? 0.7 : 1, fontFamily: F }}
              >
                {deleting ? 'Deleting…' : 'Yes, delete everything'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
