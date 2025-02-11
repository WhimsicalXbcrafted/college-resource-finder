import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Star } from "lucide-react"
import L from "leaflet"

// Fix marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/images/marker-icon-2x.png",
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
})

interface Resource {
  id: number
  name: string
  description: string
  location: string
  coordinates: [number, number]
  averageRating: number
}

interface ResourceMapProps {
  resources: Resource[]
}

const ResourceMap = ({ resources }: ResourceMapProps) => {
  return (
    <MapContainer center={[47.6553, -122.3035]} zoom={15} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {resources.map((resource) => (
        <Marker key={resource.id} position={resource.coordinates}>
          <Popup>
            <div>
              <h3 className="font-bold">{resource.name}</h3>
              <p>{resource.description}</p>
              <p className="text-sm text-gray-600">{resource.location}</p>
              <div className="flex items-center mt-2">
                <Star className="h-4 w-4 text-yellow-500 fill-current mr-1" />
                <span>{resource.averageRating.toFixed(1)}</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}

export default ResourceMap

