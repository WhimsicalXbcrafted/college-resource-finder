"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, MapPin, Filter, Star } from "lucide-react"
import { motion } from "framer-motion"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import FilterModal from "./FilterModal"
import ReviewModal from "./ReviewModal"
import ResourceForm from "./ResourceForm"

const DynamicResourceMap = dynamic(() => import("./ResourceMap"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
})

interface Review {
  id: number
  userId: number
  rating: number
  comment: string
}

interface Resource {
  id: number
  name: string
  description: string
  location: string
  hours: string
  category: string
  coordinates: [number, number]
  isNew?: boolean
  averageRating: number
  reviews: Review[]
  userId?: number
}

interface ResourceFeedProps {
  searchTerm: string;
}

const ResourceFeed = ({ searchTerm }: ResourceFeedProps) => {
  const { data: session } = useSession();
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showMap, setShowMap] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [filters, setFilters] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showResourceForm, setShowResourceForm] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulating API call to fetch resources
    const fetchedResources: Resource[] = [
      {
        id: 1,
        name: "Odegaard Library",
        description: "Main campus library with study spaces",
        location: "Central Campus",
        hours: "24/7",
        category: "Library",
        coordinates: [47.6564, -122.3095],
        averageRating: 4.5,
        reviews: [],
        userId: 1, // Example user id
      },
      {
        id: 2,
        name: "HUB (Husky Union Building)",
        description: "Student center with food and event spaces",
        location: "Central Campus",
        hours: "7AM - 11PM",
        category: "Student Center",
        coordinates: [47.6553, -122.305],
        averageRating: 4.2,
        reviews: [],
        userId: 2,
      },
      // ... other resources
    ];
    setResources(fetchedResources);

    // Simulate a new resource being added after 5 seconds
    setTimeout(() => {
      const newResource: Resource = {
        id: 9,
        name: "New Student Lounge",
        description: "A brand new lounge for students to relax and study",
        location: "West Campus",
        hours: "24/7",
        category: "Student Center",
        coordinates: [47.658, -122.315],
        isNew: true,
        averageRating: 0,
        reviews: [],
        userId: Number(session?.user?.id) || 0, // assign current user's id if available
      };
      setResources((prevResources) => [...prevResources, newResource]);
    }, 5000);
  }, [session]);

  // Combine filtering by category and search term
  const filteredResources = resources.filter((resource) => {
    const matchesCategory = filters.length === 0 || filters.includes(resource.category);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      resource.name.toLowerCase().includes(searchLower) ||
      resource.description.toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (resourceId: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(resourceId)
        ? prevFavorites.filter((id) => id !== resourceId)
        : [...prevFavorites, resourceId],
    );
  };

  const handleAddReview = (review: Omit<Review, "id">) => {
    if (selectedResource) {
      const updatedResource = {
        ...selectedResource,
        reviews: [...selectedResource.reviews, { ...review, id: Date.now() }],
        averageRating:
          (selectedResource.averageRating * selectedResource.reviews.length + review.rating) /
          (selectedResource.reviews.length + 1),
      };
      setResources((prevResources) =>
        prevResources.map((r) => (r.id === selectedResource.id ? updatedResource : r))
      );
      setSelectedResource(updatedResource);
      setShowReviewModal(false);
    }
  };

  // Handler to delete a resource
  const handleDeleteResource = async (resourceId: number) => {
    if (!confirm("Are you sure you want to delete this resource?")) return;
    // Send DELETE request to your API endpoint
    const res = await fetch(`/api/resources/${resourceId}`, { method: "DELETE" });
    if (res.ok) {
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } else {
      alert("Failed to delete resource.");
    }
  };

  // Handler to submit the resource form (create or update)
  const handleResourceFormSubmit = async (data: any) => {
    if (data.id) {
      // Update existing resource (PUT)
      const res = await fetch(`/api/resources/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setResources((prev) =>
          prev.map((r) => (r.id === updated.resource.id ? updated.resource : r))
        );
      } else {
        alert("Failed to update resource.");
      }
    } else {
      // Create new resource (POST)
      const res = await fetch(`/api/resources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, userId: Number(session?.user?.id) }),
      });
      if (res.ok) {
        const newResource = await res.json();
        setResources((prev) => [...prev, newResource.resource]);
      } else {
        alert("Failed to create resource.");
      }
    }
    setShowResourceForm(false);
    setEditingResource(null);
  };

  return (
    <div className="mt-8">
      {/* Add Resource Button for logged-in users */}
      {session && (
        <div className="mb-4">
          <button
            onClick={() => {
              setEditingResource(null);
              setShowResourceForm(true);
            }}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg"
          >
            Add Resource
          </button>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-primary">Popular Resources</h2>
        <div className="space-x-4">
          <button
            onClick={() => setShowMap(!showMap)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
          >
            {showMap ? "Hide Map" : "Show Map"}
          </button>
          <button
            onClick={() => setShowFilterModal(true)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition duration-300"
          >
            <Filter className="inline-block mr-2 h-4 w-4" />
            Filter
          </button>
        </div>
      </div>

      {showMap && (
        <div className="mb-8 h-[400px] rounded-lg overflow-hidden shadow-lg">
          <DynamicResourceMap resources={filteredResources} />
        </div>
      )}

      <div className="relative">
        <div
          ref={feedRef}
          className="bg-card rounded-lg shadow-md p-4 max-h-[calc(100vh-300px)] overflow-y-auto glassmorphism"
        >
          {filteredResources.map((resource) => (
            <motion.div
              key={resource.id}
              className={`mb-4 p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                resource.isNew ? "border-secondary" : ""
              } hover:scale-[1.02]`}
              onClick={() => setSelectedResource(resource)}
            >
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-primary">{resource.name}</h3>
                <div className="flex items-center">
                  <span className="text-secondary mr-2">{resource.averageRating.toFixed(1)}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(resource.id);
                    }}
                  >
                    <Star
                      className={`h-5 w-5 ${
                        favorites.includes(resource.id)
                          ? "text-secondary fill-current"
                          : "text-muted-foreground"
                      }`}
                    />
                  </motion.button>
                </div>
              </div>
              <p className="text-muted-foreground">{resource.description}</p>
              <p className="text-sm text-primary mt-2">{resource.category}</p>
              {resource.isNew && (
                <span className="bg-secondary text-secondary-foreground text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                  NEW
                </span>
              )}

              {/* Show Edit/Delete buttons if this resource belongs to the logged-in user */}
              {session && Number(session.user.id) === resource.userId && (
                <div className="mt-2 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingResource(resource);
                      setShowResourceForm(true);
                    }}
                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteResource(resource.id);
                    }}
                    className="bg-red-500 text-primary-foreground px-2 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {selectedResource && (
        <div className="mt-8 bg-card rounded-lg shadow-md p-6 glassmorphism">
          <h3 className="text-2xl font-semibold mb-4 text-primary">{selectedResource.name}</h3>
          <p className="text-muted-foreground mb-4">{selectedResource.description}</p>
          <div className="flex items-center space-x-2 text-muted-foreground mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>{selectedResource.location}</span>
          </div>
          <div className="flex items-center space-x-2 text-muted-foreground mb-4">
            <Clock className="h-5 w-5 text-primary" />
            <span>{selectedResource.hours}</span>
          </div>
          <div className="flex items-center space-x-2 mb-4">
            <span className="text-xl font-bold text-secondary">{selectedResource.averageRating.toFixed(1)}</span>
            <Star className="h-5 w-5 text-secondary fill-current" />
            <span className="text-muted-foreground">({selectedResource.reviews.length} reviews)</span>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
          >
            Add Review
          </button>
        </div>
      )}

      <FilterModal
        isOpen={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        filters={filters}
        setFilters={setFilters}
        categories={Array.from(new Set(resources.map((r) => r.category)))}
      />
      <ReviewModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} onSubmit={handleAddReview} />

      {/* ResourceForm Modal for creating or editing a resource */}
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
    </div>
  );
};

export default ResourceFeed;