import React from 'react';
import { motion } from 'framer-motion';
import { slideInFromRight } from '../../utils/animations';

/**
 * AnimatedCard - Reusable card component with hover animations
 * Features:
 * - Smooth slide-in animation
 * - Scale on hover (1.02)
 * - Enhanced shadow on hover
 * - Border color transition
 * - GPU-accelerated transforms
 */
const AnimatedCard = ({ 
  children, 
  className = "",
  ...props 
}) => {
  return (
    <motion.div
      variants={slideInFromRight}
      className={`relative z-0 group ${className}`}
      {...props}
    >
      <div className="bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.18)] hover:shadow-[0_8px_36px_rgba(14,165,233,0.25)] border-2 border-slate-300 hover:border-teal-400 transition-all duration-300 relative z-10 hover:z-20 hover:scale-[1.02]">
        {children}
      </div>
    </motion.div>
  );
};

export default AnimatedCard;
