"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { isUWEmail } from "../utils/emailValidator"

/**
 * SignUp Component for handling user registration.
 * This component provides a form to collect user email and password,
 * validates the email for the UW domain, and sends a request to the backend 
 * to register the user.
 * 
 * @returns {JSX.Element} The sign-up page component.
 */
export default function SignUp() {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [error, setError] = useState<string>("")
  const router = useRouter()

  /**
   * Handles the sign-up form submission.
   * Validates the email and sends a POST request to the '/api/signup' route.
   * If successful, redirects the user to the login page. If an error occurs,
   * displays an appropriate error message.
   *
   * @param {React.FormEvent} e - The form submission event.
   * @returns {void}
   */
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isUWEmail(email)) {
      setError("Please use your UW email address (@uw.edu).")
      return
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/login")
      } else {
        setError(data.message || "An error occurred. Please try again.")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setError("An error occurred. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <h2 className="mt-6 text-center text-3xl font-extrabold text-primary">
          Create an account
        </h2>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && ( 
            <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm rounded-md">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSignUp}>
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-card-foreground">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-input rounded-md shadow-sm text-black placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Sign up
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-secondary hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}