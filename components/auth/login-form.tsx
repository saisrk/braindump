'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Step = 'email' | 'otp';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/home';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const isDev = process.env.NODE_ENV !== 'production';

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to send code. Try again.');
        return;
      }
      setStep('otp');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Verify the OTP against our own endpoint first.
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Invalid code. Try again.');
        return;
      }

      // OTP valid — sign in via NextAuth credentials using email as token.
      // We use the email-otp provider which the adapter handles.
      const result = await signIn('email-otp', {
        email,
        redirect: false,
      });

      if (result?.error) {
        // Fallback: OTP was valid, try refreshing to pick up the session.
        router.push(callbackUrl);
        router.refresh();
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    await signIn('google', { callbackUrl });
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-sm">
      {/* Google */}
      <Button
        type="button"
        onClick={handleGoogle}
        disabled={loading}
        className="flex items-center justify-center gap-2 w-full border border-border bg-background text-foreground hover:bg-muted"
      >
        <GoogleIcon />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <hr className="flex-1 border-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <hr className="flex-1 border-border" />
      </div>

      {step === 'email' ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Send sign-in code
          </Button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
          <div className="text-center text-sm text-muted-foreground">
            Code sent to <span className="font-medium text-foreground">{email}</span>
          </div>
          {isDev && (
            <div className="rounded-lg bg-amber-950/40 border border-amber-800 px-3 py-2 text-xs text-amber-400">
              Dev mode — use code <span className="font-mono font-bold">123456</span>
            </div>
          )}
          <Input
            label="Sign-in code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            required
            autoFocus
            autoComplete="one-time-code"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" loading={loading} className="w-full">
            Verify code
          </Button>
          <button
            type="button"
            onClick={() => { setStep('email'); setOtp(''); setError(''); }}
            className="text-sm text-muted-foreground hover:text-foreground text-center"
          >
            ← Change email
          </button>
        </form>
      )}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  );
}
