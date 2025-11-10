import React from 'react';

const MilestoneCard = ({ milestone }) => {
  const progress = (milestone.current / milestone.total) * 100;

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
      <div className="flex items-center gap-2 mb-4">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
        <h3 className="text-lg font-bold text-slate-900">Next Milestone</h3>
      </div>

      <div className="text-center mb-4">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-3xl">{milestone.icon}</span>
        </div>
        <h4 className="font-bold text-slate-900 mb-1">{milestone.name}</h4>
        <p className="text-sm text-slate-600 mb-4">{milestone.description}</p>

        <div className="mb-2">
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        <p className="text-sm font-medium text-slate-700">{milestone.current}/{milestone.total} visited</p>
        <p className="text-xs text-purple-600 font-medium mt-1">{milestone.remaining} more to go</p>
      </div>
    </div>
  );
};

export default MilestoneCard;
