import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ToastNotification from '../../components/common/ToastNotification';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Modal from '../../components/common/Modal';
import QRScanner from '../../components/qr/QRScanner';
import CheckInReview from '../../components/user/CheckInReview';
import { useCheckIn } from '../../hooks/useCheckIn.jsx';
import ProfileCard from '../../components/user/ProfileCard';
import BadgesSection from '../../components/user/BadgesSection';
import AdventureTimeline from '../../components/user/AdventureTimeline';
import QuickStats from '../../components/user/QuickStats';
import DestinationsTabs from '../../components/user/DestinationsTabs';
import AccountStats from '../../components/user/AccountStats';
import SkeletonLoader from '../../components/common/SkeletonLoader';
// ⚡ REACT QUERY - INSTANT CACHED LOADING (TikTok/Facebook speed)
import { useUserBadges, useCheckins, useCheckinStats, usePrefetchUserData } from '../../hooks/useUserData';

// ⚡ INSTANT LOADING DASHBOARD - React Query (TikTok/Facebook speed)
const UserDashboard = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // ⚡ REACT QUERY - INSTANT from cache, refetch in background
  const { data: badgesData, isLoading: badgesLoading } = useUserBadges();
  const { data: checkinsData, isLoading: checkinsLoading } = useCheckins(5);
  const { data: statsData, isLoading: statsLoading } = useCheckinStats();
  const { prefetchAll } = usePrefetchUserData();
  
  // Extract data with fallbacks
  const visits = checkinsData?.checkins || [];
  const badges = badgesData?.earned || [];
  const stats = {
    totalVisits: statsData?.total_visits || 0,
    totalPoints: statsData?.total_points || 0,
    badgesEarned: statsData?.badges_earned || 0,
    rewardsRedeemed: 0,
    reviewsLeft: 0,
    currentStreak: statsData?.current_streak || 0,
    memberMonths: 0,
    avgPointsWeek: 0,
    totalReviews: 0,
  };
  
  const dataFetched = !badgesLoading && !checkinsLoading && !statsLoading;
  
  // Prefetch all user data on mount
  useEffect(() => {
    prefetchAll();
  }, []);
  
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

  // ✅ Optimized data fetching - Background refresh only
  // Prefetch destinations on mount
  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate('/');
  }, [logout, navigate]);

  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleScannerClick = useCallback(() => {
    setShowScanModal(true);
  }, []);

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background Pattern */}
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
      <UserDashboardTabs onCollapseChange={handleSidebarCollapse} onScannerClick={handleScannerClick} />

      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header - Full Width */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
                <p className="text-sm text-teal-50 mt-1">Track your adventures and explore new destinations</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          {/* Stats Cards */}
          {statsLoading ? (
            <SkeletonLoader type="stats" count={4} />
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Total Visits */}
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-100 mb-1">Total Visits</p>
                  <p className="text-4xl font-bold">{stats.totalVisits}</p>
                  <p className="text-xs text-teal-100 mt-1">Places explored</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Total Points */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Total Points</p>
                  <p className="text-4xl font-bold">{stats.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-blue-100 mt-1">Points earned</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Badges Earned */}
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 mb-1">Badges Earned</p>
                  <p className="text-4xl font-bold">{stats.badgesEarned}</p>
                  <p className="text-xs text-purple-100 mt-1">Achievements unlocked</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100 mb-1">Current Streak</p>
                  <p className="text-4xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-orange-100 mt-1">Days in a row</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Left Column - Profile & Activity */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              {/* Profile Card */}
              <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                <ProfileCard
                  userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                  memberSince={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New Member'}
                  totalPoints={stats.totalPoints}
                />
              </div>

              {/* Badges Section */}
              <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                <BadgesSection badges={badges} />
              </div>

              {/* Adventure Timeline */}
              <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <AdventureTimeline visits={visits} totalVisits={stats.totalVisits} />
              </div>
            </div>

            {/* Right Column - Stats & Milestones */}
            <div className="space-y-4 sm:space-y-6">
              {/* Quick Stats */}
              <div className="animate-fade-in" style={{ animationDelay: '75ms' }}>
                <QuickStats stats={stats} />
              </div>

              {/* Destinations Tabs (Saved & Nearby) */}
              <div className="animate-fade-in" style={{ animationDelay: '125ms' }}>
                <DestinationsTabs />
              </div>

              {/* Account Stats */}
              <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
                <AccountStats stats={stats} />
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
              onSubmit={handleReviewSubmit}
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

UserDashboard.displayName = 'UserDashboard';

export default UserDashboard;
