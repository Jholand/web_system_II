import React, { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useLocation } from '../../contexts/LocationContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
const destinationIcons = {
  hotel: new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="#3b82f6"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#3b82f6">H</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
  'agri farm': new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="#22c55e"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#22c55e">F</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
  'tourist spot': new L.Icon({
    iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
        <path d="M16 0c-8.837 0-16 7.163-16 16 0 16 16 24 16 24s16-8 16-24c0-8.837-7.163-16-16-16z" fill="#a855f7"/>
        <circle cx="16" cy="16" r="8" fill="#fff"/>
        <text x="16" y="21" text-anchor="middle" font-size="16" fill="#a855f7">T</text>
      </svg>
    `),
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  }),
};

// Component to recenter map when user location changes
const RecenterMap = ({ center }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
  }, [center, map]);
  
  return null;
};

const MapView = ({ destinations = [], onDestinationClick, selectedDestination }) => {
  const { userLocation } = useLocation();
  const mapCenter = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : [14.5995, 120.9842]; // Manila coordinates as default

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="w-full h-full rounded-2xl shadow-lg"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

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

        {/* Destination Markers */}
        {destinations.map((destination) => {
          const icon = destinationIcons[destination.category] || destinationIcons['tourist spot'];
          
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
                  <h3 className="font-bold text-slate-900 mb-1">{destination.title}</h3>
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
            📍 Enable location to see your position
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
