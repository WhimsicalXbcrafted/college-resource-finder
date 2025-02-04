"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserCircle, Settings, LogOut } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

const Header = () => {
  const { data: session } = useSession()
  const [showDropdown, setShowDropdown] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/home')
  }

  return (
    <header className="bg-card border-b border-border glassmorphism">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Husky Resources
        </Link>
        <div className="relative">
          {session ? (
            <div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-muted text-foreground px-4 py-2 rounded-md transition duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <UserCircle className="h-5 w-5" />
                <span>{session.user?.email}</span> {/* Display user email */}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 glassmorphism">
                  <Link
                    href="/settings"
                    className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                href="/login"
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
              >
                Login
              </Link>
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

