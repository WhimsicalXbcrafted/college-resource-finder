"use client"

import { useState, useEffect } from "react"
import Header from "./components/Header"
import ResourceFeed from "./components/ResourceFeed"
import SearchBar from "./components/SearchBar"
import Banner from "./components/Banner"

export default function Home() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setShowBanner(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200">
      <Header />
      <Banner show={showBanner} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-800">UW College Resource Finder</h1>
        <SearchBar />
        <ResourceFeed />
      </main>
    </div>
  )
}

