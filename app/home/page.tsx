"use client"

import {motion } from "framer-motion"
import Link from "next/link"

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-raidal from-purple-900 to indigo-900 flex flex-col justify-center items-center px-4">
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-color"
            >
                <h1 className="text-5xl font-bold text-white mb-6">Husky Resource Finder</h1>
                <p className="text-xl text-purple-200 mb-8">Discover and connect with campus resources like never before</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-x-4"
            >
                <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                    Log In
                </Link>
                <Link
                href="/signup"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-full transition duration-300">
                    Sign Up
                </Link>
            </motion.div>
        </div>
    )
}