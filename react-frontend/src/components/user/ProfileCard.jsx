import React from 'react';

// ⚡ ZERO-LAG: Pure component, no animations, instant render
const ProfileCard = React.memo(({ userName, userLevel, memberSince, totalPoints, progress, pointsToNext }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-emerald-100 shadow-sm hover:shadow-md transition-shadow duration-150">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex-1">
          <h3 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            {userName}
          </h3>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-full shadow-md shadow-emerald-500/30">
              {userLevel}
            </span>
            <p className="text-sm text-gray-600">Since {memberSince}</p>
          </div>
        </div>
        
        <div className="flex flex-col items-end bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl px-6 py-4 border border-orange-200">
          <p className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-orange-500 to-amber-600 bg-clip-text text-transparent">
            {totalPoints?.toLocaleString() || 0}
          </p>
          <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
            <span className="text-lg">🪙</span>
            Total Points
          </p>
        </div>
      </div>

      {/* Progress Bar - Instant Update */}
      <div className="mt-6 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-gray-700">Progress to Next Level</p>
          <p className="text-lg font-bold text-emerald-600">{progress}%</p>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-full transition-all duration-150 shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2 font-medium">
          {pointsToNext?.toLocaleString()} points to level up
        </p>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if actual data changes
  return prevProps.totalPoints === nextProps.totalPoints &&
         prevProps.progress === nextProps.progress;
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;
