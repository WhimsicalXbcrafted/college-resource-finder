"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import FilterModal from "./FilterModal";
import ReviewModal from "./ReviewModal";
import ResourceForm from "./ResourceForm";
import { ResourceCard } from "./ResourceCard";
import { ResourceDetailModal } from "./ResourceDetailModal";
import type { Resource, Review } from "@prisma/client";


// Dynamically imported component to show the resource map (SSR disabled).
const DynamicResourceMap = dynamic(() => import("./ResourceMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-lg animate-pulse" />,
});

/**
 * Defines the structure of a Resource with its associated details like reviews and user info.
 */
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
};

/**
 * Props for the ResourceFeed component.
 * 
 * @param searchTerm - The term used to filter resources based on name or description.
 */
interface ResourceFeedProps {
  searchTerm: string;
}

/**
 * ResourceFeed component that handles the display of resources and their interactions.
 * It fetches, filters, adds, edits, and deletes resources and reviews.
 * 
 * @component
 */
const ResourceFeed = ({ searchTerm }: ResourceFeedProps) => {
  // Session data to get current user information.
  const { data: session } = useSession();

  // State for managing resources, selected resource, filters, UI states, and loading state.
  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceWithDetails | null>(null);
  const [filters, setFilters] = useState<string[]>([]);
  const [show, setShow] = useState({
    map: true,
    filterModal: false,
    reviewModal: false,
    resourceForm: false,
  });
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch resources when the component mounts or when the search term or filters change.
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/resources");
        const data = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Failed to fetch resources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResources();
  }, [searchTerm, filters]);

  // Filters resources based on the search term and selected categories.
  const filteredResources = resources.filter(({ category, name, description }) => {
    const matchesCategory = filters.length === 0 || (category && filters.includes(category));
    const searchLower = searchTerm.toLowerCase();
    return (
      matchesCategory &&
      (name.toLowerCase().includes(searchLower) || (description?.toLowerCase() ?? "").includes(searchLower))
    );
  });

  /**
   * Handles the addition of a review to a selected resource.
   * 
   * @param review - The review data to be added.
   */
  const handleAddReview = async (review: Omit<Review, "id" | "createdAt" | "updatedAt">) => {
    if (!selectedResource) return;
    try {
      const response = await fetch(`/api/resources/${selectedResource.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      if (!response.ok) throw new Error("Failed to add review");

      const newReview = await response.json();
      setResources((prev) =>
        prev.map((r) =>
          r.id === selectedResource.id
            ? { 
                ...r, 
                reviews: [...r.reviews, newReview], 
                averageRating: (r.averageRating * r.reviews.length + review.rating) / (r.reviews.length + 1) 
              }
            : r
        )
      );
      setSelectedResource((prev) => prev && { ...prev, reviews: [...prev.reviews, newReview] });
      setShow((prev) => ({ ...prev, reviewModal: false }));
    } catch (error) {
      console.error("Failed to add review:", error);
    }
  };

  /**
   * Handles the deletion of a resource from the system.
   * 
   * @param id - The ID of the resource to delete.
   */
  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: "DELETE" });
      setResources((prev) => prev.filter((resource) => resource.id !== id));
    } catch (error) {
      console.error("Failed to delete resource:", error);
    }
  };

  /**
   * Handles the deletion of a review from a resource.
   * 
   * @param reviewId - The ID of the review to delete.
   */
  const handleDeleteReview = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete review");

      setSelectedResource((prev) =>
        prev ? { ...prev, reviews: prev.reviews.filter((r) => r.id !== reviewId) } : null
      );
      setResources((prev) =>
        prev.map((r) =>
          r.id === selectedResource?.id ? { ...r, reviews: r.reviews.filter((r) => r.id !== reviewId) } : r
        )
      );
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  /**
   * Handles editing an existing resource by setting it to the editing state.
   * 
   * @param resource - The resource to edit.
   */
  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShow((prev) => ({ ...prev, resourceForm: true }));
  };

  /**
   * Handles the submission of the resource form to add or update a resource.
   * 
   * @param formData - The form data for the resource.
   */
  const handleResourceFormSubmit = async (formData: FormData) => {
    try {
      const method = editingResource ? "PUT" : "POST";
      const url = editingResource ? `/api/resources?id=${editingResource.id}` : "/api/resources";
      const response = await fetch(url, { method, body: formData });

      if (!response.ok) throw new Error("Failed to save resource");

      const savedResource = await response.json();
      setResources((prev) =>
        editingResource ? prev.map((r) => (r.id === editingResource.id ? savedResource : r)) : [...prev, savedResource]
      );

      setEditingResource(null);
      setShow((prev) => ({ ...prev, resourceForm: false }));
    } catch (error) {
      console.error("Failed to save resource:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between mb-6">
        <button
          onClick={() => {
            setEditingResource(null);
            setShow((prev) => ({ ...prev, resourceForm: true }));
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Resource
        </button>
        <button
          onClick={() => setShow((prev) => ({ ...prev, filterModal: true }))}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
        >
          Filter
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">Popular Resources</h2>
        <button
          onClick={() => setShow((prev) => ({ ...prev, map: !prev.map }))}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
        >
          {show.map ? "Hide Map" : "Show Map"}
        </button>
      </div>

      {show.map && (
        <div className="mb-8 h-[400px] rounded-lg overflow-hidden shadow-lg">
          <DynamicResourceMap resources={filteredResources} />
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-4 text-gray-500">Loading resources...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onSelect={(resource) => setSelectedResource(resource)}
              onFavoriteChange={(resourceId, newFavoriteCount) => {
                setResources((prev) =>
                  prev.map((r) =>
                    r.id === resourceId ? { ...r, favoriteCount: newFavoriteCount } : r
                  )
                );
              }}
            />
          ))}
        </div>
      )}

      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onAddReview={() => setShow((prev) => ({ ...prev, reviewModal: true }))}
        currentUserId={session?.user?.id ?? ""}
        onDeleteReview={(reviewId, updatedRes) => {
          setSelectedResource(updatedRes);
          setResources((prev) =>
            prev.map((r) => (r.id === updatedRes.id ? updatedRes : r))
          );
        }}
      />

      <ReviewModal
        isOpen={show.reviewModal}
        onClose={() => setShow((prev) => ({ ...prev, reviewModal: false }))}
        onSubmit={handleAddReview}
        resourceId={selectedResource?.id ?? ""}
      />

      {show.resourceForm && (
        <ResourceForm
          resource={editingResource ?? undefined}
          onSubmit={handleResourceFormSubmit}
          onClose={() => setShow((prev) => ({ ...prev, resourceForm: false }))}
        />
      )}

      <FilterModal
        isOpen={show.filterModal}
        onClose={() => setShow((prev) => ({ ...prev, filterModal: false }))}
        filters={filters}
        setFilters={setFilters}
        categories={[...new Set(resources.map((r) => r.category).filter((c): c is string => c !== null))]}
      />
    </div>
  );
};

export default ResourceFeed;