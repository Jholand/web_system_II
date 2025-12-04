import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Map, 
  User, 
  MapPin, 
  Gift, 
  Clock, 
  Wallet,
  Settings,
  Trophy,
  ChevronLeft
} from 'lucide-react';

const AdminSidebar = ({ collapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: Map, label: 'Explore Map', path: '/admin/map', color: 'teal' },
    { icon: User, label: 'My Profile', path: '/admin/profile', color: 'teal' },
    { icon: MapPin, label: 'Check-in', path: '/admin/checkin', color: 'teal' },
    { icon: Gift, label: 'Rewards', path: '/admin/rewards', color: 'teal' },
    { icon: Clock, label: 'Timeline', path: '/admin/timeline', color: 'teal' },
    { icon: Wallet, label: 'Wallet', path: '/admin/wallet', color: 'teal' },
    { icon: Settings, label: 'Settings', path: '/admin/settings', color: 'teal' },
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? '5rem' : '16rem' }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-sm z-30 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🗺️</span>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">TravelQuest</h2>
              <p className="text-xs text-teal-600">Explorer</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">🗺️</span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                ${active 
                  ? 'bg-teal-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
                ${collapsed ? 'justify-center' : ''}
              `}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && (
                <span className="text-sm font-medium">{item.label}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Profile at Bottom */}
      {!collapsed && (
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                U
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">John Doe</p>
                <p className="text-xs text-teal-600">Level 5</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Collapse Toggle */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors z-40"
      >
        <ChevronLeft 
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`}
        />
      </button>
    </motion.aside>
  );
};

export default AdminSidebar;
