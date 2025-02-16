"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

/**
 * Allows users to log in using their email and password.
 * It uses NextAuth for credential-based authentication and navigates to the main page upon successful login.
 * 
 * @returns {JSX.Element} A login form that submits credentials to the authentication system.
 */
export default function Login() {
  const [email, setEmail] = useState(""); // State for email input
  const [password, setPassword] = useState(""); // State for password input
  const [error, setError] = useState(""); // State for storing error messages
  const router = useRouter(); // Router hook for navigation

  /**
   * handleLogin function is called when the user submits the login form.
   * It authenticates the user using NextAuth's `signIn` function and redirects to the main page
   * if successful or displays an error message if the login fails.
   * 
   * @param {React.FormEvent} e - The event triggered by form submission.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent the default form submission

    // Attempt to sign in with credentials
    const result = await signIn("credentials", {
      redirect: false, // Do not redirect automatically
      email,
      password,
    });

    // If there is an error, set the error state
    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        setError("Email or password is incorrect");
      } else {
        setError(result.error);
      }
    } else {
      // If successful, navigate to the main page
      router.push('/main');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Login Heading with motion animation */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">Log in to your account</h2>
      </motion.div>

      {/* Login Form with motion animation */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Display error message if present */}
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}
          {/* Login form */}
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* Email input field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-card-foreground">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm text-black placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Password input field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm text-black placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            {/* Submit button */}
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Log in
              </button>
            </div>
          </form>

          {/* Sign-up link */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Don't have an account?</span>
              </div>
            </div>

            {/* Sign-up link button */}
            <div className="mt-6">
              <Link
                href="/signup"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}