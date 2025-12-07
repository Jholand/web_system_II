import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from '../../contexts/LocationContext';
import api from '../../services/api';

const DestinationsTabs = React.memo(() => {
  const navigate = useNavigate();
  const { userLocation, calculateDistance } = useLocation();
  const [activeTab, setActiveTab] = useState('saved'); // 'saved' or 'nearby'
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinations();
  }, [userLocation]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      
      // Fetch saved destinations
      const savedResponse = await api.request('/user/saved-destinations');
      if (savedResponse && savedResponse.success && savedResponse.data) {
        setSavedDestinations(savedResponse.data.slice(0, 5));
      }

      // Fetch all destinations for nearby
      const allResponse = await api.request('/destinations');
      if (allResponse && allResponse.success && allResponse.data) {
        const destinations = allResponse.data;
        
        if (userLocation) {
          const withDistance = destinations.map(dest => ({
            ...dest,
            distance: calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              dest.latitude,
              dest.longitude
            )
          }));

          const nearby = withDistance
            .filter(dest => dest.distance <= 50)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 5);

          setNearbyDestinations(nearby);
        } else {
          setNearbyDestinations(destinations.slice(0, 5));
        }
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDestination = (destination) => {
    navigate('/user/explore', { state: { selectedDestination: destination } });
  };

  const handleUnsave = async (e, destinationId) => {
    e.stopPropagation();
    try {
      const response = await api.request('/user/saved-destinations/toggle', {
        method: 'POST',
        body: JSON.stringify({ destination_id: destinationId }),
      });

      if (response && response.success) {
        setSavedDestinations(prev => prev.filter(d => d.id !== destinationId));
      }
    } catch (error) {
      console.error('Error removing saved destination:', error);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          ))}
        </div>
      );
    }

    const destinations = activeTab === 'saved' ? savedDestinations : nearbyDestinations;

    if (destinations.length === 0) {
      return (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">
            {activeTab === 'saved' ? '💾' : '📍'}
          </div>
          <p className="text-sm text-slate-600 mb-1">
            {activeTab === 'saved' 
              ? 'No saved destinations yet' 
              : 'No nearby destinations found'}
          </p>
          <p className="text-xs text-slate-500">
            {activeTab === 'saved'
              ? 'Save destinations to visit them later'
              : 'Enable location to see nearby destinations'}
          </p>
          <button
            onClick={() => navigate('/user/explore')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            Explore Destinations
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {destinations.map((destination) => (
          <div
            key={destination.id}
            onClick={() => handleViewDestination(destination)}
            className={`group relative flex items-center gap-3 p-3 rounded-xl border hover:shadow-md transition-all duration-200 cursor-pointer ${
              activeTab === 'saved'
                ? 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 hover:border-purple-300'
                : 'bg-gradient-to-r from-gray-50 to-white border-gray-100 hover:border-teal-200'
            }`}
          >
            {/* Category Icon */}
            <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform ${
              activeTab === 'saved'
                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                : 'bg-gradient-to-br from-teal-500 to-cyan-600'
            }`}>
              {destination.category_icon || '📍'}
            </div>

            {/* Destination Info */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-bold truncate transition-colors ${
                activeTab === 'saved'
                  ? 'text-slate-900 group-hover:text-purple-600'
                  : 'text-slate-900 group-hover:text-teal-600'
              }`}>
                {destination.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                  activeTab === 'saved'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-teal-100 text-teal-700'
                }`}>
                  {destination.category_icon} {destination.category_name}
                </span>
                {destination.distance !== null && destination.distance !== undefined && (
                  <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {destination.distance.toFixed(1)} km
                  </span>
                )}
              </div>
            </div>

            {/* Action Button */}
            {activeTab === 'saved' && (
              <button
                onClick={(e) => handleUnsave(e, destination.id)}
                className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from saved"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            )}

            {/* Points Badge */}
            <div className="flex-shrink-0">
              <div className={`px-3 py-1.5 text-white rounded-full font-bold text-sm shadow-md ${
                activeTab === 'saved'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-600'
              }`}>
                +{destination.points_reward || 0} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
      {/* Tab Navigation */}
      <div className="flex items-center gap-2 mb-5">
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'saved'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span className="text-sm">Saved</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'saved' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
          }`}>
            {savedDestinations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('nearby')}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
            activeTab === 'nearby'
              ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <span className="text-sm">Nearby</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'nearby' ? 'bg-white/20' : 'bg-slate-200 text-slate-700'
          }`}>
            {nearbyDestinations.length}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      {renderContent()}

      {/* Location Notice */}
      {activeTab === 'nearby' && !userLocation && nearbyDestinations.length > 0 && (
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

DestinationsTabs.displayName = 'DestinationsTabs';

export default DestinationsTabs;
