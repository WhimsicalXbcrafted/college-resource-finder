"use client";

import { SessionProvider } from "next-auth/react";

/**
 * AuthProvider component wraps the application with a SessionProvider
 * to manage authentication sessions using NextAuth.
 * 
 * @param {React.ReactNode} children - The child components that will be wrapped with the authentication provider.
 * @returns {JSX.Element} The wrapped children components with authentication session management.
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode; // The child components to be wrapped by the AuthProvider
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
