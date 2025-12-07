import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { useCheckIn } from '../../hooks/useCheckIn.jsx';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import QRScanner from '../../components/qr/QRScanner';
import CheckInReview from '../../components/user/CheckInReview';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import ToastNotification from '../../components/common/ToastNotification';
import SkeletonLoader from '../../components/common/SkeletonLoader';
// ⚡ REACT QUERY - INSTANT CACHED LOADING (TikTok/Facebook speed)
import { useCheckins, useCheckinStats } from '../../hooks/useUserData';

// ⚡ INSTANT LOADING CHECK-IN - React Query (TikTok/Facebook speed)
const CheckIn = React.memo(() => {
  console.log('🎯 CheckIn Component Rendering...');
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userLocation } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // ⚡ REACT QUERY - INSTANT from cache
  console.log('🔄 Calling useCheckins...');
  const { data: checkinsData, isLoading: loadingCheckIns, refetch: refetchCheckins, error: checkinsError } = useCheckins(10);
  console.log('🔄 Calling useCheckinStats...');
  const { data: statsData, isLoading: loadingStats, refetch: refetchStats, error: statsError } = useCheckinStats();
  
  console.log('📊 After hook calls - checkinsData:', checkinsData, 'statsData:', statsData);
  
  // Debug logging
  useEffect(() => {
    console.log('📊 CheckIn Data:');
    console.log('  - checkinsData:', JSON.stringify(checkinsData, null, 2));
    console.log('  - statsData:', JSON.stringify(statsData, null, 2));
    console.log('  - loadingCheckIns:', loadingCheckIns);
    console.log('  - loadingStats:', loadingStats);
    console.log('  - checkinsError:', checkinsError);
    console.log('  - statsError:', statsError);
  }, [checkinsData, statsData, loadingCheckIns, loadingStats, checkinsError, statsError]);
  
  const recentCheckIns = checkinsData?.checkins || [];
  const stats = {
    today: statsData?.today || 0,
    this_week: statsData?.this_week || 0,
    this_month: statsData?.this_month || 0,
    all_time: statsData?.total_visits || statsData?.all_time || 0
  };
  
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
  
  // Debug modal state
  useEffect(() => {
    console.log('📸 Scan Modal State:', showScanModal);
    console.log('📸 setShowScanModal function:', typeof setShowScanModal);
  }, [showScanModal, setShowScanModal]);

  const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:8000/api'
    : `http://${window.location.hostname}:8000/api`;

  // ⚡ INSTANT: Load destinations in background
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // ✅ PERFORMANCE: Memoize logout handler
  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate('/');
  }, [logout, navigate]);

  // ✅ PERFORMANCE: Memoize sidebar collapse handler
  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const onScanSuccess = (qrCode) => {
    handleScanSuccess(qrCode, destinations);
  };

  const onReviewSubmit = async (reviewData) => {
    const result = await handleReviewSubmit(reviewData);
    if (result.success) {
      // Refresh stats and recent check-ins with React Query
      refetchStats();
      refetchCheckins();
    }
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>
      
      <ToastNotification />
      <UserDashboardTabs 
        onCollapseChange={handleSidebarCollapse}
        onScannerClick={() => setShowScanModal(true)}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header - Full Width */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Check-In</h1>
                <p className="text-sm text-teal-50 mt-1">Scan QR codes to check in and earn points</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Main Check-In Area */}
          <div 
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            {/* QR Scanner Card */}
            <div 
              className="bg-white rounded-2xl p-6 sm:p-8 border border-cyan-200 text-center shadow-sm hover:shadow-lg transition-shadow duration-150 animate-fade-in relative z-10"
              style={{ animationDelay: '50ms' }}
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-lg shadow-emerald-500/30">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Scan QR Code</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Point your camera at a location QR code to check in and earn points</p>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🎯 Start Scanning clicked! Current state:', showScanModal);
                  setShowScanModal(true);
                  console.log('🎯 After setState, should be true');
                }}
                style={{ position: 'relative', zIndex: 100, pointerEvents: 'auto' }}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 text-lg bg-teal-500 hover:bg-teal-600 text-white rounded-lg shadow-sm hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 cursor-pointer"
              >
                <svg className="w-5 h-5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="pointer-events-none">Start Scanning</span>
              </button>
            </div>

            {/* Recent Check-Ins */}
            <div 
              className="bg-white rounded-2xl p-4 sm:p-6 border border-teal-200 shadow-sm hover:shadow-md transition-shadow duration-150 animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Recent Check-Ins</h3>
              
              <div className="space-y-3">
                {loadingCheckIns ? (
                  <div className="space-y-3">
                    <SkeletonLoader type="card" count={3} />
                  </div>
                ) : recentCheckIns.length > 0 ? (
                  recentCheckIns.map((checkIn, index) => (
                    <div key={checkIn.id || `checkin-${index}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-cyan-200 gap-3 sm:gap-0 hover:shadow-sm transition-shadow duration-75">
                      <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">{checkIn.location}</h4>
                          <p className="text-xs sm:text-sm text-gray-600">{checkIn.time}</p>
                        </div>
                      </div>
                      <div className="text-right w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                        <p className="text-base sm:text-lg font-bold text-emerald-600">+{checkIn.points} pts</p>
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Success
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">No check-ins yet</p>
                    <p className="text-xs mt-1">Scan a QR code to get started!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div 
            className="space-y-4 sm:space-y-6"
          >
            {/* Check-In Stats */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-sm hover:shadow-lg transition-shadow duration-150 animate-fade-in" style={{ animationDelay: '75ms' }}>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Check-In Stats</h3>
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700">Today</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.today}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700">This Week</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.this_week}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700">This Month</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.this_month}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base text-gray-700">All Time</span>
                  <span className="text-xl sm:text-2xl font-bold text-emerald-600">{stats.all_time}</span>
                </div>
              </div>
            </div>

            {/* How to Check-In */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-150 animate-fade-in" style={{ animationDelay: '125ms' }}>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">How to Check-In</h3>
              
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    1
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">Visit a TravelQuest destination</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    2
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">Find the QR code at the location</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    3
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">Scan the code to earn points</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm sm:text-base">
                    4
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-700">Collect rewards and badges!</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Status */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 sm:p-6 border border-emerald-200 shadow-sm hover:shadow-lg transition-shadow duration-150 animate-fade-in" style={{ animationDelay: '175ms' }}>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Location Status</h3>
              
              {userLocation ? (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Location Active</p>
                    <p className="text-xs text-gray-600">GPS enabled and tracking</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm sm:text-base">Location Disabled</p>
                    <p className="text-xs text-gray-600">Please enable GPS</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        </main>
      </div>

      {/* QR Scanner Modal */}
      {showScanModal && (
        <Modal
          isOpen={showScanModal}
          onClose={() => setShowScanModal(false)}
          title="Scan QR Code"
          titleIcon="📷"
        >
          <QRScanner onScanSuccess={onScanSuccess} />
        </Modal>
      )}

      {/* Check-in Review Modal */}
      {showReviewModal && checkInDestination && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            resetCheckIn();
          }}
          title="Check-in & Review"
          titleIcon="✍️"
          size="md"
        >
          <CheckInReview
            destination={checkInDestination}
            scannedQRCode={scannedQRCode}
            onSubmit={onReviewSubmit}
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

CheckIn.displayName = 'CheckIn';

export default CheckIn;
