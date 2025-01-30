import { motion } from "framer-motion"

interface BannerProps {
  show: boolean
}

export default function Banner({ show }: BannerProps) {
  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: show ? 0 : -100, opacity: show ? 1 : 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 text-center"
    >
      <h2 className="text-2xl font-bold">Welcome to UW Resource Finder!</h2>
      <p className="mt-2">Discover and explore resources available on campus.</p>
    </motion.div>
  )
}

