import React from 'react';

/**
 * Unified Stats Card Component
 * Consistent stats display across all pages
 */
const StatsCard = React.memo(({ 
  icon: Icon, 
  label, 
  value, 
  gradient = 'from-emerald-500 to-teal-600',
  iconBg = 'bg-emerald-500/10',
  iconColor = 'text-emerald-600',
  trend,
  subtitle
}) => {
  return (
    <div className="group bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110`}>
          {Icon && <Icon className={`w-6 h-6 ${iconColor}`} strokeWidth={2.5} />}
        </div>
        {trend && (
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trend > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
          {value?.toLocaleString() || 0}
        </p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
});

StatsCard.displayName = 'StatsCard';

export default StatsCard;
