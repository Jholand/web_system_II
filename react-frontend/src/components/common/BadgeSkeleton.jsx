import React from 'react';

export const BadgeSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200 animate-pulse">
      {/* Icon Skeleton */}
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
      
      {/* Description */}
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>

      {/* Points */}
      <div className="h-8 bg-gray-200 rounded w-24"></div>
    </div>
  );
};

export const BadgeSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <BadgeSkeleton key={index} />
      ))}
    </div>
  );
};

export default BadgeSkeleton;
