import React from 'react';
import { motion } from 'framer-motion';

const DestinationSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
      {/* Image Skeleton */}
      <div className="relative h-48 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 animate-pulse">
        <div className="absolute top-3 right-3 w-20 h-8 bg-white/50 rounded-full"></div>
      </div>

      {/* Content Skeleton */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg w-3/4 animate-pulse"></div>
        
        {/* Location */}
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-1/2 animate-pulse"></div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 pt-2">
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-16 animate-pulse"></div>
          <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-20 animate-pulse"></div>
        </div>

        {/* Category Badge */}
        <div className="h-6 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-full w-24 animate-pulse"></div>

        {/* Distance */}
        <div className="h-4 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded w-28 animate-pulse"></div>

        {/* Button */}
        <div className="h-10 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg w-full animate-pulse mt-3"></div>
      </div>
    </div>
  );
};

export const DestinationSkeletonGrid = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <DestinationSkeleton key={index} />
      ))}
    </div>
  );
};

export default DestinationSkeleton;
