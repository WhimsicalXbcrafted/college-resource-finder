"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ResourceFormProps {
    resource?: {
        id?: number;
        name: string;
        description: string;
        location: string;
        hours: string;
        category: string;
        coordinates: [number, number];
    };
    onSubmit: (data: any) => void;
    onClose: () => void;
}

interface Coordinates {
    lat: number;
    lng: number;
}

const LocationPicker = ({ coordinates, setCoordinates }: {
    coordinates: Coordinates;
    setCoordinates: (coords: Coordinates) => void;
}) => {
    useMapEvents({
        click(e) {
            setCoordinates({ lat: e.latlng.lat, lng: e.latlng.lng });
        },
    });

    return <Marker position={[coordinates.lat, coordinates.lng]} />;
};

const ResourceForm = ({ resource, onSubmit, onClose }: ResourceFormProps) => {
    const [name, setName] = useState(resource?.name || '');
    const [description, setDescription] = useState(resource?.description || '');
    const [location, setLocation] = useState(resource?.location || '');
    const [hours, setHours] = useState(resource?.hours || '');
    const [category, setCategory] = useState(resource?.category || '');
    const [coordinates, setCoordinates] = useState<Coordinates>(
        resource?.coordinates ? { lat: resource.coordinates[0], lng: resource.coordinates[1] } : { lat: 47.6553, lng: -122.3035 }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description, location, hours, category, coordinates, id: resource?.id });
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-lg shadow-lg max-w-2xl w-full">
                <h2 className="text-2xl font-bold mb-4">{resource ? "Edit Resource" : "Add Resource"}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border rounded p-2 text-black"
                            required
                        />
                    </div>
                    <div>
                        <label className="block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded p-2 text-black"
                        ></textarea>
                    </div>
                    <div>
                        <label className="block">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded p-2 text-black"
                        />
                    </div>
                    <div>
                        <label className="block">Hours</label>
                        <input
                            type="text"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            className="w-full border rounded p-2 text-black"
                        />
                    </div>
                    <div>
                        <label className="block">Category</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded p- text-black"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Location</label>
                        <div className="h-[300px] mb-2">
                            <MapContainer
                                center={[coordinates.lat, coordinates.lng]}
                                zoom={15}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationPicker coordinates={coordinates} setCoordinates={setCoordinates} />
                            </MapContainer>
                        </div>
                        <p className="text-sm text-muted-foreground">Click on the map to set location</p>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-secondary text-white rounded">
                            Cancel
                        </button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded">
                            {resource ? "Update" : "Create"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResourceForm;