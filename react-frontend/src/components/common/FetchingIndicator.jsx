import React from 'react';
import { motion } from 'framer-motion';

const FetchingIndicator = ({ isFetching }) => {
  if (!isFetching) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
    >
      <div className="h-1 bg-gradient-to-r from-teal-400 via-cyan-500 to-blue-500 overflow-hidden">
        <motion.div
          className="h-full bg-white/30"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{ width: "50%" }}
        />
      </div>
      <div className="absolute top-2 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full shadow-lg border border-slate-200">
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-3 h-3 border-2 border-teal-500 border-t-transparent rounded-full"
          />
          <span className="text-xs font-medium text-slate-600">Updating...</span>
        </div>
      </div>
    </motion.div>
  );
};

export default FetchingIndicator;
