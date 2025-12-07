import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const SavedDestinations = React.memo(() => {
  const navigate = useNavigate();
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedDestinations();
  }, []);

  const fetchSavedDestinations = async () => {
    try {
      const response = await api.request('/user/saved-destinations');
      if (response && response.success && response.data) {
        setSavedDestinations(response.data.slice(0, 5)); // Show top 5
      }
    } catch (error) {
      console.error('Error fetching saved destinations:', error);
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
        // Remove from list
        setSavedDestinations(prev => prev.filter(d => d.id !== destinationId));
      }
    } catch (error) {
      console.error('Error removing saved destination:', error);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Saved Destinations</h3>
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

  if (savedDestinations.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-5">Saved Destinations</h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">💾</div>
          <p className="text-sm text-slate-600 mb-1">No saved destinations yet</p>
          <p className="text-xs text-slate-500">Save destinations to visit them later</p>
          <button
            onClick={() => navigate('/user/explore')}
            className="mt-4 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
          >
            Explore Destinations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-gray-900">Saved Destinations</h3>
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
        {savedDestinations.map((destination) => (
          <div
            key={destination.id}
            onClick={() => handleViewDestination(destination)}
            className="group relative flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 hover:border-purple-300 hover:shadow-md transition-all duration-200 cursor-pointer"
          >
            {/* Category Icon */}
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform">
              {destination.category_icon || '📍'}
            </div>

            {/* Destination Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-slate-900 truncate group-hover:text-purple-600 transition-colors">
                {destination.name}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                  {destination.category_icon} {destination.category_name}
                </span>
                {destination.city && (
                  <span className="text-xs text-slate-600 truncate">
                    {destination.city}
                  </span>
                )}
              </div>
            </div>

            {/* Unsave Button */}
            <button
              onClick={(e) => handleUnsave(e, destination.id)}
              className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Remove from saved"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </button>

            {/* Points Badge */}
            <div className="flex-shrink-0">
              <div className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-bold text-sm shadow-md">
                +{destination.points_reward || 0} pts
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

SavedDestinations.displayName = 'SavedDestinations';

export default SavedDestinations;
