"use client"

import { useEffect, useRef } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { Star } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"

// Fix for default marker icons in Leaflet with Next.js
const icon = L.icon({
  iconUrl: "/images/marker-icon.png",
  iconRetinaUrl: "/images/marker-icon-2x.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

interface Resource {
  id: string
  name: string
  description: string | null
  location: string | null
  coordinates: any
  averageRating: number
}

interface ResourceMapProps {
  resources: Resource[]
  onMapClick?: (lat: number, lng: number) => void
  center?: { lat: number; lng: number }
  showMarker?: boolean
  zoom?: number
}

function MapEvents({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onClick?.(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

function CenterMarker({ position }: { position: L.LatLngExpression }) {
  const map = useMap()

  useEffect(() => {
    map.setView(position, map.getZoom())
  }, [position, map])

  return <Marker position={position} icon={icon} />
}

function MapFallback() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
      <p>Error loading map</p>
    </div>
  )
}

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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onClick={onMapClick} />

        {showMarker && center && <CenterMarker position={[center.lat, center.lng]} />}

        {resources.map((resource) => {
          if (!resource.coordinates) return null
          const coords = JSON.parse(resource.coordinates as string)
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