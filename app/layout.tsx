import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react" // Import React
import AuthProvider from "./components/SessionProvider"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
  title: "UW Resource Finder",
  description: "Find and explore resources available on UW campus",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans`}>
          <AuthProvider>{children}</AuthProvider>
        </body>
    </html>
  )
}

