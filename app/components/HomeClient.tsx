"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import ResourceFeedWrapper from "./ResourceFeedWrapper";

/**
 * HomeClient Component
 *
 * This component is the main client-side view for the homepage. It includes a 
 * search bar for filtering resources and a resource feed that displays 
 * relevant resources based on the search term.
 *
 * @returns {JSX.Element} The HomeClient component with a search bar and resource feed.
 */
export default function HomeClient() {
    const [searchTerm, setSearchTerm] = useState(""); // State to manage the search input

    return (
        <>
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} /> {/* Search bar for entering search term */}
            <ResourceFeedWrapper searchTerm={searchTerm} /> {/* Resource feed wrapper displaying resources based on the search term */}
        </>
    );
}
