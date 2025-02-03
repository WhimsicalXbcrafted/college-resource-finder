import { motion, AnimatePresence } from "framer-motion"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  filters: string[]
  setFilters: (filters: string[]) => void
  categories: string[]
}

const FilterModal = ({ isOpen, onClose, filters, setFilters, categories }: FilterModalProps) => {
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

