import React from 'react';

// ⚡ ZERO-LAG: Pure component, instant render
const QuickStats = React.memo(({ stats }) => {
  const statsData = [
    { 
      label: 'Check-ins', 
      value: stats.totalVisits || 0, 
      color: 'teal',
      gradient: 'from-teal-500 to-teal-600'
    },
    { 
      label: 'Reviews Left', 
      value: stats.reviewsLeft || 0, 
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600'
    },
    { 
      label: 'Achievements', 
      value: stats.badgesEarned || 0, 
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600'
    },
    { 
      label: 'Current Streak', 
      value: `${stats.currentStreak || 0} days`, 
      color: 'orange',
      gradient: 'from-orange-500 to-orange-600'
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-teal-200 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Quick Stats</h3>

      <div className="space-y-3">
        {statsData.map((stat, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-teal-200 transition-colors duration-75"
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
