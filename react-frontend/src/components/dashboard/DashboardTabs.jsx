import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, MapPin, Award, Gift, Map, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

const DashboardTabs = ({ onCollapseChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (onCollapseChange) {
      onCollapseChange(newState);
    }
  };

  const getIcon = (id, className) => {
    const props = { 
      className, 
      strokeWidth: 2,
      fill: 'none',
      style: { backgroundColor: 'transparent' }
    };
    switch(id) {
      case 'overview':
        return <BarChart3 {...props} />;
      case 'destinations':
        return <MapPin {...props} />;
      case 'badges':
        return <Award {...props} />;
      case 'rewards':
        return <Gift {...props} />;
      case 'map':
        return <Map {...props} />;
      case 'settings':
        return <Settings {...props} />;
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', path: '/admin/dashboard' },
    { id: 'destinations', label: 'Destinations', path: '/admin/destinations' },
    { id: 'badges', label: 'Badges', path: '/admin/badges' },
    { id: 'rewards', label: 'Rewards', path: '/admin/rewards' },
    { id: 'map', label: 'Map', path: '/admin/map' },
    { id: 'settings', label: 'Settings', path: '/admin/settings' },
  ];

  const isActive = (path) => {
    // Check if we're on the exact path or a sub-route
    if (path === '/admin/destinations') {
      return location.pathname.startsWith('/admin/destinations');
    }
    if (path === '/admin/badges') {
      return location.pathname.startsWith('/admin/badges');
    }
    if (path === '/admin/rewards') {
      return location.pathname.startsWith('/admin/rewards');
    }
    if (path === '/admin/settings') {
      return location.pathname.startsWith('/admin/settings');
    }
    return location.pathname === path;
  };

  return (
    <>
      {/* Desktop Sidebar - Left side navigation below header */}
      <motion.aside 
        animate={{ 
          width: isCollapsed ? '5rem' : '16rem'
        }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex fixed left-0 top-20 h-[calc(100vh-5rem)] bg-gradient-to-b from-white to-purple-50/30 border-r border-purple-100 shadow-lg flex-col z-30 py-6 overflow-hidden"
      >
        {/* Collapse Toggle Button */}
        <motion.button
          onClick={handleToggleCollapse}
          className="absolute -right-3 top-8 w-6 h-6 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 z-40 group"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <ChevronLeft className="w-4 h-4 text-white" />
          </motion.div>
        </motion.button>

        <nav className="flex-1 px-3 space-y-2 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`
                  w-full group flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all duration-200 relative overflow-hidden
                  ${
                    active
                      ? 'text-white'
                      : 'bg-white/50 text-slate-600 hover:bg-white hover:text-purple-600 border border-transparent hover:border-purple-100 hover:shadow-sm'
                  }
                `}
                title={tab.label}
              >
                {/* Active indicator - smoothly slides between tabs */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
                
                <div className="relative z-10">
                  {getIcon(tab.id, `w-5 h-5 ${active ? 'text-white' : ''}`)}
                </div>
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className={`text-base whitespace-nowrap relative z-10 ${active ? 'text-white font-bold' : ''}`}
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Only show when not collapsed */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="px-4 pt-4 border-t border-purple-100"
            >
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-3 text-center">
                <p className="text-xs font-semibold text-purple-600 mb-1">TravelQuest Admin</p>
                <p className="text-xs text-slate-500">Manage your platform</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>

      {/* Tablet View - Semi-collapsed sidebar */}
      <aside 
        className="hidden sm:flex md:hidden fixed left-0 top-20 h-[calc(100vh-5rem)] w-20 bg-gradient-to-b from-white to-purple-50/30 border-r border-purple-100 shadow-lg flex-col z-30 py-6"
      >
        <nav className="flex-1 px-2 space-y-3 overflow-y-auto">
          {tabs.map((tab, index) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`
                  w-full flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl transition-all duration-200 relative group
                  ${
                    active
                      ? 'text-white'
                      : 'bg-white/50 text-slate-600 hover:bg-purple-50 hover:text-purple-600'
                  }
                `}
                title={tab.label}
              >
                {/* Active indicator background */}
                {active && (
                  <motion.div
                    layoutId="tabletActiveTab"
                    className="absolute inset-0 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}

                <div className="relative z-10">
                  {getIcon(tab.id, `w-6 h-6 ${active ? 'text-white' : ''}`)}
                </div>
                <span className={`text-xs font-medium relative z-10 ${active ? 'text-white' : ''}`}>
                  {tab.label.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Navigation - Fixed bottom bar */}
      <div 
        className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg z-50 border-t border-purple-100 shadow-2xl"
      >
        <div className="flex justify-around items-center h-16 px-2 relative">
          {/* Active indicator background */}
          <AnimatePresence mode="wait">
            {tabs.map((tab) => {
              if (isActive(tab.path)) {
                return (
                  <motion.div
                    key={`mobile-bg-${tab.id}`}
                    layoutId="mobileActiveTab"
                    className="absolute top-0 bg-gradient-to-b from-purple-100 to-transparent rounded-t-2xl"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    style={{
                      width: `${100 / tabs.length}%`,
                      height: '100%',
                      left: `${(tabs.findIndex(t => t.id === tab.id) * 100) / tabs.length}%`
                    }}
                  />
                );
              }
              return null;
            })}
          </AnimatePresence>

          {tabs.map((tab, index) => {
            const active = isActive(tab.path);
            return (
              <button
                key={tab.id}
                onClick={() => {
                  navigate(tab.path);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex flex-col items-center justify-center gap-1 p-2 relative z-10 min-w-[60px] bg-transparent"
              >
                {getIcon(tab.id, `w-6 h-6 transition-colors duration-200 ${active ? 'text-purple-600' : 'text-slate-400'}`)}
                <span className={`text-[10px] font-medium transition-colors duration-200 ${active ? 'text-purple-600' : 'text-slate-500 opacity-70'}`}>
                  {tab.label.split(' ')[0]}
                </span>
                
                {/* Active indicator dot - smooth movement */}
                {active && (
                  <motion.div
                    layoutId="mobileActiveDot"
                    className="absolute -top-0.5 w-1.5 h-1.5 bg-purple-600 rounded-full"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default DashboardTabs;
