import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Resource } from '@prisma/client';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star, Heart, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

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
    isFavorited?: boolean;
};

interface ResourceCardProps {
    resource: ResourceWithDetails;
    onDelete: (id: string) => void;
    onEdit: (resource: Resource) => void;
    onSelect: (resource: ResourceWithDetails | null) => void;
    onFavoriteChange: (resourceId: string, newFavoriteCount: number) => void;
}

/**
 * ResourceCard Component
 *
 * This component displays a resource card that includes an image (if available), name, location, hours, and average rating.
 * It provides functionalities for the user to like, edit, or delete their resources. If the current user is the owner of the resource, 
 * they will be able to see the edit and delete buttons when hovering over the card.
 *
 * @param {ResourceWithDetails} resource - The resource object to display.
 * @param {function} onDelete - A function to handle the deletion of a resource.
 * @param {function} onEdit - A function to handle the editing of a resource.
 * @param {function} onSelect - A function to handle selecting a resource.
 * @param {function} onFavoriteChange - A function to handle favorites.
 * 
 * @returns {JSX.Element} The ResourceCard component rendering a card with resource details.
 */
export function ResourceCard({ resource, onDelete, onEdit, onSelect, onFavoriteChange }: ResourceCardProps) {
    const { data: session } = useSession();
    const [isLiked, setIsLiked] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const [favoriteCount, setFavoriteCount] = useState(resource.favoriteCount || 0);

    // Determine if the current user is the owner of the resource
    const isOwner = session?.user?.id === resource.userId;

    // Calculate the average rating base in the resource's reviews
    const computedRating = 
        resource.reviews.length > 0
          ? resource.reviews.reduce((acc, review) => acc + review.rating, 0) / resource.reviews.length
          : 0;

    // Format numbers for favorite count
    const formatNumber = (num : number) => {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
        if (num >= 1_000) return (num / 1_000).toFixed(1) +"K";
        return num.toString();
    };

    // Handle the like button click
    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!resource) return;

        try {
        if (isLiked) {
            return;
        }
        
        const response = await fetch(`/api/resources/favorite?id=${resource.id}&action=favorite`, {
            method: "POST",
        });
        
        if (response.ok) {
            setIsLiked(true);
            const newFavoriteCount = favoriteCount + 1;
            setFavoriteCount(newFavoriteCount);
            onFavoriteChange(resource.id, newFavoriteCount);
        } else {
            const errorData = await response.json();
            console.error("Failed to update favorite status:", errorData);
        }
        } catch (error) {
        console.error("Error favoriting resource:", error);
        }
    };

    return (
        <motion.div
          className="relative overflow-hidden border rounded-lg bg-card hover:shadow-lg transition-all cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSelect(resource)}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex h-[200px]">
            {resource.imageUrl ? (
              <div className="relative w-1/2">
                <Image
                  src={resource.imageUrl}
                  alt={resource.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
              </div>
            ) : (
              <div className="w-1/2 bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground/60" />
              </div>
            )}
    
            <div className="flex-1 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-semibold text-primary">{resource.name}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLike}
                  className="flex items-center space-x-1 p-2 rounded-full hover:bg-secondary/10"
                >
                  <Heart className={`h-5 w-5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                  <span className="text-sm text-muted-foreground">
                    {formatNumber(favoriteCount)}
                  </span>
                </motion.button>
              </div>
    
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                {resource.location && (
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{resource.location}</span>
                  </div>
                )}
                {resource.hours && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{resource.hours}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  <span>{resource.averageRating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>
    
          {isOwner && isHovered && (
            <motion.div
              className="absolute bottom-0 right-0 flex gap-2 p-4 bg-gradient-to-t from-background/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(resource);
                }}
                className="flex items-center px-3 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(resource.id);
                }}
                className="flex items-center px-3 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </motion.button>
            </motion.div>
          )}
        </motion.div>
    );
}