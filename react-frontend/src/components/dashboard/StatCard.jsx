import React from 'react';

const StatCard = ({ title, value, change, changeType, icon, iconBg }) => {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <div className="group h-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border border-white/50 hover:scale-105 hover:-translate-y-1">
      <div className="flex items-start justify-between h-full">
        <div className="flex-1">
          <h3 className="text-slate-600 text-sm font-normal mb-2 uppercase tracking-widest">{title}</h3>
          <p className="text-3xl font-light text-slate-900 mb-2">{value}</p>
          <div className="flex items-center gap-1">
            {isPositive && (
              <>
                <span className="text-emerald-600 font-normal">↑</span>
                <span className="text-emerald-600 text-sm font-light">{change}</span>
              </>
            )}
            {isNegative && (
              <>
                <span className="text-red-600 font-normal">↓</span>
                <span className="text-red-600 text-sm font-light">{change}</span>
              </>
            )}
          </div>
        </div>
        <div className={`${iconBg} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
