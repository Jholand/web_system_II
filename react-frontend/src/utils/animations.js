// Framer Motion Animation Variants

export const fadeIn = {
  hidden: { opacity: 0.95 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.15, ease: 'easeInOut' }
  },
  exit: { 
    opacity: 0.95,
    transition: { duration: 0.1 }
  }
};

export const slideInFromRight = {
  hidden: { opacity: 0.95, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const slideInFromLeft = {
  hidden: { opacity: 0.95, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const slideInFromBottom = {
  hidden: { opacity: 0.95, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  }
};

export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const scaleIn = {
  hidden: { opacity: 0.95, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.2 }
  }
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0, 
    scale: 0.98, 
    y: 10,
    transition: { duration: 0.15 }
  }
};

export const tabSlide = {
  initial: (direction) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0.95
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: (direction) => ({
    x: direction > 0 ? -50 : 50,
    opacity: 0.95,
    transition: { duration: 0.2, ease: 'easeIn' }
  })
};
