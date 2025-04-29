'use client';

import { useState } from 'react';
import Image from 'next/image';
import { locations } from '../_lib/data';
import ClusterMap from '../_lib/components/ClusterMap';

export default function LocationsPage() {
  const [hoveredLocationId, setHoveredLocationId] = useState<number | null>(null);

  return (
    <div className="flex flex-col lg:flex-row h-screen">
      {/* Map Section */}
      <div className="w-full lg:w-2/3 h-1/2 lg:h-full">
        <ClusterMap locations={locations} selectedLocationId={hoveredLocationId} />
      </div>

      {/* Cards Section */}
      <div className="w-full lg:w-1/3 h-1/2 lg:h-full overflow-y-auto bg-gray-50 p-4">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Available Properties</h1>
        <div className="grid grid-cols-1 gap-4">
          {locations.map((location) => (
            <div
              key={location.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 cursor-pointer ${
                hoveredLocationId === location.id 
                  ? 'bg-blue-50' 
                  : 'hover:bg-gray-50'
              }`}
              onMouseEnter={() => setHoveredLocationId(location.id)}
              onMouseLeave={() => setHoveredLocationId(null)}
            >
              <div className="relative h-48 w-full">
                <Image
                  src={'https://storage.jajiga.com/public/pictures/medium/3142767220508160923.jpg'}
                  alt={location.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {location.title}
                </h2>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    ${location.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 