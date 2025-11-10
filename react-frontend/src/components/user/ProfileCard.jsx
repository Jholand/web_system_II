import React from 'react';

const ProfileCard = ({ userName, userLevel, memberSince, totalPoints, progress, pointsToNext }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border border-emerald-200">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">{userName}</h3>
          <span className="inline-block px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full">
            {userLevel}
          </span>
          <p className="text-slate-600 mt-2">Member since {memberSince}</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-bold text-orange-500 mb-1">{totalPoints}</p>
          <p className="text-slate-600 text-sm">Total Points</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-slate-700">Progress to Next Level</p>
          <p className="text-sm font-bold text-slate-900">{progress}%</p>
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-xs text-slate-600 mt-1">{pointsToNext} points to next level</p>
      </div>
    </div>
  );
};

export default ProfileCard;
