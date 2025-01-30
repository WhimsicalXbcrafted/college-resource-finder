"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserCircle } from "lucide-react"

export default function Header() {
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
    <header className="bg-purple-700 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          UW Resources
        </Link>
        <div className="relative">
          {isLoggedIn ? (
            <div>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-full transition duration-300"
              >
                <UserCircle className="h-6 w-6" />
                <span>{email}</span>
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
                className="bg-white text-purple-700 px-4 py-2 rounded-full hover:bg-purple-100 transition duration-300"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-500 transition duration-300"
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

