import React from 'react';

const StatCard = ({ title, value, change, changeType, icon, iconBg }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-100">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-slate-600 text-sm font-semibold mb-2 uppercase tracking-wide">{title}</h3>
          <p className="text-3xl font-bold text-slate-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive && (
              <>
                <span className="text-emerald-600 font-semibold">↑</span>
                <span className="text-emerald-600 text-sm font-medium">{change}</span>
              </>
            )}
            {isNegative && (
              <>
                <span className="text-red-600 font-semibold">↓</span>
                <span className="text-red-600 text-sm font-medium">{change}</span>
              </>
            )}
          </div>
        </div>
        <div className={`${iconBg} p-3 rounded-lg shadow-sm`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
