import React from 'react';
import { Hotel, Wheat, Mountain, MapPin } from 'lucide-react';

const SavedLocations = ({ locations, calculateDistance, userLocation, onLocationClick, savedDestinationIds, onToggleSave }) => {
  const getCategoryIcon = (category) => {
    const iconProps = { className: "w-5 h-5", strokeWidth: 2 };
    switch(category?.toLowerCase()) {
      case 'hotel': return <Hotel {...iconProps} />;
      case 'agri farm': return <Wheat {...iconProps} />;
      case 'tourist spot': return <Mountain {...iconProps} />;
      default: return <MapPin {...iconProps} />;
    }
  };

  const getCategoryColor = (category) => {
    switch(category?.toLowerCase()) {
      case 'hotel': return 'bg-purple-500';
      case 'agri farm': return 'bg-green-500';
      case 'tourist spot': return 'bg-blue-500';
      default: return 'bg-teal-500';
    }
  };

  return (
    <div className="bg-white rounded-2xl border max-h-[calc(100vh-200px)] flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 flex-shrink-0">
        <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
        <h3 className="font-semibold text-slate-900">Saved Locations</h3>
        <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold ml-auto">
          {locations.length}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 scrollbar-hide">
        {locations.length > 0 ? (
          <div className="space-y-2 p-4">
            {locations.map((location) => (
              <div
                key={location.id}
                className="relative flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-pink-50 hover:border-pink-200 border border-transparent cursor-pointer transition-all group"
              >
                {/* Heart button for unsaving */}
                {onToggleSave && (
                  <button
                    onClick={(e) => onToggleSave(location.id, e)}
                    className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all z-10"
                  >
                    <svg
                      className="w-4 h-4 fill-red-500 text-red-500 transition-all hover:scale-110"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                    </svg>
                  </button>
                )}
                <div
                  onClick={() => onLocationClick(location)}
                  className="flex items-start gap-3 flex-1"
                >
                  <div className={`w-10 h-10 ${getCategoryColor(location.category)} rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform`}>
                    {getCategoryIcon(location.category)}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-pink-600 transition-colors">
                      {location.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">{location.categoryName || location.category}</p>
                    {userLocation && location.latitude && location.longitude && (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-purple-600 font-bold">
                          {calculateDistance(
                            userLocation.latitude,
                            userLocation.longitude,
                            location.latitude,
                            location.longitude
                          ).toFixed(1)} km away
                        </span>
                        {location.points && (
                          <span className="text-xs text-teal-600 font-semibold">
                            🪙 {location.points} pts
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-sm font-medium text-slate-500">No saved locations yet</p>
            <p className="text-xs text-slate-400 mt-1">Tap the heart icon on any destination to save it</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedLocations;
