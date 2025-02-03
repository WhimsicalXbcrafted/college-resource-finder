"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserCircle } from "lucide-react"

const Header = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [email, setEmail] = useState("")
  const router = useRouter()

  const handleLogin = () => {
    router.push("/login")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setEmail("")
    setShowDropdown(false)
  }

  return (
    <header className="bg-card border-b border-border glassmorphism">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Husky Resources
        </Link>
        <div className="relative">
          {isLoggedIn ? (
            <div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-muted text-foreground px-4 py-2 rounded-md transition duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <UserCircle className="h-5 w-5" />
                <span>{email}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 glassmorphism">
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <button
                onClick={handleLogin}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition duration-300"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

