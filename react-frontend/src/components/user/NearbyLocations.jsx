import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/api';

const NearbyLocations = React.memo(() => {
  const navigate = useNavigate();
  const { userLocation, calculateDistance } = useLocation();
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyDestinations();
  }, [userLocation]);

  const fetchNearbyDestinations = async () => {
    try {
      const response = await api.request('/destinations');
      if (response && response.success && response.data) {
        const destinations = response.data;
        
        if (userLocation) {
          // Calculate distance for each destination
          const withDistance = destinations.map(dest => ({
            ...dest,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              dest.latitude,
              dest.longitude
            )
          }));

          // Filter nearby (within 50km) and sort by distance
          const nearby = withDistance
            .filter(dest => dest.distance <= 50)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5); // Show top 5 nearest

          setNearbyDestinations(nearby);
        } else {
          // If no location, just show first 5
          setNearbyDestinations(destinations.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching nearby destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDestination = (destination) => {
    navigate('/user/explore', { state: { selectedDestination: destination } });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Nearby Destinations</h3>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (nearbyDestinations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Nearby Destinations</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📍</div>
          <p className="text-sm text-slate-600">No nearby destinations found</p>
          <button
            onClick={() => navigate('/user/explore')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            Explore Map
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">Nearby Destinations</h3>
        <button
          onClick={() => navigate('/user/explore')}
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          View All
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="space-y-3">
        {nearbyDestinations.map((destination) => (
          <div
            key={destination.id}
            onClick={() => handleViewDestination(destination)}
            className="group flex items-center gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Category Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
              {destination.category_icon || '📍'}
            </div>

            {/* Destination Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-teal-600 transition-colors">
                {destination.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                  {destination.category_icon} {destination.category_name}
                </span>
                {destination.distance && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {destination.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </div>

            {/* Points Badge */}
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full font-bold text-sm shadow-md">
                +{destination.points_reward || 0} pts
              </div>
            </div>
          </div>
        ))}
      </div>

      {!userLocation && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Enable location to see distances
          </p>
        </div>
      )}
    </div>
  );
});

NearbyLocations.displayName = 'NearbyLocations';

export default NearbyLocations;
