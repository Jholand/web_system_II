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
import MilestoneCard from '../../components/user/MilestoneCard';
import AccountStats from '../../components/user/AccountStats';
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

  const progressToNextLevel = 40;
  const pointsToNextLevel = 1635;

  const milestoneData = {
    icon: '🌍',
    name: 'Globetrotter',
    description: 'Visit 20 destinations',
    current: 12,
    total: 20,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative">
      {/* Tourism Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.02]" style={{ 
          backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)', 
          backgroundSize: '40px 40px' 
        }} />
      </div>
      
      <ToastNotification />
      <UserHeader user={user} onLogout={handleLogout} />
      <UserDashboardTabs onCollapseChange={handleSidebarCollapse} onScannerClick={handleScannerClick} />

      {/* Main Content - Zero Animation Delay */}
      <main 
        className={`relative z-10 transition-all duration-150 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-32 sm:pb-20 md:pb-8">
          
          {/* Page Header - Instant Render */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-100">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    My Dashboard
                  </h1>
                  <p className="text-sm text-gray-600">
                    Track your adventures and explore new destinations
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Page Title */}
          <h2 className="text-2xl sm:text-3xl font-light text-gray-900 mb-6 sm:mb-8 animate-slide-up">
            Your Adventure
          </h2>

          {/* Content Grid - Instant Render */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            
            {/* Left Column - Profile & Activity */}
            <div className="lg:col-span-2 space-y-4 sm:space-y-6">
              
              {/* Profile Card */}
              <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
                <ProfileCard
                  userName={`${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'User'}
                  userLevel={`Level ${user?.level || 1}`}
                  memberSince={user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'New Member'}
                  totalPoints={stats.totalPoints}
                  progress={progressToNextLevel}
                  pointsToNext={pointsToNextLevel}
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

              {/* Next Milestone */}
              <div className="animate-fade-in" style={{ animationDelay: '125ms' }}>
                <MilestoneCard milestone={milestoneData} />
              </div>

              {/* Account Stats */}
              <div className="animate-fade-in" style={{ animationDelay: '175ms' }}>
                <AccountStats stats={stats} />
              </div>
            </div>
          </div>
        </div>
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
