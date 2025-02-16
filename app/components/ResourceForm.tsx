"use client"

import { useState, useRef } from "react"
import "leaflet/dist/leaflet.css"
import type { Resource } from "@prisma/client"
import { motion } from "framer-motion"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"

// Dynamically importing the ResourceMap component with server-side rendering disabled
const Map = dynamic(() => import("./ResourceMap"), { ssr: false })

// Type definitions for the component props
interface ResourceFormProps {
  resource?: Resource // Optional resource to be edited, if provided
  onSubmit: (resource: FormData) => void // Callback for handling form submission
  onClose: () => void // Callback for closing the form
}

interface Coordinates {
  lat: number // Latitude of the location on the map
  lng: number // Longitude of the location on the map
}

// Main component for adding or editing a resource
export function ResourceForm({ resource, onSubmit, onClose }: ResourceFormProps) {
  // State variables for form fields (with fallback values from existing resource)
  const [name, setName] = useState(resource?.name || "")
  const [description, setDescription] = useState(resource?.description || "")
  const [location, setLocation] = useState(resource?.location || "")
  const [hours, setHours] = useState(resource?.hours || "")
  const [category, setCategory] = useState(resource?.category || "")
  const [coordinates, setCoordinates] = useState<Coordinates>(
    resource?.coordinates ? JSON.parse(resource.coordinates as string) : { lat: 47.6553, lng: -122.3035 },
  )
  const [imageFile, setImageFile] = useState<File | null>(null) // Stores the image file
  const [imagePreview, setImagePreview] = useState<string>(resource?.imageUrl || "") // Image preview URL
  const fileInputRef = useRef<HTMLInputElement>(null) // Reference to file input

  // Handles image file selection and preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file) // Read file as a data URL
    }
  }

  // Handles form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData() // Prepare form data to send to the server
    formData.append("name", name)
    formData.append("description", description)
    formData.append("location", location)
    formData.append("hours", hours)
    formData.append("category", category)
    formData.append("coordinates", JSON.stringify(coordinates))
    if (imageFile) {
      formData.append("image", imageFile) // Add image file to form data if provided
    }
    onSubmit(formData) // Trigger the onSubmit callback with form data
  }

  return (
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
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">{resource ? "Edit Resource" : "Add New Resource"}</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary/10">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background h-32"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hours</label>
                  <input
                    type="text"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2 rounded-md border bg-background"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Image</label>
                  <div
                    className="relative h-[200px] border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <Image src={imagePreview || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                        <Upload className="h-10 w-10 mb-2" />
                        <span>Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Location on Map</label>
                  <div className="h-[300px] rounded-lg overflow-hidden">
                    <Map
                      resources={[]}
                      onMapClick={(lat, lng) => setCoordinates({ lat, lng })}
                      center={coordinates}
                      showMarker={true}
                      zoom={13}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-md border hover:bg-secondary/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                {resource ? "Save Changes" : "Create Resource"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default ResourceForm