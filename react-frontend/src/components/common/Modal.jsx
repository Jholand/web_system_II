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
    '2xl': 'w-full sm:max-w-7xl',
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl ${sizes[size]} max-h-[95vh] flex flex-col`}
            onClick={(e) => e.stopPropagation()}
          >
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 bg-white rounded-t-3xl flex-shrink-0">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {titleIcon && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                      className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl shadow-md flex-shrink-0"
                    >
                      <div className="text-white">
                        {titleIcon}
                      </div>
                    </motion.div>
                  )}
                  <h3 className="text-xl font-normal text-slate-900 truncate">{title}</h3>
                </div>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    className="flex items-center justify-center w-8 h-8 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 flex-shrink-0 ml-2 font-medium text-lg shadow-sm border border-slate-200"
                  >
                    X
                  </button>
                )}
              </div>

              {/* Body */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="flex-1 overflow-y-auto bg-white p-4 sm:p-6"
                style={{
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 #f1f5f9'
                }}
              >
                {children}
              </motion.div>

              {/* Footer */}
              {footer && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-end gap-3 p-4 sm:p-6 border-t border-slate-200 bg-white rounded-b-3xl flex-shrink-0"
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
