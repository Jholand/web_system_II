import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Map, Smartphone, Gift, Settings, ChevronLeft, Camera, Award } from 'lucide-react';
import MobileHeader from '../layout/MobileHeader';
import TabletHeader from '../layout/TabletHeader';
import MobileBottomNav from '../layout/MobileBottomNav';

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');

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

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {/* Mobile Header (< md) */}
      <MobileHeader user={currentUser} />
      
      {/* Tablet Header (md to lg) */}
      <TabletHeader 
        user={currentUser} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Backdrop for tablet view */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden transition-opacity duration-300 ease-in-out animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar - Matching Admin Design */}
      <aside 
        style={{ width: window.innerWidth >= 1024 ? (isCollapsed ? '5rem' : '16rem') : undefined }}
        className={`fixed left-0 top-0 h-screen bg-white border-r-2 border-slate-300 shadow-[4px_0_20px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 ease-in-out
          hidden md:flex lg:flex
          z-50
          md:w-64 lg:w-auto
          ${isSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
          lg:translate-x-0`}
      >
        {/* Header - Logo & Title (Hidden on tablet, shown on desktop) */}
        <div className="p-4 flex items-center gap-3 hidden lg:flex">
          {!isCollapsed ? (
            <>
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">TravelQuest</h2>
                <p className="text-xs text-gray-500">Explorer</p>
              </div>
              <button
                onClick={handleToggleCollapse}
                className="ml-auto p-1.5 bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600" />
              </button>
            </>
          ) : (
            <div className="w-full flex justify-center">
              <button
                onClick={handleToggleCollapse}
                className="p-1.5 bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all"
              >
                <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
              </button>
            </div>
          )}
        </div>
        
        {/* Tablet Sidebar Header (Only on tablet when sidebar is open) */}
        <div className="p-4 flex items-center gap-3 lg:hidden border-b border-gray-200">
          <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">TravelQuest</h2>
            <p className="text-xs text-gray-500">User Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const Icon = ICON_MAP[tab.id];
            const active = isActive(tab.path);
            
            return (
              <button
                key={tab.id}
                onClick={(e) => handleNavigate(tab.path, e)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-75
                  ${active ? 'bg-teal-500 text-white shadow-md' : 'bg-transparent text-gray-700 hover:bg-gray-50'}
                  ${isCollapsed ? 'justify-center' : ''}
                `}
                title={tab.label}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="text-sm">{tab.label}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* QR Scanner Button - Prominent */}
        <div className="px-3 py-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onScannerClick && onScannerClick();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-75
              bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:from-teal-600 hover:to-cyan-600 shadow-md
              ${isCollapsed ? 'justify-center' : ''}`}
            title="Scan QR Code"
          >
            <Camera className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm">Scan QR</span>
            )}
          </button>
        </div>

        {/* User Profile at Bottom */}
        <div className="p-3">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name || 'User'}</p>
                  <p className="text-xs text-teal-600">Explorer</p>
                </div>
              )}
              <button
                onClick={() => {
                  localStorage.removeItem('auth_token');
                  localStorage.removeItem('user_data');
                  navigate('/');
                }}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navbar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/98 backdrop-blur-lg z-50 border-t border-emerald-100 shadow-2xl">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onScannerClick && onScannerClick();
          }}
          className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-500 via-cyan-500 to-teal-600 rounded-full shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/60 active:scale-95 z-20 ring-4 ring-white transition-all duration-75"
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
                    className="absolute top-0 bg-gradient-to-b from-teal-100 to-transparent rounded-t-2xl transition-all duration-75"
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
