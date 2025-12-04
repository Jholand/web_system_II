import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Award } from 'lucide-react';
import BadgeCard from './BadgeCard';

const BadgesSection = React.memo(({ badges }) => {
  const navigate = useNavigate();
  
  // Badges from React Query useUserBadges().earned are ALREADY earned!
  const earnedBadges = useMemo(() => 
    Array.isArray(badges) ? badges : [],
    [badges]
  );
  
  const displayBadges = useMemo(() => 
    earnedBadges.slice(0, 6),
    [earnedBadges]
  );
  
  const handleViewAll = useCallback(() => {
    navigate('/user/badges');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  return (
    <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-lg transition-shadow duration-150">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
            <Award className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Badges Earned</h3>
            <p className="text-xs text-gray-600">{earnedBadges.length} achievements unlocked</p>
          </div>
        </div>
        <button
          onClick={handleViewAll}
          className="flex items-center gap-1.5 px-3 py-1.5 text-emerald-600 hover:text-white hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600 font-semibold text-sm rounded-lg border border-emerald-200 hover:border-transparent transition-all duration-75 active:scale-95"
        >
          View All
          <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
        </button>
      </div>

      {earnedBadges.length > 0 ? (
        <div className="grid grid-cols-3 gap-3">
          {displayBadges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-gray-400" strokeWidth={2} />
          </div>
          <p className="text-sm font-medium text-gray-600 mb-1">No badges yet</p>
          <p className="text-xs text-gray-500">Start exploring destinations to earn achievements!</p>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.badges?.length === nextProps.badges?.length &&
         prevProps.badges?.filter(b => b.earned).length === nextProps.badges?.filter(b => b.earned).length;
});

BadgesSection.displayName = 'BadgesSection';

export default BadgesSection;
