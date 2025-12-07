import React from 'react';

// ⚡ ZERO-LAG: Pure component, no animations, instant render
const ProfileCard = React.memo(({ userName, memberSince, totalPoints }) => {
  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 border border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {userName}
          </h3>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">Member since {memberSince}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl sm:text-4xl font-bold text-gray-900">
            {totalPoints?.toLocaleString() || 0}
          </div>
          <div className="text-sm text-gray-500 font-medium">Total Points</div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if actual data changes
  return prevProps.totalPoints === nextProps.totalPoints &&
         prevProps.userName === nextProps.userName;
});

ProfileCard.displayName = 'ProfileCard';

export default ProfileCard;
