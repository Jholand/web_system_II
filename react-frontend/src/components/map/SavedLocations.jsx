import React from 'react';
import { Hotel, Wheat, Mountain, MapPin } from 'lucide-react';

const SavedLocations = ({ locations, calculateDistance, userLocation, onLocationClick }) => {
  const getCategoryIcon = (category) => {
    const iconProps = { className: "w-5 h-5", strokeWidth: 2 };
    switch(category) {
      case 'hotel': return <Hotel {...iconProps} />;
      case 'agri farm': return <Wheat {...iconProps} />;
      case 'tourist spot': return <Mountain {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Saved Locations ({locations.length})</h3>
      </div>

      <div className="space-y-3">
        {locations.map((location) => (
          <button
            key={location.id}
            onClick={() => onLocationClick(location)}
            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
          >
            <div className="text-teal-600">
              {getCategoryIcon(location.category)}
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-slate-900 text-sm">{location.name}</h4>
              <p className="text-xs text-slate-600">
                {userLocation && calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  location.latitude,
                  location.longitude
                ).toFixed(1)} km away
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SavedLocations;
