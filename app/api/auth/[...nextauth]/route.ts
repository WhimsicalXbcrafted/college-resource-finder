import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/**
 * Extend NextAuth types for User, Session, and JWT.
 * This ensures that the extra properties we include (id, name, image) are recognized.
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
 * 
 * This configuration uses the CredentialsProvider and validates user credentials
 * against a Prisma database. Passwords are compared using bcrypt.
 */
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET, // Secure secret from environment variable
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      /**
       * authorize - Verifies user credentials.
       * @param credentials - The email and password provided by the user.
       * @returns A user object on success, or null on failure.
       */
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // If user doesn't exist or no password stored, return null
          if (!user || !user.password) return null;
          
          // Compare provided password with the stored hashed password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          // Return user object if valid, otherwise return null
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
    strategy: 'jwt', // Use JSON Web Tokens for session management
  },
  callbacks: {
    /**
     * jwt callback: Called when a token is created or updated.
     * It stores the user information into the JWT token.
     *
     * @param token - The existing token.
     * @param user - The user object returned from authorize (if available).
     * @returns The updated token.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.image = user.image;
      }
      return token;
    },
    /**
     * session callback: Called whenever a session is checked.
     * It passes the user details (including avatarUrl) to the session.
     *
     * @param session - The current session.
     * @param token - The token containing user details.
     * @returns The updated session with user details.
     */
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

// Initialize NextAuth with the defined options and export it for GET and POST requests.
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };