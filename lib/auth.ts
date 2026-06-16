import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/db';
import { verificationTokens, users, userProfiles } from '@/db/schema';
import { eq } from 'drizzle-orm';

const hasDb = db && Object.keys(db).length > 0;

const TESTER_EMAIL = 'tester@brain-dump.co';
const TESTER_PASSWORD = 'tester@12345';

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: '/login',
  },
  providers: [
    Credentials({
      id: 'tester',
      name: 'Tester',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!hasDb) return null;
        const email = String(credentials?.email ?? '').trim().toLowerCase();
        const password = String(credentials?.password ?? '');
        if (email !== TESTER_EMAIL || password !== TESTER_PASSWORD) return null;

        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
          [user] = await db
            .insert(users)
            .values({ email, name: 'Tester', emailVerified: new Date() })
            .returning();
        }
        await db.insert(userProfiles).values({ userId: user.id }).onConflictDoNothing();
        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    Credentials({
      id: 'email-otp',
      name: 'Email OTP',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'Code', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp || !hasDb) return null;

        const email = String(credentials.email).trim().toLowerCase();
        const otp = String(credentials.otp).trim();

        const [record] = await db
          .select()
          .from(verificationTokens)
          .where(eq(verificationTokens.identifier, email));

        if (!record) return null;
        if (new Date() > record.expires) {
          await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));
          return null;
        }
        if (record.token !== otp) return null;

        // Consume the token.
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email));

        // Upsert user.
        let [user] = await db.select().from(users).where(eq(users.email, email));
        if (!user) {
          [user] = await db
            .insert(users)
            .values({ email, emailVerified: new Date() })
            .returning();
        } else if (!user.emailVerified) {
          await db.update(users).set({ emailVerified: new Date() }).where(eq(users.id, user.id));
        }

        // Ensure profile row exists for all users (new and returning).
        await db.insert(userProfiles).values({ userId: user.id }).onConflictDoNothing();

        return { id: user.id, email: user.email, name: user.name, image: user.image };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, upsert user + profile in our own tables.
      if (account?.provider === 'google' && hasDb && user.email) {
        let [existing] = await db.select().from(users).where(eq(users.email, user.email));
        if (!existing) {
          [existing] = await db
            .insert(users)
            .values({
              email: user.email,
              name: user.name ?? null,
              image: user.image ?? null,
              emailVerified: new Date(),
            })
            .returning();
        }
        // Ensure profile row exists for all users (new and returning).
        await db.insert(userProfiles).values({ userId: existing.id }).onConflictDoNothing();
        // Set the user id to our db id so it flows into the JWT.
        user.id = existing.id;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
