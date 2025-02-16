import { motion, AnimatePresence } from 'framer-motion';
import { Resource } from '@prisma/client';
import { X, MapPin, Clock, Star, Image as ImageIcon, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Dynamically imported `ResourceMap` component with SSR disabled for client-side rendering.
 */
const Map = dynamic(() => import('./ResourceMap'), { ssr: false });

/**
 * Type representing the detailed information of a resource, extending the base `Resource` type.
 * Includes optional user and review details associated with the resource.
 */
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
    userId: string;
    user: {
      name: string | null;
      avatarUrl: string | null;
    };
  }>;
};

/**
 * Props for the `ResourceDetailModal` component.
 * @param resource - The resource object to be displayed in the modal.
 * @param onClose - Callback function triggered when the modal is closed.
 * @param onAddReview - Optional callback to trigger when the user adds a review.
 * @param onDeleteReview - Optional callback to trigger when a review is deleted.
 * @param currentUserId - The ID of the current user, used to conditionally show delete options for reviews.
 */
interface ResourceDetailModalProps {
  resource: ResourceWithDetails | null;
  onClose: () => void;
  onAddReview?: () => void;
  onDeleteReview?: (reviewId: string) => void;
  currentUserId?: string;
}

/**
 * `ResourceDetailModal` component that displays a detailed view of a resource, including image, description, location, and reviews.
 * 
 * It supports adding and deleting reviews, and conditionally renders map and other details if available.
 *
 * @param resource - The resource to display in the modal.
 * @param onClose - The function to close the modal.
 * @param onAddReview - Optional function to handle adding a review.
 * @param onDeleteReview - Optional function to handle deleting a review.
 * @param currentUserId - The ID of the current user, used for identifying if the user can delete their own reviews.
 */
export function ResourceDetailModal({
  resource,
  onClose,
  onAddReview,
  onDeleteReview,
  currentUserId,
}: ResourceDetailModalProps) {
  const [reviews, setReviews] = useState(resource?.reviews || []);

  // Update reviews when resource changes
  useEffect(() => {
    if (resource) {
      setReviews(resource.reviews);
    }
  }, [resource]);

  // Return null if no resource is provided
  if (!resource) return null;

  // Parse coordinates from JSON if present
  const coordinates = resource.coordinates ? JSON.parse(resource.coordinates as string) : null;

  /**
   * Handle deleting a review by filtering it out from the reviews list and calling the `onDeleteReview` callback.
   * @param reviewId - The ID of the review to delete.
   */
  const handleDeleteReview = (reviewId: string) => {
    setReviews(reviews.filter((review) => review.id !== reviewId));
    onDeleteReview?.(reviewId);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="fixed inset-4 md:inset-10 bg-card rounded-lg shadow-xl overflow-y-auto"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary/10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 p-6">
              <div className="relative h-[300px] mb-6 rounded-lg overflow-hidden">
                {resource.imageUrl ? (
                  <Image
                    src={resource.imageUrl}
                    alt={resource.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-bold mb-4">{resource.name}</h2>

              <div className="flex items-center space-x-4 mb-6">
                {resource.location && (
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{resource.location}</span>
                  </div>
                )}
                {resource.hours && (
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{resource.hours}</span>
                  </div>
                )}
              </div>

              <p className="text-lg mb-6">{resource.description}</p>

              {coordinates && (
                <div className="h-[300px] rounded-lg overflow-hidden mb-6">
                  <Map resources={[resource]} />
                </div>
              )}
            </div>

            <div className="w-full md:w-1/2 border-t md:border-l md:border-t-0 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-semibold">Reviews</h3>
                <button
                  onClick={onAddReview}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                  Add Review
                </button>
              </div>

              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border rounded-lg p-4 relative">
                    <div className="flex items-center mb-2">
                      {review.user.avatarUrl && (
                        <Image
                          src={review.user.avatarUrl}
                          alt={review.user.name || ''}
                          width={32}
                          height={32}
                          className="rounded-full mr-2"
                        />
                      )}
                      <span className="font-medium">{review.user.name}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    {review.comment && <p>{review.comment}</p>}

                    {currentUserId === review.userId && (
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="absolute top-2 right-2 p-2 rounded-full text-red-500 hover:bg-red-100"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}