import React from 'react';
import StatCard from '../dashboard/StatCard';

const QuickStats = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Quick Stats</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-slate-700">Check-ins</span>
          <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {stats.totalVisits}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-slate-700">Reviews Left</span>
          <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {stats.reviewsLeft}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-slate-700">Achievements</span>
          <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
            {stats.badgesEarned}
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-white rounded-lg">
          <span className="text-slate-700">Current Streak</span>
          <span className="px-3 py-1 bg-orange-500 text-white rounded-full font-bold text-sm">
            {stats.currentStreak} days
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuickStats;
