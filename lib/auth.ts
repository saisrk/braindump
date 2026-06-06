import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/db';
import { userProfiles } from '@/db/schema';

// Check if db is properly initialized (not empty object from build-time initialization)
const hasDb = db && Object.keys(db).length > 0;

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...(hasDb ? { adapter: DrizzleAdapter(db) } : {}),
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    verifyRequest: '/login/verify',
  },
  providers: [
    // Email OTP provider — NextAuth sends a magic-link/OTP via email.
    // We override the sendVerificationRequest to use Resend and send a
    // 6-digit code instead of a magic link.
    {
      id: 'email-otp',
      name: 'Email',
      type: 'email',
      from: process.env.EMAIL_FROM ?? 'noreply@braindump.app',
      server: {},
      maxAge: 10 * 60, // OTP valid for 10 minutes
      async generateVerificationToken() {
        // In non-production, always return the hardcoded dev OTP.
        if (process.env.NODE_ENV !== 'production') return '123456';
        return String(Math.floor(100000 + Math.random() * 900000));
      },
      async sendVerificationRequest({ identifier: email, token, url }) {
        if (process.env.NODE_ENV !== 'production') {
          // Skip sending in dev — developer uses 123456.
          console.log(`[auth] Dev OTP for ${email}: ${token}`);
          return;
        }
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'noreply@braindump.app',
          to: email,
          subject: `${token} — your Braindump sign-in code`,
          html: `
            <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
              <h2 style="margin:0 0 8px;">Your sign-in code</h2>
              <p style="margin:0 0 24px;color:#64748b;">Enter this code in Braindump. It expires in 10 minutes.</p>
              <div style="font-size:40px;font-weight:800;letter-spacing:8px;color:#7c3aed;">${token}</div>
              <p style="margin:32px 0 0;font-size:12px;color:#94a3b8;">
                If you didn't request this, you can safely ignore this email.
              </p>
            </div>
          `,
        });
        // NextAuth expects the URL to be fetched to validate the token internally.
        // We're using OTP (code entry) not a magic link, so we don't redirect to the URL.
        // The URL is still generated but not sent to the user.
        void url;
      },
    },
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    }),
  ],
  events: {
    async createUser({ user }) {
      // Auto-create an empty profile row whenever a new user is registered.
      if (user.id && hasDb) {
        await db.insert(userProfiles).values({ userId: user.id }).onConflictDoNothing();
      }
    },
  },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});
