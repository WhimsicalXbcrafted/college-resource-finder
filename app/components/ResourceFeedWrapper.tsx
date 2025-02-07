'use client';

import dynamic from 'next/dynamic';

const ResourceFeed = dynamic(
  () => import('./ResourceFeed'),
  { 
    ssr: false,
    loading: () => <p>Loading resources...</p>
  }
);

export default function ResourceFeedWrapper({ searchTerm }: { searchTerm: string}) {
  return <ResourceFeed searchTerm={searchTerm}/>;
}