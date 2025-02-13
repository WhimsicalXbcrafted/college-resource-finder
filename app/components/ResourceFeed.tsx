"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, MapPin, Filter, Star } from "lucide-react"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import FilterModal from "./FilterModal"
import ReviewModal from "./ReviewModal"
import ResourceForm from "./ResourceForm"
import { ResourceCard } from "./ResourceCard"
import { Resource, Review } from '@prisma/client'
import { ResourceDetailModal } from './ResourceDetailModal'

const DynamicResourceMap = dynamic(() => import("./ResourceMap"), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-muted rounded-lg animate-pulse" />
})

type ResourceWithDetails = Resource & {
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
    user: {
      name: string | null;
      avatarUrl: string | null;
    };
  }>;
};

interface ResourceFeedProps {
  searchTerm: string;
}

const ResourceFeed = ({ searchTerm }: ResourceFeedProps) => {
  const { data: session } = useSession();
  const [resources, setResources] = useState<ResourceWithDetails[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceWithDetails | null>(null);
  const [showMap, setShowMap] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchResources = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/resources');
      const data = await response.json();
      setResources(data);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  // Combine filtering by category and search term
  const filteredResources = resources.filter((resource) => {
    const matchesCategory = filters.length === 0 || (resource.category && filters.includes(resource.category));
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      resource.name.toLowerCase().includes(searchLower) ||
      (resource.description?.toLowerCase() || '').includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (resourceId: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(resourceId)
        ? prevFavorites.filter((id) => id !== resourceId)
        : [...prevFavorites, resourceId],
    );
  };

  const handleAddReview = async (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!selectedResource) return;

    try {
      const response = await fetch(`/api/resources/${selectedResource.id}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(review),
      });

      if (!response.ok) throw new Error('Failed to add review');

      const newReview = await response.json();
      const updatedResource = {
        ...selectedResource,
        reviews: [...selectedResource.reviews, newReview],
        averageRating:
          (selectedResource.averageRating * selectedResource.reviews.length + review.rating) /
          (selectedResource.reviews.length + 1),
      };

      setResources(prev =>
        prev.map(r => (r.id === selectedResource.id ? updatedResource : r))
      );
      setSelectedResource(updatedResource);
      setShowReviewModal(false);
    } catch (error) {
      console.error('Failed to add review:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/resources/${id}`, { method: 'DELETE' });
      setResources(prev => prev.filter(resource => resource.id !== id));
    } catch (error) {
      console.error('Failed to delete resource:', error);
    }
  };

  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setShowResourceForm(true);
  };

  // Handler to submit the resource form (create or update)
  const handleResourceFormSubmit = async (resourceData: Partial<Resource>) => {
    try {
      const method = editingResource ? 'PUT' : 'POST';
      const url = editingResource ? `/api/resources/${editingResource.id}` : '/api/resources';
      
      const formData = new FormData();
      Object.entries(resourceData).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'image' && value instanceof File) {
            formData.append('image', value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await fetch(url, {
        method,
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save resource');

      const savedResource = await response.json();
      
      setResources(prev =>
        editingResource
          ? prev.map(r => (r.id === editingResource.id ? savedResource : r))
          : [...prev, savedResource]
      );
      
      setShowResourceForm(false);
      setEditingResource(null);
    } catch (error) {
      console.error('Failed to save resource:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between mb-6">
        <button
          onClick={() => {
            setEditingResource(null);
            setShowResourceForm(true);
          }}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Add Resource
        </button>
        <button
          onClick={() => setShowFilterModal(true)}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90 transition-colors"
        >
          Filter
        </button>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">Popular Resources</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="mb-8 h-[400px] rounded-lg overflow-hidden shadow-lg">
          <DynamicResourceMap resources={filteredResources} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredResources.map((resource) => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onSelect={setSelectedResource}
          />
        ))}
      </div>

      <ResourceDetailModal
        resource={selectedResource}
        onClose={() => setSelectedResource(null)}
        onAddReview={() => setShowReviewModal(true)}
      />

      <ReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onSubmit={handleAddReview}
        resourceId={selectedResource?.id || ''}
      />

      {showResourceForm && (
        <ResourceForm
          resource={editingResource ?? undefined}
          onSubmit={handleResourceFormSubmit}
          onClose={() => {
            setShowResourceForm(false);
            setEditingResource(null);
          }}
        />
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        categories={Array.from(new Set(resources.map((r) => r.category).filter((c): c is string => c !== null)))}
      />
    </div>
  );
};

export default ResourceFeed;