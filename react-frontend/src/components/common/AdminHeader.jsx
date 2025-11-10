import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, LogOut, Shield } from 'lucide-react';
import Button from './Button';

const AdminHeader = ({ admin, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md border-b border-slate-200 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900">TravelQuest</h1>
            <p className="text-xs text-purple-600 font-medium flex items-center gap-1">
              <Shield className="w-3 h-3" />
              Admin Portal
            </p>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div 
          className="flex items-center gap-3 sm:gap-4 relative"
          ref={dropdownRef}
        >
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 rounded-xl px-3 sm:px-4 py-2 transition-all duration-200 border border-purple-200 shadow-sm hover:shadow-md group"
          >
            {/* Avatar */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            {/* Admin Info */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-bold text-slate-900">{admin?.name || 'Admin'}</p>
              <p className="text-xs text-purple-600 font-medium">Administrator</p>
            </div>
            {/* Dropdown Arrow */}
            <motion.svg 
              animate={{ rotate: showLogout ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-purple-600 hidden sm:block" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
          
          <AnimatePresence>
            {showLogout && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-purple-100 p-2 min-w-[200px] z-50"
              >
                <Button 
                  variant="outline" 
                  size="md" 
                  onClick={onLogout} 
                  icon={<LogOut className="w-4 h-4 sm:w-5 sm:h-5" />}
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  Logout
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
