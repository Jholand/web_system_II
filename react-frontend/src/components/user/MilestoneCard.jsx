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
    <div className="group bg-white rounded-2xl p-6 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all duration-150">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
          <Target className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Next Milestone</h3>
      </div>

      <div className="text-center">
        <div className="relative inline-block mb-3">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-shadow duration-150">
            <span className="text-4xl drop-shadow-lg">{milestone.icon}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
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
