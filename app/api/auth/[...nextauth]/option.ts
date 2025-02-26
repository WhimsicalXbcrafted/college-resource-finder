import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * Configuration for NextAuth authentication.
 * This object defines how authentication works in the application,
 * including the provider, session management, and callbacks.
 */
export const authOptions: NextAuthOptions = {
  // Secret used to encrypt session tokens and other sensitive data.
  secret: process.env.NEXTAUTH_SECRET,

  // Define the authentication providers.
  providers: [
    // CredentialsProvider allows users to log in with email and password.
    CredentialsProvider({
      name: "Credentials", // Name of the provider
      credentials: {
        // Define the fields for the login form.
        email: { label: "Email", type: "text" }, // Email input field
        password: { label: "Password", type: "password" }, // Password input field
      },
      /**
       * Authorize function: Validates user credentials.
       * 
       * @param credentials - The email and password provided by the user.
       * @returns A user object if credentials are valid, otherwise null.
       */
      async authorize(credentials) {
        // Check if email and password are provided.
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // Find the user in the database using the provided email.
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // If the user doesn't exist or doesn't have a password, return null.
          if (!user || !user.password) return null;

          // Compare the provided password with the hashed password in the database.
          const isValid = await bcrypt.compare(credentials.password, user.password);

          // If the password is valid, return the user object.
          return isValid
            ? {
                id: user.id.toString(), // Convert ID to string
                email: user.email, // User's email
                name: user.name || "", // User's name (fallback to empty string)
                image: user.avatarUrl || "/uploads/default.png", // User's avatar (fallback to default image)
              }
            : null; // Return null if the password is invalid
        } catch (error) {
          // Log any errors that occur during authentication.
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],

  // Session configuration.
  session: {
    strategy: "jwt", // Use JSON Web Tokens (JWT) for session management.
  },

  // Callbacks for modifying the JWT token and session.
  callbacks: {
    /**
     * JWT callback: Called when a JWT token is created or updated.
     * 
     * @param token - The current JWT token.
     * @param user - The user object returned from the authorize function (if available).
     * @returns The updated JWT token.
     */
    async jwt({ token, user }) {
      // If the user object is available (e.g., during sign-in), add user details to the token.
      if (user) {
        token.id = user.id; // Add user ID to the token
        token.email = user.email; // Add user email to the token
        token.name = user.name; // Add user name to the token
        token.image = user.image; // Add user image to the token
      }
      return token; // Return the updated token
    },

    /**
     * Session callback: Called whenever a session is accessed.
     * 
     * @param session - The current session object.
     * @param token - The JWT token containing user details.
     * @returns The updated session object.
     */
    async session({ session, token }) {
      // Fetch the user's record from the database using the ID from the token.
      const userId = token.id as string;
      const userRecord = await prisma.user.findUnique({ where: { id: userId } });

      // Add user details to the session object.
      session.user = {
        id: userId, // User ID
        email: token.email as string, // User email
        name: token.name as string, // User name
        image: userRecord?.avatarUrl || "/uploads/default.png", // User avatar (fallback to default image)
      };

      return session; // Return the updated session
    },
  },

  // Custom pages for authentication.
  pages: {
    signIn: "/login", // Redirect users to the /login page for signing in.
  },
};