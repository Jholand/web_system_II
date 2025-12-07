import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, MapPin, Tag, Award, Users, Settings, Gift, ChevronLeft, LogOut, Map } from 'lucide-react';
import { getCurrentAdmin } from '../../utils/adminHelper';
import toast from 'react-hot-toast';
import MobileHeader from '../layout/MobileHeader';
import TabletHeader from '../layout/TabletHeader';
import MobileBottomNav from '../layout/MobileBottomNav';

// RESTORED: Original admin sidebar menu items
const TABS = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  { id: 'destinations', label: 'Destinations', path: '/admin/destinations', icon: MapPin },
  { id: 'map', label: 'Map View', path: '/admin/map', icon: Map },
  { id: 'categories', label: 'Categories', path: '/admin/categories', icon: Tag },
  { id: 'badges', label: 'Badges', path: '/admin/badges', icon: Award },
  { id: 'users', label: 'Users', path: '/admin/users', icon: Users },
  { id: 'rewards', label: 'Rewards', path: '/admin/rewards', icon: Gift },
  { id: 'settings', label: 'Settings', path: '/admin/settings', icon: Settings },
];



const DashboardTabs = React.memo(({ onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const currentUser = getCurrentAdmin();
  const userInitial = currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U';

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_data');
    toast.success('Logged out successfully!');
    navigate('/');
  };

  // ✅ PERFORMANCE: Memoize current path to prevent unnecessary recalculations
  const currentPath = useMemo(() => location.pathname, [location.pathname]);

  // ✅ PERFORMANCE: Memoize collapse handler
  const handleToggleCollapse = useCallback(() => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  }, [isCollapsed, onCollapseChange]);

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

  // ✅ F1 SPEED: Instant navigation with optimistic UI update
  const handleNavigate = useCallback((path, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    // Instant navigation - no delay
    navigate(path);
    // Instant scroll - no animation delay
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [navigate]);

  // ✅ PERFORMANCE: Memoize active check function
  const isActive = useCallback((path) => {
    if (path === '/admin/destinations') {
      return currentPath.startsWith('/admin/destinations');
    }
    if (path === '/admin/categories') {
      return currentPath.startsWith('/admin/categories');
    }
    if (path === '/admin/badges') {
      return currentPath.startsWith('/admin/badges');
    }
    if (path === '/admin/rewards') {
      return currentPath.startsWith('/admin/rewards');
    }
    if (path === '/admin/settings') {
      return currentPath.startsWith('/admin/settings');
    }
    return currentPath === path;
  }, [currentPath]);

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
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden transition-opacity duration-300 ease-in-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar - Clean minimalist design matching reference */}
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
            <p className="text-xs text-gray-500">Admin Panel</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {TABS.map((tab) => {
            const active = isActive(tab.path);
            const Icon = tab.icon;
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

        {/* User Profile at Bottom */}
        <div className="p-3 relative">
          {isCollapsed ? (
            <>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all"
                title={currentUser.name}
              >
                {userInitial}
              </button>
              {showProfileMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowProfileMenu(false)}
                  />
                  <div className="absolute left-16 bottom-0 z-50 bg-white rounded-xl shadow-2xl border-2 border-teal-200 p-3 min-w-[200px]">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {userInitial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                        <p className="text-xs text-teal-600">{currentUser.role}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {userInitial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.name}</p>
                  <p className="text-xs text-teal-600">{currentUser.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </aside>

      {/* Tablet View - Burger Menu */}
      <div className="hidden sm:block md:hidden">
        {/* Burger Button */}
        <button
          onClick={handleToggleCollapse}
          className="fixed left-4 top-24 z-50 w-12 h-12 bg-white hover:bg-teal-50 border-2 border-teal-200 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-100"
        >
          <div className="flex flex-col gap-1.5">
            <span 
              style={{ 
                transform: isCollapsed ? 'rotate(45deg) translateY(6px)' : 'none',
                transition: 'all 100ms ease-out'
              }}
              className="w-6 h-0.5 bg-teal-600 rounded-full"
            />
            <span 
              style={{
                opacity: isCollapsed ? 0 : 1,
                transition: 'all 100ms ease-out'
              }}
              className="w-6 h-0.5 bg-teal-600 rounded-full"
            />
            <span 
              style={{
                transform: isCollapsed ? 'rotate(-45deg) translateY(-6px)' : 'none',
                transition: 'all 100ms ease-out'
              }}
              className="w-6 h-0.5 bg-teal-600 rounded-full"
            />
          </div>
        </button>



        {/* Sliding Menu */}
        {isCollapsed && (
          <aside
            style={{
              transform: 'translateX(0)',
              transition: 'transform 100ms ease-out'
            }}
            className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-white to-teal-50/30 border-r border-teal-100 shadow-2xl z-50 py-6 overflow-hidden"
          >
              <nav className="flex-1 px-3 space-y-2 overflow-y-auto h-full scrollbar-hide">
                {TABS.map((tab) => {
                  const active = isActive(tab.path);
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        handleNavigate(tab.path);
                        handleToggleCollapse();
                      }}
                      className={`
                        w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-75 relative overflow-hidden
                        ${
                          active
                            ? 'text-white'
                            : 'bg-white/50 text-slate-600 hover:bg-white hover:text-teal-600 border border-transparent hover:border-teal-100 hover:shadow-sm'
                        }
                      `}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-600 rounded-xl shadow-lg transition-all duration-75" />
                      )}
                      
                      <div className="relative z-10">
                        <tab.icon className={`w-5 h-5 ${active ? 'text-white' : ''}`} />
                      </div>
                      
                      <span className={`text-base whitespace-nowrap relative z-10 ${active ? 'text-white font-bold' : ''}`}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </aside>
          )}
      </div>

      {/* Mobile Navigation - Fixed bottom bar */}
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-50 border-t border-teal-100 shadow-2xl"
      >
        <div className="flex items-center h-16 relative">
          {/* ✅ OPTIMIZED: Removed layoutId, using CSS transitions instead */}
          {TABS.map((tab, tabIndex) => {
            if (isActive(tab.path)) {
              return (
                <div
                  key={`mobile-bg-${tab.id}`}
                  className="absolute top-0 bg-gradient-to-b from-teal-100 to-transparent rounded-t-2xl pointer-events-none transition-all duration-150"
                  style={{
                    width: `${100 / TABS.length}%`,
                    height: '100%',
                    left: `${(tabIndex * 100) / TABS.length}%`,
                    transform: 'translateX(0)'
                  }}
                />
              );
            }
            return null;
          })}

          {TABS.map((tab, index) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={(e) => handleNavigate(tab.path, e)}
                className="flex flex-col items-center justify-center gap-1 p-2 relative z-10 flex-1 bg-transparent active:scale-90 transition-transform duration-75"
              >
                <tab.icon className={`w-6 h-6 transition-colors duration-75 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                <span className={`text-[10px] font-medium transition-colors duration-75 ${active ? 'text-teal-600' : 'text-slate-500 opacity-70'}`}>
                  {tab.label.split(' ')[0]}
                </span>
                
                {/* ✅ F1 SPEED: Instant visual indicator with 75ms transition */}
                {active && (
                  <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-teal-600 rounded-full transition-all duration-75"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}, (prevProps, nextProps) => {
  // ✅ PERFORMANCE: Custom comparison - only re-render if props actually change
  return prevProps.onCollapseChange === nextProps.onCollapseChange;
});

DashboardTabs.displayName = 'DashboardTabs';

export default DashboardTabs;
