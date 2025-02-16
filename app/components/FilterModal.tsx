import { motion, AnimatePresence } from "framer-motion"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: string[]
  setFilters: (filters: string[]) => void
  categories: string[]
}

/**
 * FilterModal Component
 *
 * A modal for filtering resources by categories. It allows the user to toggle categories
 * on or off using checkboxes, and closes when the user clicks outside or on the close button.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isOpen - Determines if the modal is visible or not.
 * @param {Function} props.onClose - A function to close the modal when called.
 * @param {string[]} props.filters - A list of currently active filters (selected categories).
 * @param {Function} props.setFilters - A function to update the active filters (selected categories).
 * @param {string[]} props.categories - A list of category names that can be selected for filtering.
 * @returns {JSX.Element} The FilterModal component.
 */
const FilterModal = ({ isOpen, onClose, filters, setFilters, categories }: FilterModalProps) => {
  /**
   * Toggles the filter status for a specific category.
   * If the category is already selected, it is removed from the filters list;
   * otherwise, it is added to the list.
   * 
   * @param {string} category - The category to toggle.
   */
  const handleFilterToggle = (category: string) => {
    if (filters.includes(category)) {
      setFilters(filters.filter((f) => f !== category))
    } else {
      setFilters([...filters, category])
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-card rounded-lg p-6 w-full max-w-md shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-semibold mb-4 text-primary">Filter Resources</h2>
            <div className="space-y-2">
              {categories.map((category) => (
                <label key={category} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.includes(category)}
                    onChange={() => handleFilterToggle(category)}
                    className="form-checkbox h-5 w-5 text-primary border-primary"
                  />
                  <span className="text-foreground">{category}</span>
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition duration-300"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default FilterModal

