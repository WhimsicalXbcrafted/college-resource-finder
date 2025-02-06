import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import db from '../../../db/database';
import bcrypt from 'bcryptjs';

// Type definition for the user object from database
interface DatabaseUser {
  id: number;
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  secret: 'qO4Ak8uUQaiPvF7EO9xAK7AKg3g5Zgjl0Vf40dr2mnE=',
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!db) {
          console.error('Database connection failed');
          return null;
        }

        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Get user from database with type assertion
          const user = db.prepare<DatabaseUser>(
            `SELECT * FROM users WHERE email = ?`
          ).get(credentials.email) as DatabaseUser | undefined;

          if (!user) return null;

          // Compare hashed password
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          return isValid 
            ? { id: user.id.toString(), email: user.email } 
            : null;

        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };