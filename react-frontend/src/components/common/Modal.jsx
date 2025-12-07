import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  titleIcon,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  scrollable = false,
  variant = 'default' // 'default', 'danger', 'success', 'warning'
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  // Prevent ESC key close if disabled
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen && showCloseButton) {
        onClose();
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, showCloseButton]);

  const sizes = {
    xs: 'w-[320px]',
    sm: 'w-[420px]',
    md: 'w-[580px]',
    lg: 'w-[880px]',
    xl: 'w-[1020px]',
    '2xl': 'w-[1180px]',
    '3xl': 'w-[1380px]',
    full: 'w-[95vw]',
  };

  const variantStyles = {
    default: {
      header: 'bg-gradient-to-r from-slate-50 via-white to-slate-50',
      iconBg: 'bg-gradient-to-br from-teal-500 to-cyan-600',
      border: 'border-slate-200',
    },
    danger: {
      header: 'bg-gradient-to-r from-red-50 via-white to-red-50',
      iconBg: 'bg-gradient-to-br from-red-500 to-pink-600',
      border: 'border-red-200',
    },
    success: {
      header: 'bg-gradient-to-r from-emerald-50 via-white to-emerald-50',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
      border: 'border-emerald-200',
    },
    warning: {
      header: 'bg-gradient-to-r from-amber-50 via-white to-amber-50',
      iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
      border: 'border-amber-200',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.default;

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center py-8 px-4 overflow-hidden">
          {/* Enhanced Backdrop with stronger blur and gradient */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/75 to-slate-800/80 backdrop-blur-lg"
            onClick={undefined}
          />

          {/* Modal - Enhanced with better shadows and borders */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative bg-white rounded-2xl shadow-2xl ${sizes[size]} max-h-[90vh] flex flex-col border-2 ${currentVariant.border} overflow-visible`}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header - Enhanced with gradient and better spacing */}
            <div className={`flex items-center justify-between px-6 py-4 border-b-2 ${currentVariant.border} ${currentVariant.header} flex-shrink-0`}>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {titleIcon && (
                  <motion.div 
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 20 }}
                    className={`flex items-center justify-center w-10 h-10 ${currentVariant.iconBg} rounded-xl shadow-lg flex-shrink-0`}
                  >
                    <div className="text-white">
                      {titleIcon}
                    </div>
                  </motion.div>
                )}
                <h2 className="text-lg font-bold text-slate-900 truncate tracking-tight">{title}</h2>
              </div>
              {showCloseButton && (
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-all duration-200 flex-shrink-0 ml-3 group"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              )}
            </div>

            {/* Body - Non-scrollable content */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.3 }}
              className={`flex-1 px-6 py-5 bg-white ${scrollable ? 'overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400' : 'overflow-visible'}`}
              onWheel={(e) => e.stopPropagation()}
              style={scrollable ? {
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 transparent',
                maxHeight: 'calc(90vh - 180px)'
              } : {}}
            >
              {children}
            </motion.div>

            {/* Footer - Enhanced with better spacing and gradient */}
            {footer && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className={`flex items-center justify-end gap-3 px-6 py-5 border-t-2 ${currentVariant.border} bg-gradient-to-r from-white to-slate-50/50 flex-shrink-0`}
              >
                {footer}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
