import React from 'react';

// ⚡ ZERO-LAG: Pure component, instant render
const QuickStats = React.memo(({ stats }) => {
  const statsData = [
    { 
      label: 'Check-ins', 
      value: stats.totalVisits || 0, 
      color: 'emerald',
      gradient: 'from-emerald-500 to-teal-600'
    },
    { 
      label: 'Reviews Left', 
      value: stats.reviewsLeft || 0, 
      color: 'cyan',
      gradient: 'from-cyan-500 to-blue-600'
    },
    { 
      label: 'Achievements', 
      value: stats.badgesEarned || 0, 
      color: 'amber',
      gradient: 'from-amber-500 to-orange-600'
    },
    { 
      label: 'Current Streak', 
      value: `${stats.currentStreak || 0} days`, 
      color: 'orange',
      gradient: 'from-orange-500 to-rose-600'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-sm">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900">Quick Stats</h3>
      </div>

      <div className="space-y-3">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-emerald-200 transition-colors duration-75"
          >
            <span className="text-sm font-medium text-gray-700">{stat.label}</span>
            <span className={`px-3 py-1.5 bg-gradient-to-r ${stat.gradient} text-white rounded-full font-bold text-sm shadow-md`}>
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Only re-render if stats change
  return prevProps.stats.totalVisits === nextProps.stats.totalVisits &&
         prevProps.stats.reviewsLeft === nextProps.stats.reviewsLeft &&
         prevProps.stats.badgesEarned === nextProps.stats.badgesEarned &&
         prevProps.stats.currentStreak === nextProps.stats.currentStreak;
});

QuickStats.displayName = 'QuickStats';

export default QuickStats;
