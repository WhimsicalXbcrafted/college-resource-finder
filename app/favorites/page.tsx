"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import Banner from "../components/Banner";
import ThemeToggle from "../components/ThemeToggle";
import { ResourceCard } from "../components/ResourceCard";
import type { Resource } from "@prisma/client";

export type ResourceWithDetails = Resource & {
  user?: {
    id: string;
    email: string;
    avatarUrl: string | null;
    name: string | null;
  } | null;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string | null;
    userId: string;
    user: {
      name: string | null;
      avatarUrl: string | null;
    };
  }>;
  isFavorited?: boolean;
};

/**
 * FavoritesPage Component
 *
 * Displays a list of resources favorited by the authenticated user.
 * Includes a banner, theme toggle, and navigation options.
 *
 * @returns {JSX.Element} The FavoritesPage component.
 */
const FavoritesPage = () => {
  const { data: session } = useSession();
  const [favorites, setFavorites] = useState<ResourceWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const res = await fetch("/api/resources", { cache: "no-store" });
        const data = await res.json();
        const favs = data.filter((r: ResourceWithDetails) => r.isFavorited);
        setFavorites(favs);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }
    if (session) {
      fetchFavorites();
    }
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        Please log in to see your favorites.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Banner show={true} />
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <header className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 shadow">
        <div className="flex items-center space-x-4">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User Avatar"}
              width={50}
              height={50}
              className="rounded-full"
            />
          )}
          <div>
            <h1 className="text-xl font-bold">
              Hi, {session.user.name || session.user.email}
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-300">Your Favorites</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/settings">
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition">
              Settings
            </button>
          </Link>
          <Link href="/main">
            <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition">
              Go Back
            </button>
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            Loading favorites...
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favorites.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                onDelete={(id) => console.log("Delete resource", id)}
                onEdit={(resource) => console.log("Edit resource", resource)}
                onSelect={(resource) => console.log("Selected resource", resource)}
                onFavoriteChange={(id, count) =>
                  console.log("Favorite updated", id, count)
                }
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            You haven&apos;t favorited any resources yet.
          </div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;