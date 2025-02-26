"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Star } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

// Custom marker icon using your new image from public/images/image.png
const customIcon = L.divIcon({
  className: "custom-marker",
  html: `
    <div class="marker-container">
      <svg width="32" height="48" viewBox="0 0 32 48" xmlns="http://www.w3.org/2000/svg">
        <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.3"/>
        </filter>
        <path fill="#4F46E5" d="M16 0C7.16 0 0 7.16 0 16c0 9.88 16 32 16 32s16-22.12 16-32C32 7.16 24.84 0 16 0z" filter="url(#shadow)"/>
        <circle cx="16" cy="16" r="8" fill="#ffffff"/>
      </svg>
    </div>
         `,
  iconSize: [32, 48],
  iconAnchor: [16, 48],
  popupAnchor: [0, -48],       
})

/**
 * Type representing the data structure of a resource.
 */
interface Resource {
  id: string
  name: string
  description: string | null
  location: string | null
  coordinates: string | null
  averageRating: number
}

/**
 * Properties expected by the ResourceMap component.
 */
interface ResourceMapProps {
  resources: Resource[]
  onMapClick?: (lat: number, lng: number) => void
  center?: { lat: number; lng: number }
  showMarker?: boolean
  zoom?: number
}

/**
 * MapEvents component handles the map click event.
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
 * CenterMarker component displays a marker at a given position and updates the map view.
 */
function CenterMarker({ position }: { position: L.LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return <Marker position={position} icon={customIcon} />
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
 * ResourceMap component renders a map with markers for each resource.
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

        {/* Optionally display a center marker */}
        {showMarker && center && <CenterMarker position={[center.lat, center.lng]} />}

        {/* Render resource markers with popups */}
        {resources.map((resource) => {
          if (!resource.coordinates) return null
          const coords = JSON.parse(resource.coordinates)
          return (
            <Marker key={resource.id} position={[coords.lat, coords.lng]} icon={customIcon}>
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