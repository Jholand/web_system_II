import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { viewportAnimation, viewportOptions } from '../../utils/animations';

/**
 * ⚡ ANIMATED SECTION COMPONENT
 * 
 * Reveals sections as user scrolls down the page
 * - Viewport-triggered animations
 * - GPU-accelerated
 * - Animates only once for performance
 * - Non-blocking
 */
const AnimatedSection = React.memo(({ 
  children, 
  className = "",
  variants = viewportAnimation,
  once = true,
  threshold = 0.3,
  margin = "-100px"
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, {
    once,
    margin,
    amount: threshold
  });

  return (
    <motion.section
      ref={ref}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
      // ✅ PERFORMANCE: GPU acceleration
      style={{ 
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden'
      }}
    >
      {children}
    </motion.section>
  );
});

AnimatedSection.displayName = 'AnimatedSection';

export default AnimatedSection;
