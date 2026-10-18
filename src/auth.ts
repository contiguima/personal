import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

// Un solo usuario: solo entra el mail de ALLOWED_EMAIL.
const allowed = (process.env.ALLOWED_EMAIL ?? '').trim().toLowerCase();

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: { signIn: '/login', error: '/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  callbacks: {
    signIn({ profile }) {
      return !!allowed && profile?.email_verified === true && profile.email?.toLowerCase() === allowed;
    },
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
});
