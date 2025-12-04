import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const skeletons = Array.from({ length: count });

  if (type === 'card') {
    return (
      <>
        {skeletons.map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
          >
            {/* Image placeholder */}
            <div className="w-full h-48 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg mb-4"></div>
            
            {/* Title placeholder */}
            <div className="h-6 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-3/4 mb-3"></div>
            
            {/* Description placeholder */}
            <div className="space-y-2">
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full"></div>
              <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-5/6"></div>
            </div>
            
            {/* Footer placeholder */}
            <div className="flex items-center justify-between mt-4">
              <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24"></div>
              <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-20"></div>
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
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
          >
            <td className="px-6 py-4">
              <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-32"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-48"></div>
            </td>
            <td className="px-6 py-4">
              <div className="h-5 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-24"></div>
            </td>
            <td className="px-6 py-4">
              <div className="flex gap-2">
                <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16"></div>
                <div className="h-8 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-16"></div>
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
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: index * 0.1 }}
          className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded w-full mb-3"
        />
      ))}
    </>
  );
};

export default SkeletonLoader;
