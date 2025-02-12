import NextAuth, { NextAuthOptions, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Type definition for the user object from database
interface DatabaseUser {
  id: number;
  email: string;
  password: string;
  name?: string;
  avatarUrl?: string;
}

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
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email }
          });

          if (!user) return null;

          if (!user.password) return null;
          const isValid = await bcrypt.compare(credentials.password, user.password);

          return isValid ? {
            id: user.id,
            email: user.email,
            name: user.name || '',
            image: user.avatarUrl || '/default-avatar.png'
          } : null;
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
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          name: token.name as string,
          image: token.image as string,
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