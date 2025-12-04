import React from 'react';

export const UserSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar Skeleton */}
        <div className="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>

        {/* User Info Skeleton */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="h-4 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-36"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
            <div className="h-4 bg-gray-200 rounded w-28"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const UserSkeletonGrid = ({ count = 10 }) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <UserSkeleton key={index} />
      ))}
    </div>
  );
};

export default UserSkeleton;
