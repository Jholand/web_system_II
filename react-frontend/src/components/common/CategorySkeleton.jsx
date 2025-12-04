import React from 'react';

export const CategorySkeleton = () => {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 animate-pulse">
      <div className="flex items-center gap-4">
        {/* Icon Skeleton */}
        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    </div>
  );
};

export const CategorySkeletonGrid = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <CategorySkeleton key={index} />
      ))}
    </div>
  );
};

export default CategorySkeleton;
