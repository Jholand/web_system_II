import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserCircle, LogOut, Compass } from 'lucide-react';

// ⚡ ZERO-LAG HEADER - No framer-motion, pure CSS transitions
const UserHeader = React.memo(({ user, onLogout }) => {
  const [showLogout, setShowLogout] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Optimized click outside handler
  useEffect(() => {
    if (!showLogout) return;
    
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLogout(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLogout]);

  // ✅ Instant toggle - no animation delay
  const toggleDropdown = useCallback(() => {
    setShowLogout(prev => !prev);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm border-b border-emerald-100 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        {/* Logo Section - Tourism Themed */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              TravelQuest
            </h1>
            <p className="text-[10px] sm:text-xs text-emerald-600 font-medium flex items-center gap-1">
              <Compass className="w-3 h-3" strokeWidth={2.5} />
              Explore & Collect
            </p>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="flex items-center gap-2 sm:gap-3 relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 rounded-2xl px-3 sm:px-4 py-2 transition-all duration-75 border border-emerald-200 hover:border-emerald-300 shadow-sm hover:shadow-md active:scale-95"
          >
            {/* Avatar */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
              <UserCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2} />
            </div>
            
            {/* User Info - Desktop Only */}
            <div className="text-left hidden sm:block">
              <p className="text-sm font-semibold text-gray-900">
                {user?.name || 'Guest'}
              </p>
              <p className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <span className="text-sm">🪙</span>
                {user?.total_points?.toLocaleString() || 0} pts
              </p>
            </div>
            
            {/* Dropdown Arrow */}
            <svg 
              className={`w-4 h-4 text-emerald-600 transition-transform duration-75 hidden sm:block ${showLogout ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {/* Dropdown Menu - Instant show/hide */}
          {showLogout && (
            <div
              className="absolute top-full right-0 mt-2 bg-white rounded-2xl shadow-xl border border-emerald-100 p-2 min-w-[180px] z-50 animate-slide-down"
              style={{ animationDuration: '150ms' }}
            >
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-75 active:scale-95"
              >
                <LogOut className="w-4 h-4" strokeWidth={2} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}, (prevProps, nextProps) => {
  // ✅ Only re-render if user data actually changes
  return prevProps.user?.total_points === nextProps.user?.total_points &&
         prevProps.user?.name === nextProps.user?.name;
});

UserHeader.displayName = 'UserHeader';

export default UserHeader;
