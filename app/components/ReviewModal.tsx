import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Star } from "lucide-react"
import { Review } from '@prisma/client'

/**
 * Props for the ReviewModal component.
 * 
 * @property {boolean} isOpen - Whether the modal is open or not.
 * @property {() => void} onClose - Function to close the modal.
 * @property {string} resourceId - ID of the resource being reviewed.
 * @property {(review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void} onSubmit - Function to submit the review.
 */
interface ReviewModalProps {
  isOpen: boolean       // Whether the modal is visible
  onClose: () => void   // Function to close the modal
  resourceId: string    // ID of the resource being reviewed
  onSubmit: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void  // Function to submit the review
}

/**
 * ReviewModal component provides a UI for submitting a review for a resource.
 * It includes a star rating input and a text area for comments.
 * The modal is animated using `framer-motion` and will close when clicked outside.
 * 
 * @param {ReviewModalProps} props - The properties for the ReviewModal component.
 * @returns {JSX.Element} The modal for submitting a review.
 */
const ReviewModal = ({ isOpen, onClose, resourceId, onSubmit }: ReviewModalProps) => {
  const [rating, setRating] = useState(0)   // State to store the selected rating
  const [comment, setComment] = useState("") // State to store the comment input

  // Handle the form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Call the onSubmit function with the review data
    onSubmit({ userId: '1', resourceId, rating, comment })
    // Reset the form after submission
    setRating(0)
    setComment("")
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}             // Initial animation state for the modal
          animate={{ opacity: 1 }}             // Final animation state for the modal
          exit={{ opacity: 0 }}                // Exit animation state for the modal
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}                    // Close the modal when clicking outside
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}    // Initial animation state for the modal content
            animate={{ scale: 1, opacity: 1 }}     // Final animation state for the modal content
            exit={{ scale: 0.9, opacity: 0 }}      // Exit animation state for the modal content
            className="bg-card rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}  // Prevent closing the modal when clicking inside
          >
            <h2 className="text-2xl font-semibold mb-4 text-primary">Add Review</h2>
            <form onSubmit={handleSubmit}>
              {/* Rating input (star buttons) */}
              <div className="mb-4">
                <label className="block text-foreground text-sm font-bold mb-2">Rating</label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setRating(star)} className="focus:outline-none">
                      <Star
                        className={`h-6 w-6 ${star <= rating ? "text-yellow-500 fill-current" : "text-muted-foreground"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment input (textarea) */}
              <div className="mb-4">
                <label className="block text-foreground text-sm font-bold mb-2" htmlFor="comment">
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}   // Update comment state
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-foreground bg-background leading-tight focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={4}
                ></textarea>
              </div>

              {/* Submit and Cancel buttons */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}   // Close modal on cancel
                  className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 transition duration-300 mr-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ReviewModal