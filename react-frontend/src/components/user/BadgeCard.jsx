import React from 'react';

const BadgeCard = ({ badge }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 text-center border border-purple-200">
      <div className="text-4xl mb-2">{badge.icon}</div>
      <h4 className="font-bold text-slate-900 text-sm mb-1">{badge.name}</h4>
      <p className="text-xs text-slate-600 mb-2">{badge.description}</p>
      <p className="text-xs text-purple-600 font-medium">{badge.earnedAt}</p>
    </div>
  );
};

export default BadgeCard;
