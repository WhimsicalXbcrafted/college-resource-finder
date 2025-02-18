import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Extending NextAuth types for user, session, and JWT.
 */
declare module 'next-auth' {
  interface User {
    id: string;
    name?: string;
    image?: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string;
      image?: string;
    };
  }

  interface JWT {
    id: string;
    email: string;
    name?: string;
    image?: string;
  }
}

/**
 * NextAuth configuration for authentication using credentials (email & password).
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Use environment variable for security
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user || !user.password) return null;
          
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          return isValid ? {
            id: user.id.toString(),
            email: user.email,
            name: user.name || '',
            image: user.avatarUrl || '/uploads/default-avatar.png',
          } : null;
        } catch (error) {
          console.error('Authentication error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Use JWT-based session handling
  },
  callbacks: {
    /** Stores user information in JWT token */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    /** Passes user details to the session */
    async session({ session, token }) {
      const userId = token.id as string;
      const userRecord = await prisma.user.findUnique({
        where: { id: userId },
      });

      session.user = {
        id: userId,
        email: token.email as string,
        name: token.name as string,
        image: userRecord?.avatarUrl || '/uploads/default-avatar.png',
      };
      return session;
    },
  },
  pages: {
    signIn: '/login', // Custom sign-in page
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };