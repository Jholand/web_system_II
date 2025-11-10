import React from 'react';

const AccountStats = ({ stats }) => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Account Stats</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-700 text-sm">Member for</span>
          <span className="font-bold text-slate-900">{stats.memberMonths} months</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-700 text-sm">Avg points/week</span>
          <span className="font-bold text-slate-900">{stats.avgPointsWeek}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-700 text-sm">Total Reviews</span>
          <span className="font-bold text-slate-900">{stats.totalReviews}</span>
        </div>
      </div>
    </div>
  );
};

export default AccountStats;
