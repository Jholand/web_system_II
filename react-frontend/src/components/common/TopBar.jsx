import React from 'react';
import { getCurrentAdmin } from '../../utils/adminHelper';

/**
 * TopBar - Fixed header showing logged-in user info
 */
const TopBar = ({ sidebarCollapsed }) => {
  const currentUser = getCurrentAdmin();
  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  return (
    <header 
      className={`
        fixed top-0 right-0 z-30
        transition-all duration-300 ease-out
        ${sidebarCollapsed ? 'md:left-20' : 'md:left-64'}
        left-0
        bg-white border-b border-gray-200 shadow-sm
      `}
    >
      <div className="flex items-center justify-end px-4 sm:px-6 lg:px-8 h-14">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-gray-900">{currentUser.name}</p>
            <p className="text-xs text-teal-600 capitalize">{currentUser.role}</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md">
            {userInitial}
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
