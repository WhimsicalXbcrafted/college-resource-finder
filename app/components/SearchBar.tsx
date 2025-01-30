"use client"

import { useState } from "react"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchTerm)
  }

  return (
    <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pr-12 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2">
          <Search className="h-6 w-6 text-gray-400" />
        </button>
      </div>
    </form>
  )
}

