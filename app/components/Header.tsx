"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

/**
 * Header Component
 *
 * A navigation header that displays a link to the homepage and a user dropdown
 * with options to view settings and log out if the user is authenticated.
 * 
 * @returns {JSX.Element} The Header component with user authentication and settings options.
 */
const Header = () => {
  const { data: session } = useSession(); // Fetch the user session
  const [showDropdown, setShowDropdown] = useState(false); // State to toggle the dropdown visibility
  const router = useRouter(); // Router for navigation

  /**
   * Logs the user out by calling the `signOut` function and redirecting to the homepage.
   */
  const handleLogout = async () => {
    await signOut({ redirect: false }); // Perform sign out without redirecting
    router.push('/'); // Redirect to the homepage
  };

  /**
   * Navigates the user to the settings page.
   */
  const handleSettings = () => {
    router.push('/settings'); // Navigate to the settings page
  };

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
                onClick={() => setShowDropdown(!showDropdown)} // Toggle the dropdown visibility
                className="flex items-center space-x-2 bg-muted text-foreground px-4 py-2 rounded-md transition duration-300 hover:bg-accent hover:text-accent-foreground"
              >
                <UserCircle className="h-5 w-5" />
                <span>{session.user?.email}</span> {/* Display user's email */}
              </button>
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg py-1 z-10 glassmorphism">
                  <button
                    onClick={handleSettings} // Navigate to settings page
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout} // Log the user out
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : null} {/* Only display if user is logged in */}
        </div>
      </div>
    </header>
  );
};

export default Header;