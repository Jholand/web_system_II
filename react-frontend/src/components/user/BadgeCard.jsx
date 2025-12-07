import React, { useMemo } from 'react';
import { Star, Calendar } from 'lucide-react';

const BadgeCard = React.memo(({ badge }) => {
  const badgeData = useMemo(() => badge?.badge || badge, [badge]);
  const earnedAt = useMemo(() => badge?.earned_at || badge?.earnedAt, [badge]);
  
  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'from-yellow-400 via-orange-500 to-red-600';
      case 'epic': return 'from-purple-500 via-pink-500 to-purple-600';
      case 'rare': return 'from-blue-500 to-cyan-600';
      case 'common': default: return 'from-teal-500 to-cyan-600';
    }
  };
  
  const getRarityBorder = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': return 'border-yellow-400';
      case 'epic': return 'border-purple-400';
      case 'rare': return 'border-blue-400';
      case 'common': default: return 'border-teal-300';
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className={`group relative bg-white rounded-xl p-3 border-2 ${getRarityBorder(badgeData?.rarity)} shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-1 overflow-hidden`}>
      {/* Rarity gradient top bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(badgeData?.rarity)}`} />
      
      {/* Earned star indicator */}
      <div className="absolute top-2 right-2 p-1 bg-teal-500/90 backdrop-blur-sm rounded-full">
        <Star className="w-3 h-3 fill-white text-white" strokeWidth={2} />
      </div>
      
      {/* Badge icon */}
      <div className="flex items-center justify-center mb-2">
        {badgeData?.icon_url ? (
          badgeData.icon_url.startsWith('http') ? (
            <div className="relative w-12 h-12 flex items-center justify-center">
              <img 
                src={badgeData.icon_url.startsWith('badges/') 
                  ? `${window.location.protocol}//${window.location.hostname}:8000/storage/${badgeData.icon_url}`
                  : badgeData.icon_url
                } 
                alt={badgeData.name} 
                className="w-12 h-12 object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden w-12 h-12 items-center justify-center text-3xl">
                {badgeData.icon || '🏆'}
              </div>
            </div>
          ) : (
            <span className="text-3xl">{badgeData.icon_url}</span>
          )
        ) : (
          <span className="text-3xl">{badgeData?.icon || '🏆'}</span>
        )}
      </div>
      
      {/* Badge name */}
      <h4 className="font-bold text-gray-900 text-xs mb-1 text-center line-clamp-1" title={badgeData?.name}>
        {badgeData?.name || 'Badge'}
      </h4>
      
      {/* Badge description */}
      <p className="text-[10px] text-gray-600 mb-2 text-center line-clamp-2 min-h-[24px]" title={badgeData?.description}>
        {badgeData?.description || 'Achievement unlocked!'}
      </p>
      
      {/* Earned date */}
      {earnedAt && (
        <div className="flex items-center justify-center gap-1 text-[10px] text-emerald-600 font-medium">
          <Calendar className="w-2.5 h-2.5" strokeWidth={2} />
          <span>{formatDate(earnedAt)}</span>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  const prevBadge = prevProps.badge?.badge || prevProps.badge;
  const nextBadge = nextProps.badge?.badge || nextProps.badge;
  return prevBadge?.id === nextBadge?.id && 
         prevBadge?.name === nextBadge?.name;
});

BadgeCard.displayName = 'BadgeCard';

export default BadgeCard;
