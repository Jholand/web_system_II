import React, { createContext, useContext, useState, useEffect } from 'react';

const LocationContext = createContext(null);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [watchId, setWatchId] = useState(null);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    
    const id = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
        setLocationError(null);
      },
      (error) => {
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location permissions.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
        }
        setLocationError(errorMessage);
        console.warn('Location error:', errorMessage);
        
        // Set a default location for development/testing (Manila, Philippines)
        if (!userLocation) {
          setUserLocation({
            latitude: 14.5995,
            longitude: 120.9842,
            accuracy: null,
          });
        }
      },
      {
        enableHighAccuracy: false, // Changed to false to avoid timeouts
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 300000, // Allow cached position up to 5 minutes
      }
    );

    setWatchId(id);
  };

  const stopTracking = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsTracking(false);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    // Haversine formula for calculating distance between two coordinates
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance; // Distance in kilometers
  };

  const getNearbyDestinations = (destinations, radiusKm = 10) => {
    if (!userLocation || !destinations) return [];

    return destinations
      .map((dest) => ({
        ...dest,
        distance: calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          dest.latitude,
          dest.longitude
        ),
      }))
      .filter((dest) => dest.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  };

  const value = {
    userLocation,
    locationError,
    isTracking,
    calculateDistance,
    getNearbyDestinations,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
