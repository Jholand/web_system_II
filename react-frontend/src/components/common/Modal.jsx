import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants } from '../../utils/animations';
import Button from './Button';

const Modal = ({ 
  isOpen, 
  onClose, 
  title,
  titleIcon,
  children,
  footer,
  size = 'md',
  showCloseButton = true
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'w-full sm:max-w-md',
    md: 'w-full sm:max-w-2xl',
    lg: 'w-full sm:max-w-4xl',
    xl: 'w-full sm:max-w-6xl',
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="fixed inset-0 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
            <motion.div 
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl ${sizes[size]} mx-2 sm:mx-0`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl sm:rounded-t-3xl">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  {titleIcon && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg shadow-md flex-shrink-0"
                    >
                      <div className="text-white text-sm sm:text-base">
                        {titleIcon}
                      </div>
                    </motion.div>
                  )}
                  <h3 className="text-base sm:text-xl font-bold text-slate-900 truncate">{title}</h3>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 text-slate-800 hover:text-slate-900 hover:bg-slate-200 hover:scale-110 rounded-lg sm:rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 flex-shrink-0 ml-2"
                  >X
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 stroke-current" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Body */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 sm:p-6 max-h-[calc(100vh-200px)] sm:max-h-[calc(100vh-250px)] overflow-y-auto"
              >
                {children}
              </motion.div>

              {/* Footer */}
              {footer && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white rounded-b-2xl sm:rounded-b-3xl flex-wrap"
                >
                  {footer}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
