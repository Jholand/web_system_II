import React, { useMemo } from 'react';
import { Target } from 'lucide-react';

const MilestoneCard = React.memo(({ milestone }) => {
  const progress = useMemo(() => 
    Math.min(100, (milestone.current / milestone.total) * 100),
    [milestone.current, milestone.total]
  );
  
  const remaining = useMemo(() => 
    Math.max(0, milestone.total - milestone.current),
    [milestone.total, milestone.current]
  );

  return (
    <div className="group bg-white rounded-2xl p-6 border border-teal-200 shadow-sm hover:shadow-md transition-all duration-200">
      <h3 className="text-lg font-bold text-gray-900 mb-5">Next Milestone</h3>

      <div className="text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow duration-150">
            <span className="text-4xl drop-shadow-lg">{milestone.icon}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
            <span className="text-xs font-bold text-white">{milestone.current}</span>
          </div>
        </div>
        
        <h4 className="font-bold text-gray-900 mb-1 text-lg">{milestone.name}</h4>
        <p className="text-sm text-gray-600 mb-5">{milestone.description}</p>

        <div className="mb-3">
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 rounded-full transition-all duration-300 ease-out shadow-sm"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-gray-700">
            <span className="text-purple-600">{milestone.current}</span>/{milestone.total} visited
          </span>
          <span className="text-xs font-semibold px-2.5 py-1 bg-purple-100 text-purple-700 rounded-full">
            {remaining} to go
          </span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.milestone?.current === nextProps.milestone?.current &&
         prevProps.milestone?.total === nextProps.milestone?.total &&
         prevProps.milestone?.name === nextProps.milestone?.name;
});

MilestoneCard.displayName = 'MilestoneCard';

export default MilestoneCard;
