"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useEffect, useState } from "react"
import ParticleBackground from "./components/ParticleBackground"
import ThemeToggle from "./components/ThemeToggle"
import { Search, MessageCircle, HelpCircle, PlusCircle } from "lucide-react"

/**
 * Landing page for the Husky Resource Finder.
 * It provides an interactive UI that introduces the platform, shows the 
 * "How It Works" section, and enables users to sign up or log in.
 */
export default function HomePage() {
  // State to track the mouse position for dynamic background movement
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  /**
   * useEffect hook to add and remove event listeners for tracking mouse movement.
   * The mouse position is used to adjust the background effect dynamically.
   */
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Steps outlining how the platform works, displayed in the "How It Works" section
  const howItWorksSteps = [
    { icon: Search, text: "Search for resources – Use filters to find what you need" },
    { icon: MessageCircle, text: "Connect with providers – Message or contact them easily" },
    { icon: HelpCircle, text: "Get the help you need – Access the best UW resources" },
    { icon: PlusCircle, text: "Upload your own resources - Add and edit your own resources" },
  ]

  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Particle effect in the background */}
      <ParticleBackground />

      {/* Theme toggle button */}
      <ThemeToggle />

      {/* Animated background effect based on mouse position */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{
          backgroundPosition: `${mousePosition.x / 5}px ${mousePosition.y / 5}px`,
        }}
        transition={{ type: "tween", ease: "linear", duration: 0.2 }}
        style={{
          backgroundImage: "url('/noise.png')",
          opacity: 0.05,
        }}
      />

      {/* Main content container */}
      <div className="container mx-auto px-4 py-20">
        {/* Hero section with title, description, and action buttons */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 mb-20"
        >
          {/* Hero heading */}
          <motion.h1
            className="text-6xl font-bold mb-6"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Husky Resource Finder
          </motion.h1>

          {/* Hero description */}
          <motion.p
            className="text-xl text-muted-foreground mb-8"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Discover and connect with campus resources like never before
          </motion.p>

          {/* Action buttons for login and signup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-x-4"
          >
            <Link
              href="/login"
              className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="inline-block bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold py-3 px-8 rounded-full transition duration-300 transform hover:scale-105 hover:shadow-lg"
            >
              Sign Up
            </Link>
          </motion.div>
        </motion.div>

        {/* "How It Works" section */}
        <motion.section
          className="py-20 mt-40"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Section title */}
          <h2 className="text-3xl font-bold mb-12 text-center">How It Works</h2>

          {/* Steps explaining how the platform works */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <motion.div
                key={index}
                className="bg-card text-card-foreground p-6 rounded-lg text-center shadow-dynamic"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Step icon and description */}
                <step.icon className="w-16 h-16 mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}