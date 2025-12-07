import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Gift, QrCode, MapPin, Award, User } from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();

  // Determine which navigation to show based on current path
  const isOwner = location.pathname.startsWith('/owner');
  const isAdmin = location.pathname.startsWith('/admin');
  const isUser = location.pathname.startsWith('/user');

  const ownerNavItems = [
    { path: '/owner/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/owner/rewards', icon: Gift, label: 'Rewards' },
    { path: '/owner/redemptions', icon: QrCode, label: 'Redemptions' }
  ];

  const adminNavItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/destinations', icon: MapPin, label: 'Places' },
    { path: '/admin/badges', icon: Award, label: 'Badges' },
    { path: '/admin/rewards', icon: Gift, label: 'Rewards' }
  ];

  const userNavItems = [
    { path: '/user/dashboard', icon: User, label: 'Profile' },
    { path: '/user/map', icon: MapPin, label: 'Explore' },
    { path: '/user/badges', icon: Award, label: 'Badges' },
    { path: '/user/rewards', icon: Gift, label: 'Rewards' }
  ];

  let navItems = ownerNavItems;
  if (isAdmin) navItems = adminNavItems;
  else if (isUser) navItems = userNavItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 transition-all duration-300 ease-in-out">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all ${
                isActive
                  ? 'text-teal-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${
                isActive ? 'bg-teal-50' : ''
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
