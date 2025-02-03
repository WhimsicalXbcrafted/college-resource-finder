"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, MapPin, Filter, Star } from "lucide-react"
import { motion } from "framer-motion"
import dynamic from "next/dynamic"
import FilterModal from "./FilterModal"
import ReviewModal from "./ReviewModal"

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
}

const ResourceFeed = () => {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [showMap, setShowMap] = useState(false)
  const [showFilterModal, setShowFilterModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [filters, setFilters] = useState<string[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const feedRef = useRef<HTMLDivElement>(null)
  const [scrollPosition, setScrollPosition] = useState(0)

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
      },
      {
        id: 3,
        name: "IMA (Intramural Activities Building)",
        description: "Sports and fitness center",
        location: "East Campus",
        hours: "6AM - 10:30PM",
        category: "Sports",
        coordinates: [47.653, -122.3017],
        averageRating: 4.7,
        reviews: [],
      },
      {
        id: 4,
        name: "University Bookstore",
        description: "Campus bookstore for textbooks and UW merchandise",
        location: "University Way NE",
        hours: "9AM - 6PM",
        category: "Shop",
        coordinates: [47.6606, -122.3131],
        averageRating: 3.8,
        reviews: [],
      },
      {
        id: 5,
        name: "UW Career Center",
        description: "Career counseling and job search resources",
        location: "Mary Gates Hall",
        hours: "8AM - 5PM",
        category: "Services",
        coordinates: [47.6545, -122.3085],
        averageRating: 4.0,
        reviews: [],
      },
      {
        id: 6,
        name: "Hall Health Center",
        description: "On-campus health clinic for students",
        location: "East Campus",
        hours: "8AM - 5PM",
        category: "Health",
        coordinates: [47.6565, -122.3046],
        averageRating: 4.3,
        reviews: [],
      },
      {
        id: 7,
        name: "Suzzallo Library",
        description: "Gothic-style library with grand reading room",
        location: "Central Campus",
        hours: "7AM - 10PM",
        category: "Library",
        coordinates: [47.6555, -122.308],
        averageRating: 4.8,
        reviews: [],
      },
      {
        id: 8,
        name: "UW Food Pantry",
        description: "Free food resources for students",
        location: "Poplar Hall",
        hours: "10AM - 4PM",
        category: "Food",
        coordinates: [47.6559, -122.3142],
        averageRating: 4.6,
        reviews: [],
      },
    ]
    setResources(fetchedResources)

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
      }
      setResources((prevResources) => [...prevResources, newResource])
    }, 5000)
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (feedRef.current) {
      const scrollTop = feedRef.current.scrollTop
      const scrollHeight = feedRef.current.scrollHeight
      const clientHeight = feedRef.current.clientHeight
      const maxScroll = scrollHeight - clientHeight
      const normalizedScroll = scrollTop / maxScroll
      setScrollPosition(normalizedScroll)
    }
  }

  const filteredResources = resources.filter((resource) => filters.length === 0 || filters.includes(resource.category))

  const toggleFavorite = (resourceId: number) => {
    setFavorites((prevFavorites) =>
      prevFavorites.includes(resourceId)
        ? prevFavorites.filter((id) => id !== resourceId)
        : [...prevFavorites, resourceId],
    )
  }

  const handleAddReview = (review: Omit<Review, "id">) => {
    if (selectedResource) {
      const updatedResource = {
        ...selectedResource,
        reviews: [...selectedResource.reviews, { ...review, id: Date.now() }],
        averageRating:
          (selectedResource.averageRating * selectedResource.reviews.length + review.rating) /
          (selectedResource.reviews.length + 1),
      }
      setResources((prevResources) => prevResources.map((r) => (r.id === selectedResource.id ? updatedResource : r)))
      setSelectedResource(updatedResource)
      setShowReviewModal(false)
    }
  }

  return (
    <div className="mt-8">
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
          onScroll={handleScroll}
          className="bg-card rounded-lg shadow-md p-4 max-h-[calc(100vh-300px)] overflow-y-auto glassmorphism"
        >
          {filteredResources.map((resource, index) => {
            const itemPosition = index / (filteredResources.length - 1)
            const distanceFromCenter = Math.abs(itemPosition - scrollPosition)
            const scale = 1 - distanceFromCenter * 0.3 // Adjust the 0.3 value to control the grow/shrink effect

            return (
              <motion.div
                key={resource.id}
                className={`mb-4 p-4 border border-border rounded-lg cursor-pointer transition-all duration-300 ease-in-out ${
                  resource.isNew ? "border-secondary" : ""
                } ${selectedResource?.id === resource.id ? "bg-primary/20" : "hover:bg-accent hover:text-accent-foreground"}`}
                onClick={() => setSelectedResource(resource)}
                style={{
                  scale,
                  opacity: 0.5 + (1 - distanceFromCenter) * 0.5, // Adjust opacity based on distance from center
                }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-semibold text-primary">{resource.name}</h3>
                  <div className="flex items-center">
                    <span className="text-secondary mr-2">{resource.averageRating.toFixed(1)}</span>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(resource.id)
                      }}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          favorites.includes(resource.id) ? "text-secondary fill-current" : "text-muted-foreground"
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
              </motion.div>
            )
          })}
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
    </div>
  )
}

export default ResourceFeed

