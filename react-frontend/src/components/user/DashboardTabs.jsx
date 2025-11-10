import React from 'react';

const DashboardTabs = ({ activeTab, onTabChange, onNavigate }) => {
  const handleTabClick = (tab) => {
    if (tab === 'profile') {
      onNavigate('/dashboard');
    } else if (tab === 'explore') {
      onNavigate('/map');
    } else if (tab === 'checkin') {
      onNavigate('/checkin');
    } else if (tab === 'rewards') {
      onNavigate('/rewards');
    }
    
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  return (
    <div className="flex gap-4 mb-8">
      <button
        onClick={() => handleTabClick('profile')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'profile'
            ? 'bg-white text-slate-900 shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Profile
      </button>
      
      <button
        onClick={() => handleTabClick('explore')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'explore'
            ? 'bg-white text-slate-900 shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        </svg>
        Explore
      </button>
      
      <button
        onClick={() => handleTabClick('checkin')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'checkin'
            ? 'bg-white text-slate-900 shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        Check-In
      </button>
      
      <button
        onClick={() => handleTabClick('rewards')}
        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
          activeTab === 'rewards'
            ? 'bg-white text-slate-900 shadow-md'
            : 'text-slate-600 hover:text-slate-900 hover:bg-gray-100'
        }`}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
        Rewards
      </button>
    </div>
  );
};

export default DashboardTabs;
