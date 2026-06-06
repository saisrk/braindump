import { redirect } from 'next/navigation';

// Signup and login are now the same flow — email OTP auto-creates accounts.
export default function SignupPage() {
  redirect('/login');
}
