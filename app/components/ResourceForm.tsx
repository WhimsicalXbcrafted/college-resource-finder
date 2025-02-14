"use client"

import { useState, useRef } from "react"
import { Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import type { Resource } from "@prisma/client"
import { motion } from "framer-motion"
import { X, Upload } from "lucide-react"
import Image from "next/image"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("./ResourceMap"), { ssr: false })

interface ResourceFormProps {
  resource?: Resource
  onSubmit: (resource: FormData) => void
  onClose: () => void
}

interface Coordinates {
  lat: number
  lng: number
}

const LocationPicker = ({
  coordinates,
  setCoordinates,
}: {
  coordinates: Coordinates
  setCoordinates: (coords: Coordinates) => void
}) => {
  useMapEvents({
    click(e) {
      setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })

  return <Marker position={[coordinates.lat, coordinates.lng]} />
}

export function ResourceForm({ resource, onSubmit, onClose }: ResourceFormProps) {
  const [name, setName] = useState(resource?.name || "")
  const [description, setDescription] = useState(resource?.description || "")
  const [location, setLocation] = useState(resource?.location || "")
  const [hours, setHours] = useState(resource?.hours || "")
  const [category, setCategory] = useState(resource?.category || "")
  const [coordinates, setCoordinates] = useState<Coordinates>(
    resource?.coordinates ? JSON.parse(resource.coordinates as string) : { lat: 47.6553, lng: -122.3035 },
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>(resource?.imageUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("location", location)
    formData.append("hours", hours)
    formData.append("category", category)
    formData.append("coordinates", JSON.stringify(coordinates))
    if (imageFile) {
      formData.append("image", imageFile)
    }
    onSubmit(formData)
  }

  const handleMapClick = (lat: number, lng: number) => {
    setCoordinates({ lat, lng })
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
                      onMapClick={(lat, lng) => handleMapClick(lat, lng)}
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