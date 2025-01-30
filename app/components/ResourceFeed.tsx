"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, MapPin } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Resource {
  id: number
  name: string
  description: string
  location: string
  hours: string
}

export default function ResourceFeed() {
  const [resources, setResources] = useState<Resource[]>([])
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const feedRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Simulating API call to fetch resources
    const fetchedResources: Resource[] = [
      {
        id: 1,
        name: "Odegaard Library",
        description: "Main campus library with study spaces",
        location: "Central Campus",
        hours: "24/7",
      },
      {
        id: 2,
        name: "HUB (Husky Union Building)",
        description: "Student center with food and event spaces",
        location: "Central Campus",
        hours: "7AM - 11PM",
      },
      {
        id: 3,
        name: "IMA (Intramural Activities Building)",
        description: "Sports and fitness center",
        location: "East Campus",
        hours: "6AM - 10:30PM",
      },
      {
        id: 4,
        name: "University Bookstore",
        description: "Campus bookstore for textbooks and UW merchandise",
        location: "University Way NE",
        hours: "9AM - 6PM",
      },
      {
        id: 5,
        name: "UW Career Center",
        description: "Career counseling and job search resources",
        location: "Mary Gates Hall",
        hours: "8AM - 5PM",
      },
      {
        id: 6,
        name: "Hall Health Center",
        description: "On-campus health clinic for students",
        location: "East Campus",
        hours: "8AM - 5PM",
      },
      {
        id: 7,
        name: "Suzzallo Library",
        description: "Gothic-style library with grand reading room",
        location: "Central Campus",
        hours: "7AM - 10PM",
      },
      {
        id: 8,
        name: "UW Food Pantry",
        description: "Free food resources for students",
        location: "Poplar Hall",
        hours: "10AM - 4PM",
      },
    ]
    setResources(fetchedResources)
  }, [])

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault()
    const delta = e.deltaY
    const scrollAmount = 100 // Adjust this value to control scroll speed

    if (delta > 0) {
      // Scrolling down
      setResources((prevResources) => {
        const newResources = [...prevResources]
        const first = newResources.shift()
        if (first) newResources.push(first)
        return newResources
      })
    } else {
      // Scrolling up
      setResources((prevResources) => {
        const newResources = [...prevResources]
        const last = newResources.pop()
        if (last) newResources.unshift(last)
        return newResources
      })
    }

    if (feedRef.current) {
      feedRef.current.scrollTop += delta > 0 ? scrollAmount : -scrollAmount
    }
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-purple-800">Popular Resources</h2>
      <div className="relative">
        <div
          ref={feedRef}
          onWheel={handleScroll}
          className="bg-white rounded-lg shadow-md p-4 max-h-[calc(100vh-300px)] overflow-hidden"
        >
          {resources.map((resource, index) => (
            <motion.div
              key={`${resource.id}-${index}`}
              className="mb-4 p-4 border rounded-lg cursor-pointer hover:bg-purple-50 transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => setSelectedResource(resource)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <h3 className="text-xl font-semibold text-purple-700">{resource.name}</h3>
              <p className="text-gray-600">{resource.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {selectedResource && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-white rounded-lg shadow-md p-6"
          >
            <h3 className="text-2xl font-semibold mb-4 text-purple-700">{selectedResource.name}</h3>
            <p className="text-gray-600 mb-4">{selectedResource.description}</p>
            <div className="flex items-center space-x-2 text-gray-600 mb-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <span>{selectedResource.location}</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Clock className="h-5 w-5 text-purple-500" />
              <span>{selectedResource.hours}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}