import React, { useState } from 'react';
import { MapPin, Users, Eye, Edit, Trash2, User } from 'lucide-react';

const DestinationCard = ({ 
  title, 
  category, 
  categoryColor, 
  categoryIcon,
  categoryIconUrl,
  description, 
  points, 
  location,
  street,
  barangay, 
  rating,
  image_url,
  latitude,
  longitude,
  visitors,
  ownerName,
  onView,
  onEdit,
  onDelete 
}) => {
  const [imageError, setImageError] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('loading'); // loading, success, error
  
  // Get user's location with timeout
  React.useEffect(() => {
    // Check if location is already cached in sessionStorage
    const cachedLocation = sessionStorage.getItem('userLocation');
    if (cachedLocation) {
      const parsed = JSON.parse(cachedLocation);
      setUserLocation(parsed);
      setLocationStatus('success');
      return;
    }

    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    // Set timeout for 3 seconds
    const timeoutId = setTimeout(() => {
      if (!userLocation) {
        setLocationStatus('error');
      }
    }, 3000);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setUserLocation(location);
        setLocationStatus('success');
        // Cache location in sessionStorage for 5 minutes
        sessionStorage.setItem('userLocation', JSON.stringify(location));
        clearTimeout(timeoutId);
      },
      () => {
        setLocationStatus('error');
        clearTimeout(timeoutId);
      },
      { timeout: 3000, maximumAge: 300000 } // 3 second timeout, 5 min cache
    );

    return () => clearTimeout(timeoutId);
  }, []);
  
  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };
  
  const deg2rad = (deg) => deg * (Math.PI/180);
  
  // Get distance text
  const getDistance = () => {
    if (locationStatus === 'error' || !latitude || !longitude) {
      return 'Distance N/A';
    }
    if (locationStatus === 'loading' || !userLocation) {
      return 'Calculating...';
    }
    const distance = calculateDistance(userLocation.lat, userLocation.lng, latitude, longitude);
    return `${distance.toFixed(1)}km away`;
  };
  
  // Get image URL - use database image or default
  const getImageUrl = () => {
    if (imageError || !image_url) {
      return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
    }
    // If image_url starts with http, use it directly, otherwise prepend base URL
    if (image_url.startsWith('http')) {
      return image_url;
    }
    // For local images from storage
    const baseUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`;
    return `${baseUrl}/storage/${image_url}`;
  };

  return (
    <div className="group bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl overflow-hidden shadow-[0_8px_20px_rgba(20,184,166,0.15)] hover:shadow-2xl transition-all duration-300 border-2 border-teal-200 hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 hover:scale-[1.02] flex flex-col h-full">
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-slate-100 flex-shrink-0">
        <img 
          src={getImageUrl()}
          alt={title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Points Badge */}
        <div className="absolute top-3 right-3 bg-gradient-to-br from-teal-500 to-cyan-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold shadow-lg">
          +{points} pts
        </div>

        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700 shadow-md flex items-center gap-1.5">
          {categoryIconUrl ? (
            <img src={categoryIconUrl} alt={category} className="w-4 h-4 rounded object-cover" />
          ) : (
            <span>{categoryIcon}</span>
          )}
          <span>{category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3 flex flex-col flex-grow">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
          {title}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0" />
          <span className="line-clamp-1">{location}</span>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users className="w-4 h-4 text-teal-600" />
              <span>{(visitors || 0).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span className="text-amber-500">📍</span>
              <span>{getDistance()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-medium text-slate-600">Owner:</span>
            {ownerName ? (
              <span className="line-clamp-1">{ownerName}</span>
            ) : (
              <span className="text-slate-400 italic">No owner</span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 mt-auto">
          <button
            onClick={onView}
            className="flex-1 bg-gray-900 hover:bg-teal-600 text-white py-2.5 rounded-lg transition-colors font-medium text-sm flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View
          </button>
          <button
            onClick={onEdit}
            className="p-2.5 bg-gray-100 hover:bg-teal-100 text-gray-700 hover:text-teal-600 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2.5 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-600 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DestinationCard;
