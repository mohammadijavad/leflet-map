'use client';

import dynamic from 'next/dynamic';
import { Location } from './types/location';

// Dynamically import the map component to avoid SSR issues
const ClusterMap = dynamic(() => import('./components/ClusterMap'), {
  ssr: false
});

// Generate locations with some clusters and some spread out points
const generateLocations = () => {
  const locations: Location[] = [];
  
  // Center point
  const centerLat = 36.5;
  const centerLong = 52.1;

  // Create first cluster (10 points close together)
  for (let i = 0; i < 10; i++) {
    locations.push({
      lat: centerLat + (Math.random() - 0.5) * 0.01,
      long: centerLong + (Math.random() - 0.5) * 0.01,
      price: Math.floor(Math.random() * 8000000) + 1000000
    });
  }

  // Create second cluster (8 points) slightly to the north-east
  for (let i = 0; i < 8; i++) {
    locations.push({
      lat: centerLat + 0.05 + (Math.random() - 0.5) * 0.01,
      long: centerLong + 0.05 + (Math.random() - 0.5) * 0.01,
      price: Math.floor(Math.random() * 8000000) + 1000000
    });
  }

  // Add scattered points (12 points spread out)
  const scatteredPoints = [
    { offsetLat: -0.1, offsetLong: -0.1 },
    { offsetLat: -0.1, offsetLong: 0.1 },
    { offsetLat: 0.1, offsetLong: -0.1 },
    { offsetLat: 0.1, offsetLong: 0.1 },
    { offsetLat: 0.15, offsetLong: 0 },
    { offsetLat: -0.15, offsetLong: 0 },
    { offsetLat: 0, offsetLong: 0.15 },
    { offsetLat: 0, offsetLong: -0.15 },
    { offsetLat: 0.08, offsetLong: 0.08 },
    { offsetLat: -0.08, offsetLong: -0.08 },
    { offsetLat: 0.12, offsetLong: -0.12 },
    { offsetLat: -0.12, offsetLong: 0.12 },
  ];

  scatteredPoints.forEach(point => {
    locations.push({
      lat: centerLat + point.offsetLat + (Math.random() - 0.5) * 0.005,
      long: centerLong + point.offsetLong + (Math.random() - 0.5) * 0.005,
      price: Math.floor(Math.random() * 8000000) + 1000000
    });
  });

  return locations;
};

const sampleLocations = generateLocations();

// Log the locations for debugging
console.log('Total locations:', sampleLocations.length);
console.log('Sample of locations:', sampleLocations.slice(0, 3));

export default function Home() {
  return (
    <main className="min-h-screen">
      <ClusterMap locations={sampleLocations} />
    </main>
  );
}
