import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Moon } from 'lucide-react';
import Button from './Button';

const AdminHeader = ({ admin, onLogout, searchQuery, onSearchChange, sidebarCollapsed }) => {
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
    <header className={`fixed top-0 right-0 bg-white border-b border-gray-200 z-40 transition-all duration-150 ${sidebarCollapsed ? 'left-20' : 'left-64'}`}>
      <div className="px-6 py-3.5 flex items-center justify-between">
        {/* Left: Page Title */}
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Explore Destinations</h1>
        </div>

        {/* Right: Search + Icons + Profile */}
        <div className="flex items-center gap-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery || ''}
              onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-64 bg-gray-50 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Notification Bell */}
          <button className="relative w-10 h-10 flex items-center justify-center bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Dark Mode Toggle */}
          <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all">
            <Moon className="w-5 h-5 text-gray-600" />
          </button>

          {/* Profile Button */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowLogout(!showLogout)}
              className="w-10 h-10 bg-white border-2 border-gray-200 hover:border-teal-500 rounded-lg flex items-center justify-center transition-all"
            >
              <span className="text-gray-700 font-semibold text-sm">U</span>
            </button>
            
            <AnimatePresence>
              {showLogout && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden min-w-[140px] z-50"
                >
                  <button
                    onClick={onLogout}
                    className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
