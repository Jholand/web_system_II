import React from 'react';

export const RewardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 animate-pulse">
      {/* Image Skeleton */}
      <div className="h-48 bg-gray-200"></div>
      
      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Title */}
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        
        {/* Category */}
        <div className="h-5 bg-gray-200 rounded w-24"></div>
        
        {/* Description */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>

        {/* Points */}
        <div className="h-8 bg-gray-200 rounded w-32"></div>

        {/* Stock */}
        <div className="h-4 bg-gray-200 rounded w-28"></div>

        {/* Button */}
        <div className="h-10 bg-gray-200 rounded-lg w-full"></div>
      </div>
    </div>
  );
};

export const RewardSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <RewardSkeleton key={index} />
      ))}
    </div>
  );
};

export default RewardSkeleton;
