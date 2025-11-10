import React from 'react';

const RewardCard = ({ 
  title, 
  subtitle,
  pointsRequired,
  partner,
  stockRemaining,
  totalClaimed,
  onView,
  onEdit,
  onDelete 
}) => {
  // Calculate stock percentage
  const stockPercentage = Math.round((totalClaimed / (stockRemaining + totalClaimed)) * 100);

  return (
    <div className="group bg-white rounded-lg shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all relative">
      {/* Hover Actions - Top Right */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onView}
          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-md"
          title="View"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
        <button
          onClick={onEdit}
          className="p-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-md"
          title="Edit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
        <button
          onClick={onDelete}
          className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
          title="Delete"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-slate-900 mb-1">{title}</h3>
      
      {/* Subtitle */}
      <p className="text-slate-500 text-sm mb-4 font-medium">{subtitle}</p>

      {/* Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm font-medium">Points Required:</span>
          <span className="text-orange-600 text-lg font-bold">{pointsRequired}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm font-medium">Partner:</span>
          <span className="text-slate-900 text-sm font-bold">{partner}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm font-medium">Stock Remaining:</span>
          <span className="text-slate-900 text-sm font-bold">{stockRemaining}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-600 text-sm font-medium">Total Claimed:</span>
          <span className="text-emerald-600 text-sm font-bold">{totalClaimed}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-orange-500 h-2.5 rounded-full transition-all"
            style={{ width: `${stockPercentage}%` }}
          ></div>
        </div>
        <p className="text-slate-500 text-xs mt-1 font-medium">Stock: {stockPercentage}%</p>
      </div>
    </div>
  );
};

export default RewardCard;
