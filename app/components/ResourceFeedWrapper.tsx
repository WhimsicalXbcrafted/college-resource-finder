'use client';

import dynamic from 'next/dynamic';

// Dynamically import the ResourceFeed component with no server-side rendering (ssr: false)
// When the component is being loaded, a loading message will be shown
const ResourceFeed = dynamic(
  () => import('./ResourceFeed'),
  { 
    ssr: false, // Disables server-side rendering for this component
    loading: () => <p>Loading resources...</p> // Displays this text while the ResourceFeed is loading
  }
);

export default function ResourceFeedWrapper({ searchTerm }: { searchTerm: string }) {
  // This component acts as a wrapper for ResourceFeed, passing the searchTerm prop to it
  return <ResourceFeed searchTerm={searchTerm}/>; 
}
