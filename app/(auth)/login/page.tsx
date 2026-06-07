import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-600 dark:text-brand-400">
          Braindump
        </h1>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-dark-secondary">
          Sign in or create an account
        </p>
      </div>
      <Suspense fallback={<div className="w-full max-w-sm h-40 animate-pulse rounded-xl bg-muted" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
