"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

/**
 * ParticleBackground Component
 *
 * This component renders a dynamic particle background animation on the webpage. 
 * It detects the theme (light or dark mode) and changes the particle color accordingly. 
 * The particles move randomly and reset when the window is resized.
 *
 * @returns {JSX.Element} The ParticleBackground component rendering the animated particles.
 */
const ParticleBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null) // Reference to the canvas element
  const [isDarkMode, setIsDarkMode] = useState(false) // State to track if the theme is dark mode

  // Effect to check and update the theme based on the HTML class
  useEffect(() => {
    const checkTheme = () => {
        setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    checkTheme()

    const observer = new MutationObserver(checkTheme) // Observer for theme changes
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => observer.disconnect() // Clean up the observer on component unmount
  }, [])

  // Effect to initialize and animate particles on the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth // Set canvas width to the window width
    canvas.height = window.innerHeight // Set canvas height to the window height

    const particles: Particle[] = []
    const particleCount = 100 // Number of particles
    const lightModeColor = "rgba(74, 20, 140, 0.9)" // Color for particles in light mode
    const darkModeColor = "rgba(135, 206, 235, 0.9)" // Color for particles in dark mode

    // Particle class definition
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number

      constructor() {
        if (!canvas) {
          this.x = 0
          this.y = 0
        } else {
          this.x = Math.random() * canvas.width
          this.y = Math.random() * canvas.height
        }
        this.size = Math.random() * 3 + 1 // Random size between 1 and 3
        this.speedX = Math.random() * 3 - 1.5 // Random horizontal speed
        this.speedY = Math.random() * 3 - 1.5 // Random vertical speed
      }

      // Update particle position based on speed
      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (canvas) {
          // Wrap particles around when they go off-screen
          if (this.x > canvas.width) this.x = 0
          else if (this.x < 0) this.x = canvas.width

          if (this.y > canvas.height) this.y = 0
          else if (this.y < 0) this.y = canvas.height
        }
      }

      // Draw particle on the canvas
      draw() {
        if (!ctx) return
        ctx.fillStyle = isDarkMode ? darkModeColor : lightModeColor // Set color based on the theme
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2) // Draw a circle
        ctx.closePath()
        ctx.fill() // Fill the circle with the chosen color
      }
    }

    // Initialize particles
    const init = () => {
      particles.length = 0
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle()) // Add new particles
      }
    }

    // Animate particles on the canvas
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height) // Clear the canvas
      for (const particle of particles) {
        particle.update() // Update particle position
        particle.draw() // Draw the updated particle
      }
      requestAnimationFrame(animate) // Repeat the animation
    }

    init() // Initialize particles
    animate() // Start the animation

    // Resize handler to adjust canvas size
    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize) // Add event listener for window resize

    return () => {
      window.removeEventListener("resize", handleResize) // Clean up event listener on unmount
    }
  }, [isDarkMode])

  return (
    <motion.canvas
      ref={canvasRef} // Reference to the canvas element
      className="absolute inset-0" // Style for positioning the canvas
      initial={{ opacity: 0 }} // Initial opacity for the animation
      animate={{ opacity: 1 }} // Final opacity for the animation
      transition={{ duration: 1 }} // Animation duration
    />
  )
}

export default ParticleBackground