import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Map, Smartphone, Gift, Settings, ChevronLeft, Camera, Award } from 'lucide-react';

// ✅ ZERO-LAG: Static tab configuration
const TABS = [
  { id: 'dashboard', label: 'Profile', path: '/user/dashboard' },
  { id: 'map', label: 'Explore', path: '/user/map' },
  { id: 'checkin', label: 'Check-In', path: '/user/checkin' },
  { id: 'badges', label: 'Badges', path: '/user/badges' },
  { id: 'rewards', label: 'Rewards', path: '/user/rewards' },
  { id: 'settings', label: 'Settings', path: '/user/settings' },
];

// ✅ PERFORMANCE: Icon map
const ICON_MAP = {
  dashboard: User,
  map: Map,
  checkin: Smartphone,
  badges: Award,
  rewards: Gift,
  settings: Settings,
};

const UserDashboardTabs = React.memo(({ onCollapseChange, onScannerClick }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  const handleToggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  }, [isCollapsed, onCollapseChange]);

  const handleNavigate = useCallback((path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  const isActive = useCallback((path) => currentPath === path, [currentPath]);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex fixed left-0 top-16 sm:top-20 h-[calc(100vh-4rem)] sm:h-[calc(100vh-5rem)] bg-gradient-to-b from-white via-emerald-50/30 to-teal-50/50 border-r border-emerald-100 shadow-lg flex-col z-30 py-6 overflow-hidden transition-all duration-150 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <button
          onClick={handleToggleCollapse}
          className="absolute -right-3 top-8 w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 rounded-full flex items-center justify-center shadow-lg transition-all duration-75 z-40 active:scale-90"
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          <ChevronLeft 
            className={`w-4 h-4 text-white transition-transform duration-150 ${isCollapsed ? 'rotate-180' : ''}`}
          />
        </button>

        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto scrollbar-hide">
          {TABS.map((tab) => {
            const Icon = ICON_MAP[tab.id];
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={(e) => handleNavigate(tab.path, e)}
                className={`w-full group flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-75 relative overflow-hidden ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-white/70 text-gray-700 hover:bg-white hover:text-emerald-600 border border-transparent hover:border-emerald-200 hover:shadow-sm'
                } ${isCollapsed ? 'justify-center' : ''}`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-white' : ''}`} strokeWidth={2.5} />
                {!isCollapsed && (
                  <span className="text-sm whitespace-nowrap">
                    {tab.label}
                  </span>
                )}
                {active && !isCollapsed && (
                  <div className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {!isCollapsed && (
          <div className="px-4 py-3 mx-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
            <p className="text-xs font-semibold text-emerald-700 mb-1">TravelQuest</p>
            <p className="text-[10px] text-gray-600">Your Adventure Awaits</p>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Navbar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg z-50 border-t border-emerald-100 shadow-2xl">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onScannerClick && onScannerClick();
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 via-rose-500 to-pink-600 rounded-full shadow-2xl shadow-pink-500/40 hover:shadow-pink-500/60 active:scale-95 z-20 ring-4 ring-white transition-all duration-75"
        >
          <Camera className="w-7 h-7 text-white drop-shadow-lg" strokeWidth={2.5} />
        </button>

        <div className="flex justify-around items-center h-16 px-2 relative">
          {TABS.map((tab, index) => {
            const Icon = ICON_MAP[tab.id];
            const active = isActive(tab.path);
            const activePosition = (index * 100) / TABS.length;
            
            return (
              <React.Fragment key={tab.id}>
                {active && (
                  <div
                    className="absolute top-0 bg-gradient-to-b from-emerald-100 to-transparent rounded-t-2xl transition-all duration-75"
                    style={{
                      width: `${100 / TABS.length}%`,
                      height: '100%',
                      left: `${activePosition}%`,
                    }}
                  />
                )}
                
                <button
                  onClick={(e) => handleNavigate(tab.path, e)}
                  className="flex flex-col items-center justify-center gap-0.5 p-2 relative z-10 min-w-[60px] active:scale-90 transition-transform duration-75"
                >
                  <Icon 
                    className={`w-6 h-6 transition-colors duration-75 ${
                      active ? 'text-emerald-600' : 'text-gray-400'
                    }`} 
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={`text-[10px] font-medium transition-colors duration-75 ${
                    active ? 'text-emerald-600' : 'text-gray-500'
                  }`}>
                    {tab.label}
                  </span>
                  
                  {active && (
                    <div className="absolute top-0 w-1 h-1 bg-emerald-600 rounded-full" />
                  )}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.onCollapseChange === nextProps.onCollapseChange &&
         prevProps.onScannerClick === nextProps.onScannerClick;
});

UserDashboardTabs.displayName = 'UserDashboardTabs';

export default UserDashboardTabs;
