import React from 'react';
import BadgeCard from './BadgeCard';

const BadgesSection = ({ badges }) => {
  const earnedBadges = badges.filter(b => b.earned);

  return (
    <div className="bg-white rounded-2xl p-6 border">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">🏅</span>
        <h3 className="text-xl font-bold text-slate-900">Badges Earned</h3>
      </div>
      <p className="text-slate-600 mb-6">{earnedBadges.length} achievements unlocked</p>

      <div className="grid grid-cols-3 gap-4">
        {earnedBadges.map((badge) => (
          <BadgeCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  );
};

export default BadgesSection;
