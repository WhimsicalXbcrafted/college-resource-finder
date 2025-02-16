"use client"

import { Search } from "lucide-react"

/**
 * Props for the SearchBar component.
 * 
 * @property {string} searchTerm - The current search term input by the user.
 * @property {(term: string) => void} setSearchTerm - Function to update the search term state.
 */
interface SearchBarProps {
  searchTerm: string;           // The search term entered by the user
  setSearchTerm: (term: string) => void; // Function to update the search term state
}

/**
 * SearchBar component allows users to input a search term to filter resources.
 * The component includes a text input field and a search icon.
 * 
 * @param {SearchBarProps} props - The properties for the SearchBar component.
 * @returns {JSX.Element} A search input field with a search icon.
 */
const SearchBar = ({ searchTerm, setSearchTerm }: SearchBarProps) => {
  return (
    <div className="max-w-2x1 mx-auto">
      <div className="relative">
        {/* Input field for entering the search term */}
        <input
          type="text"
          placeholder="Search for resources..."
          value={searchTerm}  // The current value of the input field
          onChange={(e) => setSearchTerm(e.target.value)}  // Update the search term on input change
          className="w-full p-4 pr-12 rounded-md border border-input bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-ring glassmorphism"
        />
        
        {/* Search icon */}
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  )
}

export default SearchBar