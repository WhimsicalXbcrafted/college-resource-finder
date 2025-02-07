"use client"

import { Search } from "lucide-react"

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => {
  return (
    <div className="max-w-2x1 mx-auto">
      <div className="relative">
        <input
          type="text"
          placeholder="Search for resources..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-4 pr-12 rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring glassmorphism"
        />
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  )
}

export default SearchBar

