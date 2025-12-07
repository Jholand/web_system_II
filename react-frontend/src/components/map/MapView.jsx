import React, { useRef, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import { useLocation } from '../../contexts/LocationContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';

// Fix for default marker icons in Leaflet with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom user location icon
const userIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="8" fill="#14b8a6" stroke="#fff" stroke-width="3"/>
      <circle cx="16" cy="16" r="12" fill="none" stroke="#14b8a6" stroke-width="2" opacity="0.3"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

// Custom destination icons
const createDestinationIcon = (category, categoryIcon) => {
  // Assign colors based on category type
  const colorMap = {
    'hotels & resorts': '#3b82f6',    // blue
    'hotel': '#3b82f6',
    'agricultural farms': '#22c55e',  // green
    'agri farm': '#22c55e',
    'restaurants': '#f59e0b',         // orange
    'mountains': '#8b5cf6',           // purple
    'nature parks': '#10b981',        // emerald
    'historical sites': '#ef4444',    // red
    'attractions': '#ec4899',         // pink
    'beaches': '#06b6d4',             // cyan
    'tourist spot': '#a855f7',        // purple
  };
  
  const lowerCategory = category?.toLowerCase() || '';
  const color = colorMap[lowerCategory] || '#6b7280'; // default gray
  const firstLetter = category?.charAt(0)?.toUpperCase() || '?';
  
  return new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="${color}"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
        <text x="16" y="21" text-anchor="middle" font-size="16" fill="${color}">${firstLetter}</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  });
};

// Keep legacy static icons for backward compatibility
const destinationIcons = {
  hotel: createDestinationIcon('hotel'),
  'agri farm': createDestinationIcon('agri farm'),
  'tourist spot': createDestinationIcon('tourist spot'),
};

// Component to recenter map when user location changes
const RecenterMap = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!center || !map) return;
    
    // Wait for map to be fully initialized
    if (!map._loaded) {
      map.whenReady(() => {
        try {
          map.setView(center, zoom || map.getZoom());
        } catch (error) {
          console.error('Error recentering map:', error);
        }
      });
    } else {
      try {
        map.setView(center, zoom || map.getZoom());
      } catch (error) {
        console.error('Error recentering map:', error);
      }
    }
  }, [center, map, zoom]);
  
  return null;
};

// Component to fit bounds when navigation is active
const FitBounds = ({ bounds }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!bounds || bounds.length !== 2 || !map) return;
    
    // Wait for map to be fully initialized
    if (!map._loaded) {
      map.whenReady(() => {
        try {
          map.fitBounds(bounds, { padding: [50, 50] });
        } catch (error) {
          console.error('Error fitting bounds:', error);
        }
      });
    } else {
      try {
        map.fitBounds(bounds, { padding: [50, 50] });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }
  }, [bounds, map]);
  
  return null;
};

// Component to fetch and display route
const RoutePolyline = ({ start, end }) => {
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!start || !end) return;
      
      setLoading(true);
      try {
        // Using OSRM (Open Source Routing Machine) for routing
        const response = await axios.get(
          `https://router.project-osrm.org/route/v1/driving/${start[1]},${start[0]};${end[1]},${end[0]}?overview=full&geometries=geojson`,
          {
            withCredentials: false // Don't send credentials to external API
          }
        );
        
        if (response.data.code === 'Ok' && response.data.routes.length > 0) {
          const coordinates = response.data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
          setRouteCoordinates(coordinates);
        } else {
          // Fallback to straight line
          setRouteCoordinates([start, end]);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
        // Fallback to straight line
        setRouteCoordinates([start, end]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [start, end]);

  if (routeCoordinates.length === 0) return null;

  return (
    <Polyline
      positions={routeCoordinates}
      pathOptions={{
        color: '#14b8a6',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round'
      }}
    />
  );
};

const MapView = ({ 
  destinations = [], 
  onDestinationClick, 
  selectedDestination,
  navigationRoute = null,
  isNavigating = false,
  navigationDestination = null
}) => {
  const { userLocation } = useLocation();
  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [14.5995, 120.9842]; // Manila coordinates as default

  // Calculate bounds for navigation
  const getNavigationBounds = () => {
    if (!navigationRoute || !navigationRoute.start || !navigationRoute.end) return null;
    return [navigationRoute.start, navigationRoute.end];
  };

  return (
    <div className="relative w-full h-full" style={{ zIndex: 0 }}>
      <MapContainer
        center={mapCenter}
        zoom={isNavigating ? 14 : 13}
        className="w-full h-full rounded-2xl shadow-lg"
        zoomControl={true}
        style={{ zIndex: 0 }}
      >
        {/* Google Satellite imagery */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
          attribution='&copy; Google'
          maxZoom={20}
          minZoom={2}
        />
        {/* Road labels overlay */}
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
          attribution='&copy; Google'
          maxZoom={20}
          minZoom={2}
        />

        {!isNavigating && <RecenterMap center={mapCenter} />}
        {isNavigating && <FitBounds bounds={getNavigationBounds()} />}

        {/* User Location Marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.latitude, userLocation.longitude]} 
            icon={userIcon}
          >
            <Popup>
              <div className="text-center p-2">
                <p className="font-semibold text-teal-600">📍 You are here</p>
                <p className="text-xs text-slate-600 mt-1">
                  Accuracy: {Math.round(userLocation.accuracy)}m
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Navigation Route Line */}
        {isNavigating && navigationRoute && navigationRoute.start && navigationRoute.end && (
          <>
            <RoutePolyline 
              start={navigationRoute.start} 
              end={navigationRoute.end} 
            />
            {/* Destination marker with pulse effect */}
            {navigationDestination && (
              <Marker
                position={[navigationDestination.latitude, navigationDestination.longitude]}
                icon={createDestinationIcon(navigationDestination.category, navigationDestination.categoryIcon)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-bold text-slate-900 mb-1">🎯 {navigationDestination.name}</h3>
                    <p className="text-sm text-slate-600 mb-2">{navigationDestination.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-orange-600 font-semibold">
                        🪙 {navigationDestination.points} pts
                      </span>
                      <span className="text-teal-600 font-semibold">
                        🧭 Navigating...
                      </span>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}

        {/* Destination Markers (hide during navigation except the target) */}
        {!isNavigating && destinations.map((destination) => {
          const icon = createDestinationIcon(destination.category, destination.categoryIcon);
          
          return (
            <Marker
              key={destination.id}
              position={[destination.latitude, destination.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onDestinationClick && onDestinationClick(destination),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-slate-900 mb-1">{destination.title || destination.name}</h3>
                  <p className="text-sm text-slate-600 mb-2">{destination.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-orange-600 font-semibold">
                      🪙 {destination.points} pts
                    </span>
                    {destination.distance && (
                      <span className="text-teal-600 font-semibold">
                        📍 {destination.distance.toFixed(1)} km
                      </span>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Location Error Message */}
      {!userLocation && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-yellow-100 border border-yellow-300 rounded-lg px-4 py-2 shadow-lg z-[1000]">
          <p className="text-sm text-yellow-800">
            📍 Enable location to see your position and navigate
          </p>
        </div>
      )}

      {/* Navigation Mode Indicator */}
      {isNavigating && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-teal-500 text-white rounded-lg px-4 py-2 shadow-lg z-[1000] flex items-center gap-2">
          <svg className="w-5 h-5 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-semibold">
            Navigation Active
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
