"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";

/**
 * ThemeToggle component allows users to switch between dark and light modes.
 * It stores the user's preference in the local storage and applies the appropriate
 * CSS class to toggle the theme.
 * 
 * @returns {JSX.Element} A button that toggles the theme when clicked.
 */
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  /**
   * useEffect hook to read the theme preference from localStorage and apply it on initial render.
   */
  useEffect(() => {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    setIsDark(isDarkMode);
    document.documentElement.classList.toggle("dark", isDarkMode);
  }, []);

  /**
   * toggleTheme function switches between dark and light themes, updates localStorage, 
   * and applies the appropriate CSS class to the document element.
   */
  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    localStorage.setItem("darkMode", newIsDark.toString());
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  return (
    <motion.button
      className="fixed top-4 right-4 z-50 bg-background text-foreground p-2 rounded-full shadow-lg"
      onClick={toggleTheme}
      whileTap={{ scale: 0.9 }} // Animates button when tapped
      whileHover={{ scale: 1.1 }} // Animates button on hover
    >
      {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
    </motion.button>
  );
};

export default ThemeToggle;