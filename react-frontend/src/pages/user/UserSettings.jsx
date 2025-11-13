import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';

const UserSettings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  // User data
  const userData = {
    name: user?.name || 'Guest User',
    email: 'user@example.com',
    phone: '+63 912 345 6789',
    address: 'Manila, Philippines',
    joinedDate: 'January 15, 2024',
    points: 250,
    visits: 12,
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    toast.success('Password changed successfully!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      
      <UserHeader user={userData} onLogout={handleLogout} />

      <UserDashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          sm:ml-20 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 sm:py-8 pb-32 sm:pb-20 md:pb-8
        `}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Settings
        </motion.h2>

        <motion.div 
          className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Settings Tabs */}
          <div className="border-b border-slate-200 bg-slate-50 overflow-x-auto">
            <div className="flex gap-2 p-2 min-w-max sm:min-w-0">
              <Button
                onClick={() => setActiveTab('profile')}
                variant={activeTab === 'profile' ? 'primary' : 'outline'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                className={activeTab === 'profile' ? '' : 'bg-transparent hover:bg-slate-100'}
              >
                Profile
              </Button>
              <Button
                onClick={() => setActiveTab('security')}
                variant={activeTab === 'security' ? 'primary' : 'outline'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                }
                className={activeTab === 'security' ? '' : 'bg-transparent hover:bg-slate-100'}
              >
                Security
              </Button>
            </div>
          </div>

          <motion.div 
            className="p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Profile Information</h3>
                  
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900">{userData.name}</h4>
                      <p className="text-slate-600">{userData.email}</p>
                      <div className="flex gap-4 mt-3">
                        <div className="bg-teal-100 px-4 py-2 rounded-lg">
                          <p className="text-xs text-teal-700 font-bold uppercase">Points</p>
                          <p className="text-2xl font-bold text-teal-600">{userData.points}</p>
                        </div>
                        <div className="bg-purple-100 px-4 py-2 rounded-lg">
                          <p className="text-xs text-purple-700 font-bold uppercase">Visits</p>
                          <p className="text-2xl font-bold text-purple-600">{userData.visits}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={userData.name}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={userData.email}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        defaultValue={userData.phone}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address
                      </label>
                      <input
                        type="text"
                        defaultValue={userData.address}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="primary" onClick={handleSaveProfile}>
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button variant="primary" onClick={handleChangePassword}>
                      Update Password
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Account Actions</h3>
                  <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-red-900 mb-2">Delete Account</h4>
                    <p className="text-sm text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                    <Button variant="danger" size="sm">
                      Delete My Account
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>
    </AnimatedPage>
  );
};

export default UserSettings;
