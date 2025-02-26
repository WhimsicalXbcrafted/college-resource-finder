import "next-auth";
import { DefaultSession, DefaultUser, DefaultJWT } from "next-auth";

// Extend the "next-auth" module
declare module "next-auth" {
  // Extend the User interface
  interface User extends DefaultUser {
    id: string; // Add `id` to the User type
    name?: string; // Optional `name` field
    image?: string; // Optional `image` field
  }

  // Extend the Session interface
  interface Session extends DefaultSession {
    user: {
      id: string; // Add `id` to the Session user type
      email: string; // Add `email` to the Session user type
      name?: string; // Optional `name` field
      image?: string; // Optional `image` field
    } & DefaultSession["user"]; // Merge with the default Session user type
  }

  // Extend the JWT interface
  interface JWT extends DefaultJWT {
    id: string; // Add `id` to the JWT type
    email: string; // Add `email` to the JWT type
    name?: string; // Optional `name` field
    image?: string; // Optional `image` field
  }
}