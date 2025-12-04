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
    // Set default location IMMEDIATELY so map loads
    setUserLocation({
      latitude: 12.7426,
      longitude: 121.4900,
      accuracy: 5000, // 5km accuracy for fallback
      isDefault: true,
    });
    
    // Try to get real location in background
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
          isDefault: false,
        });
        setLocationError(null);
      },
      (error) => {
        let errorMessage = '';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Using default location.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location unavailable. Using default location.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location timeout. Using default location.';
            break;
          default:
            errorMessage = 'Location error. Using default location.';
        }
        setLocationError(errorMessage);
        console.log('Location error:', errorMessage);
        // Keep the default location set in useEffect
      },
      {
        enableHighAccuracy: false, // Use WiFi/network for laptops (faster)
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000, // Use cached position up to 5 minutes old
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

  const refreshLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          setUserLocation(newLocation);
          setLocationError(null);
          resolve(newLocation);
        },
        (error) => {
          let errorMessage = '';
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Location error';
          }
          setLocationError(errorMessage);
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 30000, // 30s for manual refresh
          maximumAge: 0, // Force fresh location
        }
      );
    });
  };

  const value = {
    userLocation,
    locationError,
    isTracking,
    calculateDistance,
    getNearbyDestinations,
    refreshLocation,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
