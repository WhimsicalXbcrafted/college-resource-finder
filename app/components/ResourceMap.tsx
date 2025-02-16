"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Star } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "/images/marker-icon.png",        // URL for the marker icon
  iconRetinaUrl: "/images/marker-icon-2x.png",// URL for the retina display marker icon
  shadowUrl: "/images/marker-shadow.png",    // URL for the marker shadow
  iconSize: [25, 41],                        // Size of the marker icon
  iconAnchor: [12, 41],                      // Anchor point for the marker icon
  popupAnchor: [1, -34],                     // Anchor point for the popup relative to the marker icon
  shadowSize: [41, 41],                      // Size of the shadow
})

/**
 * Type representing the data structure of a resource.
 * 
 * @property {string} id - The unique identifier of the resource.
 * @property {string} name - The name of the resource.
 * @property {string | null} description - The description of the resource (nullable).
 * @property {string | null} location - The location of the resource (nullable).
 * @property {any} coordinates - The coordinates of the resource (latitude and longitude).
 * @property {number} averageRating - The average rating of the resource.
 */
interface Resource {
  id: string
  name: string
  description: string | null
  location: string | null
  coordinates: any
  averageRating: number
}

/**
 * Properties expected by the ResourceMap component.
 * 
 * @property {Resource[]} resources - Array of resources to display on the map.
 * @property {(lat: number, lng: number) => void} [onMapClick] - Optional callback when the map is clicked.
 * @property {{ lat: number, lng: number }} [center] - The initial center of the map (default is Seattle).
 * @property {boolean} [showMarker] - Whether to display a center marker on the map.
 * @property {number} [zoom] - The zoom level of the map (default is 13).
 */
interface ResourceMapProps {
  resources: Resource[]          // Array of resources to display on the map.
  onMapClick?: (lat: number, lng: number) => void  // Optional callback when map is clicked.
  center?: { lat: number; lng: number }           // Initial center of the map (default is Seattle).
  showMarker?: boolean          // Flag to show the center marker.
  zoom?: number                 // Zoom level of the map (default is 13).
}

/**
 * MapEvents component handles the map click event and triggers the onClick callback.
 * 
 * @param {Object} props
 * @param {(lat: number, lng: number) => void} [props.onClick] - Callback to handle click event on the map.
 */
function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

/**
 * CenterMarker component displays a marker at the given position and updates the map view accordingly.
 * 
 * @param {Object} props
 * @param {L.LatLngExpression} props.position - Position of the marker to display.
 */
function CenterMarker({ position }: { position: L.LatLngExpression }) {
  const map = useMap()

  // Update the map view when the position changes
  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return <Marker position={position} icon={icon} />
}

/**
 * MapFallback component displays a fallback UI when the map fails to load.
 */
function MapFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
      <p>Error loading map</p>
    </div>
  )
}

/**
 * ResourceMap component renders a map displaying the provided resources.
 * It includes markers for each resource, and an optional center marker and click handler.
 * 
 * @param {ResourceMapProps} props - The properties for the ResourceMap component.
 * @returns {JSX.Element} The rendered map with markers.
 */
export default function ResourceMap({
  resources,
  onMapClick,
  center = { lat: 47.6553, lng: -122.3035 },
  showMarker = false,
  zoom = 13,
}: ResourceMapProps) {
  const mapRef = useRef<L.Map>(null)

  return (
    <ErrorBoundary FallbackComponent={MapFallback}>
      <MapContainer center={[center.lat, center.lng]} zoom={zoom} className="h-full w-full rounded-lg" ref={mapRef}>
        {/* TileLayer for the map background */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Handle map click events */}
        <MapEvents onClick={onMapClick} />

        {/* Display center marker if showMarker is true */}
        {showMarker && center && <CenterMarker position={[center.lat, center.lng]} />}

        {/* Render resource markers with popups */}
        {resources.map((resource) => {
          if (!resource.coordinates) return null
          const coords = JSON.parse(resource.coordinates as string) // Parse coordinates to LatLng object
          return (
            <Marker key={resource.id} position={[coords.lat, coords.lng]} icon={icon}>
              <Popup className="resource-popup">
                <div className="p-2">
                  <h3 className="font-bold text-lg mb-2">{resource.name}</h3>
                  {resource.description && <p className="text-sm mb-2">{resource.description}</p>}
                  {resource.location && <p className="text-sm text-gray-600 mb-2">{resource.location}</p>}
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                    <span className="text-sm">{resource.averageRating.toFixed(1)}</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </ErrorBoundary>
  )
}