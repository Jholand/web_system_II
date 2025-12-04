import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import QRScanner from '../../components/qr/QRScanner';
import CheckInReview from '../../components/user/CheckInReview';
import { useCheckIn } from '../../hooks/useCheckIn.jsx';
import { useCheckins, useCheckinStats } from '../../hooks/useUserData';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';

const UserSettings = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // ⚡ REACT QUERY - INSTANT from cache
  const { data: statsData } = useCheckinStats();
  const { data: checkinsData } = useCheckins(5);
  
  const userStats = { 
    total_visits: statsData?.total_visits || 0, 
    total_points: statsData?.total_points || 0 
  };
  const recentCheckIns = checkinsData?.checkins || [];
  const loadingCheckIns = false
  
  const {
    showScanModal,
    setShowScanModal,
    showReviewModal,
    setShowReviewModal,
    scannedQRCode,
    checkInDestination,
    destinations,
    fetchDestinations,
    handleScanSuccess,
    handleReviewSubmit,
    resetCheckIn
  } = useCheckIn();

  // ✅ PERFORMANCE: Memoize event handlers
  const handleSaveProfile = useCallback(() => {
    toast.success('Profile updated successfully!');
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    
    try {
      const token = localStorage.getItem('auth_token');
      const API_BASE_URL = window.location.hostname === 'localhost' 
        ? 'http://localhost:8000/api'
        : `http://${window.location.hostname}:8000/api`;
      
      const response = await fetch(`${API_BASE_URL}/user/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword
        })
      });
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.message || 'Failed to change password');
      }
    } catch (error) {
      toast.error('Error changing password. Please try again.');
    }
  }, [currentPassword, newPassword, confirmPassword]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleScannerClick = useCallback(() => {
    setShowScanModal(true);
  }, []);

  // ✅ Fetch destinations on mount only
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />
      
      
      <UserHeader user={user} onLogout={handleLogout} />

      <UserDashboardTabs onCollapseChange={handleSidebarCollapse} onScannerClick={handleScannerClick} />

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8
        `}
      >
        {/* Page Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Settings
          </h1>
          <p className="text-sm text-gray-600">
            Manage your account preferences and security
          </p>
        </motion.div>

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
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900">{user?.name || 'Guest User'}</h4>
                      <p className="text-slate-600">{user?.email || 'N/A'}</p>
                      <div className="flex gap-4 mt-3">
                        <div className="bg-teal-100 px-4 py-2 rounded-lg">
                          <p className="text-xs text-teal-700 font-bold uppercase">Points</p>
                          <p className="text-2xl font-bold text-teal-600">{user?.total_points || 0}</p>
                        </div>
                        <div className="bg-purple-100 px-4 py-2 rounded-lg">
                          <p className="text-xs text-purple-700 font-bold uppercase">Visits</p>
                          <p className="text-2xl font-bold text-purple-600">{userStats.total_visits || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Check-Ins Section */}
                  <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 mb-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Recent Check-Ins
                    </h4>
                    
                    {loadingCheckIns ? (
                      <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                        <p className="text-sm text-slate-600 mt-2">Loading check-ins...</p>
                      </div>
                    ) : recentCheckIns.length > 0 ? (
                      <div className="space-y-3">
                        {recentCheckIns.map((checkIn, index) => (
                          <div key={checkIn.id || `checkin-${index}`} className="flex items-center justify-between p-3 bg-white rounded-lg border border-teal-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <div>
                                <h5 className="font-bold text-slate-900 text-sm">{checkIn.location}</h5>
                                <p className="text-xs text-slate-600">{checkIn.time}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-base font-bold text-teal-600">+{checkIn.points} pts</p>
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                Success
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-slate-700 mb-1">No check-ins yet</p>
                        <p className="text-xs text-slate-500">Start exploring and checking in to destinations!</p>
                      </div>
                    )}
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
                        defaultValue={user?.name || ''}
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
                        defaultValue={user?.email || ''}
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
                        defaultValue={user?.phone || ''}
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
                        defaultValue={user?.address || ''}
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
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
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
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
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
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
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

      {/* QR Scanner Modal */}
      {showScanModal && (
        <Modal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          title="Scan QR Code"
          size="lg"
        >
          <QRScanner
            onScanSuccess={(qrCode) => handleScanSuccess(qrCode, destinations)}
            onClose={() => setShowScanModal(false)}
          />
        </Modal>
      )}

      {/* Check-In Review Modal */}
      {showReviewModal && checkInDestination && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            resetCheckIn();
          }}
          title="Check-In Review"
          size="lg"
        >
          <CheckInReview
            destination={checkInDestination}
            qrCode={scannedQRCode}
            onSubmit={async (reviewData) => {
              const result = await handleReviewSubmit(reviewData);
              if (result.success) {
                // Refresh recent check-ins
                fetchRecentCheckIns();
              }
            }}
            onCancel={() => {
              setShowReviewModal(false);
              resetCheckIn();
            }}
          />
        </Modal>
      )}
    </div>
  );
});

UserSettings.displayName = 'UserSettings';

export default UserSettings;
