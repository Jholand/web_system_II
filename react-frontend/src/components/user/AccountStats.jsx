import React, { useMemo } from 'react';
import { MapPin, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSavedLocations } from '../../hooks/useUserData';

const AccountStats = React.memo(({ stats }) => {
  const navigate = useNavigate();
  
  // ⚡ REACT QUERY - INSTANT from cache
  const { data: savedLocations = [] } = useSavedLocations();

  const handleViewAll = () => {
    navigate('/user/map');
  };

  const getCategoryIcon = (category) => {
    switch(category?.toLowerCase()) {
      case 'hotel': return '🏨';
      case 'agri farm': return '🌾';
      case 'tourist spot': return '🏔️';
      default: return '📍';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Saved Locations</h3>
          <p className="text-sm text-gray-500">{savedLocations.length} saved</p>
        </div>
        {savedLocations.length > 0 && (
          <button
            onClick={handleViewAll}
            className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-75"
          >
            View All
          </button>
        )}
      </div>

      {savedLocations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-6 h-6 text-orange-400" />
          </div>
          <p className="text-sm text-gray-600 font-medium mb-1">No saved locations yet</p>
          <p className="text-xs text-gray-400">Explore and save your favorites</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-hide">
          {savedLocations.slice(0, 5).map((location) => (
            <div
              key={location.id}
              onClick={handleViewAll}
              className="group flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-teal-50 border border-transparent hover:border-teal-200 cursor-pointer transition-all duration-75"
            >
              <div className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform duration-75">
                {getCategoryIcon(location.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-teal-600 transition-colors duration-75">
                  {location.name}
                </h4>
                <p className="text-xs text-gray-500 truncate">{location.category}</p>
              </div>
              {location.points && (
                <span className="text-xs font-bold text-blue-600 flex-shrink-0">
                  ⭐ {location.points}
                </span>
              )}
            </div>
          ))}
          {savedLocations.length > 5 && (
            <button
              onClick={handleViewAll}
              className="w-full py-2 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors duration-75"
            >
              +{savedLocations.length - 5} more
            </button>
          )}
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return true; // Only re-render when savedLocations state changes internally
});

AccountStats.displayName = 'AccountStats';

export default AccountStats;
