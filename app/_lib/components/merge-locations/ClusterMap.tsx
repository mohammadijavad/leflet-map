'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Location } from '../types/location';

interface MapBoundsProps {
  locations: Location[];
}

// Component to automatically fit bounds with animation
function MapBounds({ locations }: MapBoundsProps) {
  const map = useMap();
  const initialZoomDone = useRef(false);
  
  useEffect(() => {
    if (locations.length > 0 && !initialZoomDone.current) {
      // First, fit bounds to show all markers
      const bounds = L.latLngBounds(locations.map(loc => [loc.lat, loc.long]));
      map.fitBounds(bounds, { 
        padding: [50, 50],
        duration: 0 // Instant initial fit
      });

      // Then, after a short delay, zoom in smoothly
      setTimeout(() => {
        const center = bounds.getCenter();
        map.flyTo(center, 16, {
          duration: 1.5, // Animation duration in seconds
          easeLinearity: 0.25
        });
        initialZoomDone.current = true;
      }, 100);
    }
  }, [locations, map]);

  return null;
}

interface ClusterMapProps {
  locations: Location[];
}

function MarkersWrapper({ locations }: ClusterMapProps) {
  const map = useMap();
  const markersRef = useRef<L.Marker[]>([]);
  const [currentZoom, setCurrentZoom] = useState(map.getZoom());
  const MIN_ZOOM_FOR_PRICES = 3;

  useEffect(() => {
    const onZoomEnd = () => {
      setCurrentZoom(map.getZoom());
    };
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  // Function to calculate distance between two points in pixels at current zoom level
  const getPixelDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const point1 = map.latLngToContainerPoint([lat1, lon1]);
    const point2 = map.latLngToContainerPoint([lat2, lon2]);
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + 
      Math.pow(point2.y - point1.y, 2)
    );
  };

  // Function to check if a location is too close to any other location
  const isLocationCrowded = (location: Location, allLocations: Location[]) => {
    const MIN_PIXEL_DISTANCE = 40; // Minimum distance in pixels between markers
    return allLocations.some(otherLoc => {
      if (otherLoc === location) return false;
      const pixelDistance = getPixelDistance(
        location.lat, location.long,
        otherLoc.lat, otherLoc.long
      );
      return pixelDistance < MIN_PIXEL_DISTANCE;
    });
  };

  useEffect(() => {
    // Clean up previous markers
    markersRef.current.forEach(marker => {
      if (marker) {
        map.removeLayer(marker);
      }
    });
    markersRef.current = [];

    // Sort locations by price (highest first) to ensure expensive properties are more visible
    const sortedLocations = [...locations].sort((a, b) => b.price - a.price);

    // Create markers
    sortedLocations.forEach((location, index) => {
      const isCrowded = isLocationCrowded(location, sortedLocations);
      // Show price only if it's not crowded and we're zoomed in enough
      // For the highest price location, always show the price if we're zoomed in enough
      const showPrice = currentZoom >= MIN_ZOOM_FOR_PRICES && (!isCrowded || index === 0);
      
      const marker = L.marker([location.lat, location.long], {
        icon: L.divIcon({
          html: `
            <div class="price-marker">
              <div class="marker-circle ${index === 0 && !showPrice ? 'marker-circle-highlight' : ''}"></div>
              ${showPrice ? `<span class="price-text">${location.price.toLocaleString()}</span>` : ''}
            </div>`,
          className: 'custom-price-marker',
          iconSize: L.point(80, 40),
          iconAnchor: L.point(40, 40),
        }),
        zIndexOffset: index === 0 ? 1000 : 0 // Ensure highest price marker stays on top
      });
      
      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach(marker => {
        if (marker) {
          map.removeLayer(marker);
        }
      });
    };
  }, [locations, map, currentZoom]);

  return null;
}

export default function ClusterMap({ locations }: ClusterMapProps) {
  return (
    <>
      <style jsx global>{`
        .price-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }
        .marker-circle {
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 2px 5px rgba(0,0,0,0.3);
          border: 2px solid rgba(0,0,0,0.2);
        }
        .marker-circle-highlight {
          background: white;
          border: 2px solid black;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        }
        .price-text {
          background: black;
          color: white;
          border-radius: 20px;
          padding: 2px 8px;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
          white-space: nowrap;
          text-align: center;
          font-size: 0.875rem;
          position: absolute;
          top: -5px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
        }
        .custom-price-marker {
          background: none;
          border: none;
        }
      `}</style>
      <MapContainer
        style={{ height: '100vh', width: '100%' }}
        center={[36.5, 52.1]}
        zoom={13}
        scrollWheelZoom={true}
        maxZoom={18}
        minZoom={3}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds locations={locations} />
        <MarkersWrapper locations={locations} />
      </MapContainer>
    </>
  );
} 