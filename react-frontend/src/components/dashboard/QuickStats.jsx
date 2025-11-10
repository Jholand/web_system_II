import React from 'react';

const QuickStatsCard = ({ title, value, bgColor, textColor }) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 flex-1 border-2 border-opacity-20`}>
      <h4 className={`text-sm font-bold mb-2 ${textColor} opacity-70 uppercase tracking-wide`}>{title}</h4>
      <p className={`text-4xl font-extrabold ${textColor}`}>{value}</p>
    </div>
  );
};

const QuickStats = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-slate-100">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">Quick Stats</h3>
        <p className="text-slate-500 text-sm font-medium">Today's activity summary</p>
      </div>

      <div className="flex gap-4">
        <QuickStatsCard
          title="Check-ins Today"
          value="342"
          bgColor="bg-emerald-50"
          textColor="text-emerald-600"
        />
        <QuickStatsCard
          title="New Badges Earned"
          value="128"
          bgColor="bg-purple-50"
          textColor="text-purple-600"
        />
        <QuickStatsCard
          title="Active Locations"
          value="45"
          bgColor="bg-orange-50"
          textColor="text-orange-600"
        />
      </div>
    </div>
  );
};

export default QuickStats;
