"use client";

import { useState } from "react";
import SearchBar from "./SearchBar";
import ResourceFeedWrapper from "./ResourceFeedWrapper";

export default function HomeClient() {
    const [searchTerm, setSearchTerm] = useState("");

    return (
        <>
        <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        <ResourceFeedWrapper searchTerm={searchTerm} />
        </>
    );
}