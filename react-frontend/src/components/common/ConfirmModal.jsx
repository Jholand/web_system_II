import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, LogOut, Trash2, X, CheckCircle, AlertCircle } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger', // 'danger', 'warning', 'logout', 'success', 'info'
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  const getIcon = () => {
    switch (type) {
      case 'logout':
        return <LogOut className="w-14 h-14" strokeWidth={1.5} />;
      case 'danger':
      case 'delete':
        return <Trash2 className="w-14 h-14" strokeWidth={1.5} />;
      case 'success':
        return <CheckCircle className="w-14 h-14" strokeWidth={1.5} />;
      case 'info':
        return <AlertCircle className="w-14 h-14" strokeWidth={1.5} />;
      default:
        return <AlertTriangle className="w-14 h-14" strokeWidth={1.5} />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'logout':
        return {
          iconBg: 'bg-gradient-to-br from-blue-100 to-cyan-100',
          iconColor: 'text-blue-600',
          headerBg: 'bg-gradient-to-r from-blue-50 via-white to-cyan-50',
          border: 'border-blue-200',
          button: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/30',
          text: 'text-blue-900',
          ringColor: 'ring-blue-200',
        };
      case 'danger':
      case 'delete':
        return {
          iconBg: 'bg-gradient-to-br from-red-100 to-pink-100',
          iconColor: 'text-red-600',
          headerBg: 'bg-gradient-to-r from-red-50 via-white to-pink-50',
          border: 'border-red-200',
          button: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30',
          text: 'text-red-900',
          ringColor: 'ring-red-200',
        };
      case 'success':
        return {
          iconBg: 'bg-gradient-to-br from-emerald-100 to-teal-100',
          iconColor: 'text-emerald-600',
          headerBg: 'bg-gradient-to-r from-emerald-50 via-white to-teal-50',
          border: 'border-emerald-200',
          button: 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg shadow-emerald-500/30',
          text: 'text-emerald-900',
          ringColor: 'ring-emerald-200',
        };
      case 'info':
        return {
          iconBg: 'bg-gradient-to-br from-sky-100 to-blue-100',
          iconColor: 'text-sky-600',
          headerBg: 'bg-gradient-to-r from-sky-50 via-white to-blue-50',
          border: 'border-sky-200',
          button: 'bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 shadow-lg shadow-sky-500/30',
          text: 'text-sky-900',
          ringColor: 'ring-sky-200',
        };
      default:
        return {
          iconBg: 'bg-gradient-to-br from-amber-100 to-orange-100',
          iconColor: 'text-amber-600',
          headerBg: 'bg-gradient-to-r from-amber-50 via-white to-orange-50',
          border: 'border-amber-200',
          button: 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg shadow-amber-500/30',
          text: 'text-amber-900',
          ringColor: 'ring-amber-200',
        };
    }
  };

  const colors = getColors();

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/75 to-slate-800/80 backdrop-blur-lg z-[99999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0.3 }}
            className={`bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border-2 ${colors.border}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Header */}
            <div className={`${colors.headerBg} border-b-2 ${colors.border} px-6 py-4 flex items-center justify-between`}>
              <h3 className={`text-lg font-bold ${colors.text} tracking-tight`}>{title}</h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className={`p-1.5 hover:bg-white/60 rounded-xl transition-colors ${colors.text}`}
                disabled={isLoading}
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>

            {/* Content */}
            <div className="px-6 py-8">
              <div className="flex flex-col items-center text-center gap-5">
                {/* Animated Icon */}
                <motion.div 
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
                  className={`${colors.iconBg} p-5 rounded-2xl shadow-lg ring-4 ${colors.ringColor}`}
                >
                  <div className={colors.iconColor}>
                    {getIcon()}
                  </div>
                </motion.div>
                
                {/* Message */}
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-slate-700 text-base leading-relaxed max-w-sm"
                >
                  {message}
                </motion.p>
              </div>
            </div>

            {/* Footer */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-6 py-4 bg-gradient-to-r from-slate-50 to-slate-50/50 border-t-2 border-slate-100 flex items-center justify-end gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="px-6 py-2.5 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={isLoading}
              >
                {cancelText}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                className={`px-6 py-2.5 ${colors.button} text-white rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    <span>Processing...</span>
                  </>
                ) : (
                  confirmText
                )}
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
