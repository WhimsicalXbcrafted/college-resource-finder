import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Header from './components/Header';
import Banner from './components/Banner';
import SearchBar from './components/SearchBar';
import ResourceFeedWrapper from './components/ResourceFeedWrapper';

export default async function Home() { 
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect('/home');
    }

  return (
    <div className="min-h-screen bg-gradient-radial from-background to-card">
      <Header />
      <Banner show={true} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">Husky Resource Finder</h1>
        <p className="text-center mb-8 text-muted-foreground">
          A student-driven initiative to help you discover campus resources. Not affiliated with the University of
          Washington.
        </p>
        <SearchBar />
        <ResourceFeedWrapper />
      </main>
    </div>
  );
}