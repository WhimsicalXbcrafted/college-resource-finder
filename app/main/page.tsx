import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/option';
import Header from '../components/Header';
import Banner from '../components/Banner';
import HomeClient from '../components/HomeClient';
import ThemeToggle from "../components/ThemeToggle";

/**
 * Home page that displays the main content of the website.
 * It checks if the user is authenticated using `getServerSession` from NextAuth.
 * If the user is not authenticated, they are redirected to the login page.
 * 
 * @returns {JSX.Element} The homepage layout with navigation, theme toggle, and resource information.
 */
export default async function Home() {
  // Retrieve session to check if the user is authenticated
  const session = await getServerSession(authOptions);

  // If no session (not authenticated), redirect to the login page
  if (!session) {
    redirect('/');
  }

  // Return the main page content
  return (
    <div className="min-h-screen bg-gradient-radial from-background to-card">
      {/* Header component for navigation */}
      <Header />
      
      {/* Theme toggle button */}
      <ThemeToggle />
      
      {/* Banner component, shows an introductory banner */}
      <Banner show={true} />
      
      {/* Main content section */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">Husky Resource Finder</h1>
        <p className="text-center mb-8 text-muted-foreground">
          A student-driven initiative to help you discover campus resources. Not affiliated with the University of
          Washington.
        </p>
        
        {/* HomeClient component for rendering resource data */}
        <HomeClient />
      </main>
    </div>
  );
}
