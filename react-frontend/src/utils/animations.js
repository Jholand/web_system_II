// ⚡ ULTRA-OPTIMIZED FRAMER MOTION ANIMATIONS
// GPU-accelerated, 60 FPS, Zero-lag, Non-blocking

// ✅ PERFORMANCE: Custom easing curves for natural motion
const springConfig = { type: "spring", stiffness: 400, damping: 30, mass: 0.8 };
const smoothEase = [0.25, 0.46, 0.45, 0.94]; // Cubic bezier for smooth motion
const quickEase = [0.34, 1.56, 0.64, 1]; // Slight bounce for energy

// ============================================
// PAGE-LEVEL ANIMATIONS (Container animations)
// ============================================

// ✅ MAIN: Smooth fade-in for entire pages
export const pageContainer = {
  hidden: { 
    opacity: 0,
    y: 8,
    scale: 0.99,
  },
  visible: { 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: smoothEase,
      staggerChildren: 0.05, // Stagger child animations
      delayChildren: 0.1,
      when: "beforeChildren"
    }
  },
  exit: { 
    opacity: 0,
    y: -8,
    scale: 0.99,
    transition: { 
      duration: 0.2,
      ease: smoothEase,
      when: "afterChildren"
    }
  }
};

// ✅ SECTION: For main content sections
export const sectionReveal = {
  hidden: { 
    opacity: 0,
    y: 20
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: smoothEase,
      staggerChildren: 0.08
    }
  }
};

// ============================================
// ELEMENT-LEVEL ANIMATIONS (Individual items)
// ============================================

// ✅ FADE: Simple fade in/out
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.25, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15, ease: smoothEase }
  }
};

// ✅ FADE with slight movement
export const fadeInUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    y: -12,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ SLIDE: From right (for sidebars, panels)
export const slideInFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    x: 30,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ SLIDE: From left (for navigation, menus)
export const slideInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    x: -30,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ SLIDE: From bottom (for cards, modals)
export const slideInFromBottom = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    y: 20,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ SLIDE: From top (for notifications, headers)
export const slideInFromTop = {
  hidden: { opacity: 0, y: -20 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: { 
    opacity: 0,
    y: -20,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ SCALE: Zoom in/out (for buttons, icons)
export const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: quickEase }
  },
  exit: { 
    opacity: 0,
    scale: 0.92,
    transition: { duration: 0.15, ease: smoothEase }
  }
};

// ✅ SCALE: Bounce in (for success states, rewards)
export const bounceIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1,
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15,
      duration: 0.4
    }
  }
};

// ============================================
// STAGGER CONTAINERS (For lists, grids)
// ============================================

// ✅ STAGGER: Fast stagger (for small lists)
export const staggerContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0
    }
  }
};

// ✅ STAGGER: Slow stagger (for large content)
export const staggerContainerSlow = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// ✅ STAGGER: Grid animation (for card grids)
export const gridContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15
    }
  }
};

// ============================================
// MODAL & OVERLAY ANIMATIONS
// ============================================

// ✅ MODAL: Backdrop overlay
export const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15, ease: 'easeIn' }
  }
};

// ✅ MODAL: Modal content
export const modalVariants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: smoothEase,
      staggerChildren: 0.05
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ✅ DRAWER: Side drawer animation
export const drawerVariants = {
  hidden: { x: '100%' },
  visible: { 
    x: 0,
    transition: { 
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  },
  exit: { 
    x: '100%',
    transition: { 
      duration: 0.25,
      ease: smoothEase
    }
  }
};

// ============================================
// TAB & NAVIGATION ANIMATIONS
// ============================================

// ✅ TAB: Horizontal slide tabs
export const tabSlide = {
  initial: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0
  }),
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.25, ease: smoothEase }
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2, ease: smoothEase }
  })
};

// ✅ ROUTE: Page route transitions
export const routeVariants = {
  initial: {
    opacity: 0,
    x: 20
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: smoothEase }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2, ease: smoothEase }
  }
};

// ============================================
// CARD & LIST ITEM ANIMATIONS
// ============================================

// ✅ CARD: Hover/tap animations
export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: { 
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: smoothEase }
  },
  tap: { scale: 0.98 }
};

// ✅ LIST ITEM: Reveal animation
export const listItem = {
  hidden: { opacity: 0, x: -10 },
  visible: { 
    opacity: 1,
    x: 0,
    transition: { duration: 0.25, ease: smoothEase }
  }
};

// ============================================
// LOADING & SKELETON ANIMATIONS
// ============================================

// ✅ SKELETON: Pulse animation for loading states
export const skeletonPulse = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
      repeat: Infinity
    }
  }
};

// ✅ SPINNER: Rotating spinner
export const spinnerRotate = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: 'linear',
      repeat: Infinity
    }
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// ✅ Generate stagger delay for manual control
export const getStaggerDelay = (index, baseDelay = 0.05) => ({
  transition: {
    delay: index * baseDelay
  }
});

// ✅ Viewport animation trigger (scroll-based)
export const viewportAnimation = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase }
  }
};

// ✅ Apply to viewport-triggered animations
export const viewportOptions = {
  once: true, // Animate only once
  margin: "-100px", // Trigger 100px before element enters viewport
  amount: 0.3 // Trigger when 30% of element is visible
};
