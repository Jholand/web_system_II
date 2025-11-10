import React from 'react';
import { motion } from 'framer-motion';

const AnimatedPage = ({ children, className = "" }) => {
  return (
    <motion.div 
      initial={{ opacity: 0.98 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0.98 }}
      transition={{ duration: 0.15, ease: 'easeInOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;
