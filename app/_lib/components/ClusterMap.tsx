/** @format */

'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaPlus, FaMinus, FaSatellite } from 'react-icons/fa';
import { FaRegMap } from "react-icons/fa6";
import { MdOutlineGpsFixed } from "react-icons/md";

import { Location } from '../types/types';
interface MapBoundsProps {
  locations: Location[];
}

// Component to automatically fit bounds with animation
function MapBounds({ locations }: MapBoundsProps) {
  const map = useMap();
  const initialZoomDone = useRef(false);

  useEffect(() => {
    if (!initialZoomDone.current) {
      // Set initial center and zoom
      const initialCenter = L.latLng(32.63012300670739, 53.51440429687501);
      map.setView(initialCenter, 6);

      // Then, after a short delay, zoom in smoothly to the center of locations if they exist
      setTimeout(() => {
        if (locations.length > 0) {
          const bounds = L.latLngBounds(
            locations.map((loc) => [loc.geo.lat, loc.geo.lng])
          );
          const center = bounds.getCenter();
          map.flyTo(center, 12, {
            duration: 1.5,
            easeLinearity: 0.25,
          });
        }
        initialZoomDone.current = true;
      }, 500);
    }

    // Add event listeners for map movement
    const handleMoveEnd = () => {
      const center = map.getCenter();
      console.log('Map center coordinates:', {
        latitude: center.lat,
        longitude: center.lng,
      });
    };

    const handleDragEnd = () => {
      const center = map.getCenter();
      console.log('Map dragged to:', {
        latitude: center.lat,
        longitude: center.lng,
      });
    };

    map.on('moveend', handleMoveEnd);
    map.on('dragend', handleDragEnd);

    return () => {
      map.off('moveend', handleMoveEnd);
      map.off('dragend', handleDragEnd);
    };
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
      const currentZoom = map.getZoom();
      setCurrentZoom(currentZoom);
      console.log('Current zoom level:', currentZoom); //gives me user zoom level 💹
    };
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [map]);

  // Function to calculate distance between two points in pixels at current zoom level
  const getPixelDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const point1 = map.latLngToContainerPoint([lat1, lon1]);
    const point2 = map.latLngToContainerPoint([lat2, lon2]);
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
    );
  };

  // Function to check if a location is too close to any other location
  const isLocationCrowded = (location: Location, allLocations: Location[]) => {
    const MIN_PIXEL_DISTANCE = 40; // Minimum distance in pixels between markers
    return allLocations.some((otherLoc) => {
      if (otherLoc === location) return false;
      const pixelDistance = getPixelDistance(
        location.geo.lat,
        location.geo.lng,
        otherLoc.geo.lat,
        otherLoc.geo.lng
      );
      return pixelDistance < MIN_PIXEL_DISTANCE;
    });
  };

  useEffect(() => {
    // Clean up previous markers
    markersRef.current.forEach((marker) => {
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
      const showPrice =
        currentZoom >= MIN_ZOOM_FOR_PRICES && (!isCrowded || index === 0);

      const marker = L.marker([location.geo.lat, location.geo.lng], {
        icon: L.divIcon({
          html: `
            <div class="price-marker">
              ${
                showPrice
                  ? `<span class="price-text">${location.price.toLocaleString()}</span>`
                  : `
                 <div class="marker-circle overflow-hidden ${
                   index === 0 && !showPrice ? 'marker-circle-highlight' : ''
                 }">
                 <div class="hover-price">${location.price.toLocaleString()}</div>
              </div>`
              }
            </div>`,
          className: 'custom-price-marker',
          iconSize: L.point(80, 40),
          iconAnchor: L.point(40, 40),
        }),
        zIndexOffset: index === 0 ? 1000 : 0, // Ensure highest price marker stays on top
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => {
        if (marker) {
          map.removeLayer(marker);
        }
      });
    };
  }, [locations, map, currentZoom]);

  return null;
}

interface MapControlsProps {
  setMapView: (view: 'map' | 'satellite') => void;
  mapView: 'map' | 'satellite';
}

function MapControls({ setMapView, mapView }: MapControlsProps) {
  const map = useMap();

  const zoomIn = () => {
    map.zoomIn();
  };

  const zoomOut = () => {
    map.zoomOut();
  };

  const locateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          map.flyTo([position.coords.latitude, position.coords.longitude], 15);
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  };

  return (
    <div className='absolute bottom-10 right-4 flex flex-col gap-2 z-[1000]'>
      <div className='flex flex-col gap-0.5'>
        <button
          onClick={zoomIn}
          className='bg-white/90 hover:bg-white text-black px-3 py-4 flex items-center justify-center rounded-t-full cursor-pointer'
        >
          <FaPlus size={18} />
        </button>
        <button
          onClick={zoomOut}
          className='bg-white/90 hover:bg-white text-black px-3 py-4 flex items-center justify-center rounded-b-full cursor-pointer'
        >
          <FaMinus size={18} />
        </button>
      </div>
      <div className='flex flex-col gap-0.5'>
        <button
          onClick={() => setMapView('satellite')}
          className={`px-3 py-4 flex items-center justify-center rounded-t-full cursor-pointer ${
            mapView === 'satellite' ? 'text-white bg-gray-900' : 'text-black bg-white'
          }`}
        >
          <FaSatellite size={18} />
        </button>
        <button
          onClick={() => setMapView('map')}
          className={`px-3 py-4 flex items-center justify-center rounded-b-full cursor-pointer ${
            mapView === 'map' ? 'text-white bg-gray-900' : 'text-black bg-white'
          }`}
        >
          <FaRegMap size={18} />
        </button>
      </div>
      <button
        onClick={locateMe}
        className='text-white/90 bg-gray-900 px-3 py-3 flex items-center justify-center rounded-full cursor-pointer'
      >
        <MdOutlineGpsFixed size={18} />
      </button>
    </div>
  );
}

export default function ClusterMap({ locations }: ClusterMapProps) {
  const [mapView, setMapView] = useState<'map' | 'satellite'>('map');

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
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
          border: 2px solid rgba(0, 0, 0, 0.2);
          position: relative;
          transition: all 0.3s ease;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .marker-circle:hover {
          width: 80px;
          height: 24px;
          transform: scale(1.1);
          border-color: black;
          box-shadow: 0 3px 7px rgba(0, 0, 0, 0.4);
          border-radius: 10px;
        }
        .hover-price {
          color: black;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: 1000;
        }
        .marker-circle:hover .hover-price {
          opacity: 1;
          visibility: visible;
        }
        .marker-circle-highlight {
          background: white;
          border: 2px solid black;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
        }
        .price-text {
          background: black;
          color: white;
          border-radius: 20px;
          padding: 2px 8px;
          font-weight: bold;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
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
        zoomControl={false}
      >
        {mapView === 'map' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          />
        )}
        <MapBounds locations={locations} />
        <MarkersWrapper locations={locations} />
        <MapControls setMapView={setMapView} mapView={mapView} />
      </MapContainer>
    </>
  );
}
