import React, { useMemo } from 'react';
import { MapPin, Calendar, Coins } from 'lucide-react';

const AdventureTimeline = React.memo(({ visits, totalVisits }) => {
  const displayVisits = useMemo(() => visits.slice(0, 5), [visits]);
  
  const getCategoryIcon = (category) => {
    const icons = {
      beach: '🏖️',
      mountain: '⛰️',
      city: '🏙️',
      restaurant: '🍽️',
      park: '🌳',
      museum: '🏛️',
      default: '📍'
    };
    return icons[category?.toLowerCase()] || icons.default;
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-teal-100 shadow-sm hover:shadow-lg transition-shadow duration-150">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-md shadow-teal-500/30">
            <MapPin className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Adventure Timeline</h3>
            <p className="text-xs text-gray-600">{totalVisits.toLocaleString()} destinations visited</p>
          </div>
        </div>
      </div>

      {displayVisits.length > 0 ? (
        <div className="space-y-3 relative before:absolute before:left-[22px] before:top-8 before:bottom-8 before:w-0.5 before:bg-gradient-to-b before:from-teal-200 before:via-teal-300 before:to-transparent">
          {displayVisits.map((visit, index) => {
            // Handle both string and object destination formats
            const destinationName = typeof visit.location === 'string' ? visit.location : visit.destination?.name || 'Unknown';
            const destinationCategory = visit.destination?.category || 'destination';
            
            return (
            <div key={visit.id} className="group relative flex items-start gap-4 p-3 rounded-xl hover:bg-teal-50/50 transition-colors duration-75">
              <div className="relative z-10 flex-shrink-0">
                <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-teal-500/30 group-hover:shadow-teal-500/50 group-hover:scale-110 transition-all duration-75">
                  <span className="text-sm">{getCategoryIcon(destinationCategory)}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm ring-1 ring-teal-100">
                  <span className="text-[10px] font-bold text-teal-600">{index + 1}</span>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 mb-1 truncate group-hover:text-teal-600 transition-colors duration-75">
                  {destinationName}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium capitalize">
                    {destinationCategory}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" strokeWidth={2} />
                    {visit.time || visit.createdAt}
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <div className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg shadow-sm">
                  <Coins className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                  <span className="text-sm font-bold text-white">+{visit.points || 0}</span>
                </div>
              </div>
            </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No visits yet</p>
          <p className="text-xs text-gray-500">Start your adventure by checking in to destinations!</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.visits?.length === nextProps.visits?.length &&
         prevProps.totalVisits === nextProps.totalVisits &&
         prevProps.visits?.[0]?.id === nextProps.visits?.[0]?.id;
});

AdventureTimeline.displayName = 'AdventureTimeline';

export default AdventureTimeline;
