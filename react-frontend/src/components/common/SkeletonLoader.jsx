import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'stats') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {skeletons.map((_, index) => (
          <motion.div
            key={`skeleton-stat-${index}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
            className="bg-gradient-to-br from-gray-400 to-gray-500 rounded-2xl shadow-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="h-4 bg-white/60 rounded w-24 mb-3"></div>
                <div className="h-10 bg-white/60 rounded w-16 mb-2"></div>
                <div className="h-3 bg-white/60 rounded w-20"></div>
              </div>
              <div className="w-14 h-14 bg-white/50 rounded-full"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'destination-card') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skeletons.map((_, index) => (
          <motion.div
            key={`skeleton-dest-${index}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
            className="bg-white border-2 border-gray-400 rounded-xl p-5 shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-400 rounded w-1/2"></div>
              </div>
              <div className="w-12 h-12 bg-gray-400 rounded-full"></div>
            </div>
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-gray-400 rounded"></div>
                <div className="h-4 bg-gray-400 rounded w-8"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 bg-gray-400 rounded"></div>
                <div className="h-4 bg-gray-400 rounded w-12"></div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-400 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-400 rounded-lg"></div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <>
        {skeletons.map((_, index) => (
          <motion.div
            key={`skeleton-card-${index}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white rounded-xl border-2 border-gray-400 p-6 shadow-[0_8px_16px_rgba(0,0,0,0.2)]"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="h-6 bg-gray-400 rounded w-3/4 mb-2"></div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-7 h-7 bg-gray-400 rounded-lg"></div>
                  <div className="h-4 bg-gray-400 rounded w-24"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-gray-400 rounded-full"></div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-400 rounded w-full"></div>
              <div className="h-4 bg-gray-400 rounded w-2/3"></div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="h-10 bg-gray-300 rounded-lg"></div>
              <div className="h-10 bg-gray-300 rounded-lg"></div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1 h-10 bg-gray-400 rounded-lg"></div>
              <div className="flex-1 h-10 bg-gray-400 rounded-lg"></div>
              <div className="w-10 h-10 bg-gray-400 rounded-lg"></div>
            </div>
          </motion.div>
        ))}
      </>
    );
  }

  if (type === 'table-row') {
    return (
      <>
        {skeletons.map((_, index) => (
          <motion.tr
            key={`skeleton-tr-${index}`}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
          >
            <td className="px-6 py-4">
              <div className="h-5 bg-gray-400 rounded w-32"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-5 bg-gray-400 rounded w-48"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-5 bg-gray-400 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <div className="h-8 bg-gray-400 rounded w-16"></div>
                <div className="h-8 bg-gray-400 rounded w-16"></div>
              </div>
            </td>
          </motion.tr>
        ))}
      </>
    );
  }

  // Default line skeleton
  return (
    <>
      {skeletons.map((_, index) => (
        <motion.div
          key={`skeleton-line-${index}`}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
          className="h-4 bg-gray-400 rounded w-full mb-3"
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
