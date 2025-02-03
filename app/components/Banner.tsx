"use client"

import { motion } from "framer-motion"

interface BannerProps {
  show: boolean
}

const Banner = ({ show }: BannerProps) => {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: show ? 0 : -100, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="bg-primary text-primary-foreground py-4 px-6 text-center glassmorphism"
    >
      <h2 className="text-2xl font-bold">Welcome to Husky Resource Finder!</h2>
      <p className="mt-2">Discover and explore resources available on campus.</p>
    </motion.div>
  )
}

export default Banner

