"use client";

import { useState } from "react";

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

const ResourceForm = ({ resource, onSubmit, onClose }: ResourceFormProps) => {
    const [name, setName] = useState(resource?.name || '');
    const [description, setDescription] = useState(resource?.description || '');
    const [location, setLocation] = useState(resource?.location || '');
    const [hours, setHours] = useState(resource?.hours || '');
    const [category, setCategory] = useState(resource?.category || '');
    const [coordinates, setCoordinates] = useState<[number, number]>(resource?.coordinates || [0, 0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit({ name, description, location, hours, category, coordinates, id: resource?.id });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-md w-full max-w-md">
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
              {/* For coordinates, using two number inputs */}
              <div className="flex space-x-2">
                <div className="w-1/2">
                  <label className="block">Latitude</label>
                  <input
                    type="number"
                    value={coordinates[0]}
                    onChange={(e) => setCoordinates([parseFloat(e.target.value), coordinates[1]])}
                    className="w-full border rounded p-2 text-black"
                  />
                </div>
                <div className="w-1/2">
                  <label className="block">Longitude</label>
                  <input
                    type="number"
                    value={coordinates[1]}
                    onChange={(e) => setCoordinates([coordinates[0], parseFloat(e.target.value)])}
                    className="w-full border rounded p-2 text-black"
                  />
                </div>
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