import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-brand-600 dark:text-brand-400">
          Braindump
        </h1>
        <p className="mt-2 text-sm text-text-secondary dark:text-text-dark-secondary">
          Sign in to your account
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
