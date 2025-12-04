import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Star, Award, TrendingUp, Calendar, Gift } from 'lucide-react';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import ToastNotification from '../../components/common/ToastNotification';
import Modal from '../../components/common/Modal';
import QRScanner from '../../components/qr/QRScanner';
import CheckInReview from '../../components/user/CheckInReview';
import { useCheckIn } from '../../hooks/useCheckIn.jsx';
import toast from 'react-hot-toast';
// ⚡ REACT QUERY - INSTANT CACHED LOADING (TikTok/Facebook speed)
import { useUserBadges } from '../../hooks/useUserData';

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`;

const UserBadges = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // ⚡ REACT QUERY - INSTANT from cache
  const { data: badgesData, isLoading, refetch: refetchBadges } = useUserBadges();
  const earnedBadges = badgesData?.earned || [];
  const lockedBadges = badgesData?.locked || [];
  const summary = badgesData?.summary || { total_earned: 0, total_available: 0, total_points_from_badges: 0 };
  
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
  
  const [filter, setFilter] = useState('all'); // all, earned, locked
  const [rarityFilter, setRarityFilter] = useState('all'); // all, common, rare, epic, legendary
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6); // 6 badges per page

  // ✅ Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filter, rarityFilter]);

  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate('/');
  }, [logout, navigate]);

  // ✅ PERFORMANCE: Memoize sidebar collapse handler
  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const handleScannerClick = useCallback(() => {
    setShowScanModal(true);
  }, [setShowScanModal]);

  const getRarityColor = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      case 'common':
      default:
        return 'from-slate-400 to-slate-500';
    }
  };

  const getRarityBorder = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'border-yellow-400 shadow-yellow-200';
      case 'epic':
        return 'border-purple-400 shadow-purple-200';
      case 'rare':
        return 'border-blue-400 shadow-blue-200';
      case 'common':
      default:
        return 'border-slate-300 shadow-slate-200';
    }
  };

  const getRarityText = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'text-yellow-600';
      case 'epic':
        return 'text-purple-600';
      case 'rare':
        return 'text-blue-600';
      case 'common':
      default:
        return 'text-slate-600';
    }
  };

  const filteredEarnedBadges = earnedBadges.filter(item => {
    if (rarityFilter !== 'all' && item.badge?.rarity?.toLowerCase() !== rarityFilter) return false;
    return true;
  });

  const filteredLockedBadges = lockedBadges.filter(badge => {
    if (rarityFilter !== 'all' && badge.rarity?.toLowerCase() !== rarityFilter) return false;
    return true;
  });

  const allDisplayBadges = filter === 'earned' 
    ? filteredEarnedBadges 
    : filter === 'locked' 
    ? filteredLockedBadges 
    : [...filteredEarnedBadges, ...filteredLockedBadges.map(b => ({ badge: b, is_earned: false }))];

  // Pagination
  const totalPages = Math.ceil(allDisplayBadges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayBadges = allDisplayBadges.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

      {/* Main Content */}
      <main 
        className={`relative z-10 transition-all duration-150 ${
          sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
        } max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 md:pt-28 pb-32 sm:pb-20 md:pb-8`}
      >
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                  <Award className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Badge Collection
                  </h1>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Track your achievements and unlock exclusive badges
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  refetchBadges();
                  if (refreshUser) refreshUser();
                  toast.success('Refreshing badges...');
                }}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg transition-all duration-75 shadow-md hover:shadow-lg active:scale-95"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline font-semibold">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 animate-fade-in" style={{ animationDelay: '50ms' }}>
          <div className="group bg-white rounded-2xl p-6 border border-amber-100 shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                <Award className="w-6 h-6 text-amber-600" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Badges Earned</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                {summary.total_earned}
              </p>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-6 border border-purple-100 shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                <Lock className="w-6 h-6 text-purple-600" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Locked Badges</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-600 bg-clip-text text-transparent">
                {(summary?.total_available || 0) - (summary?.total_earned || 0)}
              </p>
            </div>
          </div>
          
          <div className="group bg-white rounded-2xl p-6 border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-150 hover:-translate-y-0.5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center transition-transform duration-150 group-hover:scale-110">
                <Gift className="w-6 h-6 text-emerald-600" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Points from Badges</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                {summary.total_points_from_badges?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 mb-6 shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Status Filter */}
            <div className="flex gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-75 flex-1 sm:flex-none active:scale-95 ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({summary.total_available})
              </button>
              <button
                onClick={() => setFilter('earned')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-75 flex-1 sm:flex-none active:scale-95 ${
                  filter === 'earned'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Earned ({summary.total_earned})
              </button>
              <button
                onClick={() => setFilter('locked')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-75 flex-1 sm:flex-none active:scale-95 ${
                  filter === 'locked'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/30'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Locked ({summary.total_available - summary.total_earned})
              </button>
            </div>

            {/* Rarity Filter */}
            <select
              value={rarityFilter}
              onChange={(e) => setRarityFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-auto"
            >
              <option value="all">All Rarities</option>
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
            </select>
          </div>
        </div>

        {/* Badges Grid */}
        {displayBadges.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100 animate-fade-in" style={{ animationDelay: '150ms' }}>
            <Award className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Badges Found</h3>
            <p className="text-gray-600">Try adjusting your filters or start earning badges by visiting destinations!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 animate-fade-in" style={{ animationDelay: '150ms' }}>
            {displayBadges.map((item, index) => {
              const badge = item.badge || item;
              const isEarned = item.is_earned === true;
              const progress = badge.progress || item.progress || 0;
              const requirement = badge.requirement_value || 100;
              const percentage = Math.min((progress / requirement) * 100, 100);
              
              return (
                <div
                  key={badge.id || index}
                  className={`
                    bg-white rounded-2xl p-6 border-2 shadow-lg relative overflow-hidden transition-all duration-150 hover:-translate-y-1
                    ${isEarned 
                      ? `${getRarityBorder(badge.rarity)} hover:shadow-xl` 
                      : 'border-gray-200 opacity-75 hover:opacity-90'
                    }
                  `}
                >
                  {/* Rarity Gradient Background */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(badge.rarity)}`}></div>
                  
                  {/* Locked Indicator */}
                  {!isEarned && (
                    <div className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full">
                      <Lock className="w-5 h-5 text-white" strokeWidth={2} />
                    </div>
                  )}

                  {/* Earned Star Indicator */}
                  {isEarned && (
                    <div className="absolute top-4 right-4 p-2 bg-black/30 backdrop-blur-sm rounded-full">
                      <Star className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  )}

                  {/* Badge Icon */}
                  <div className={`mb-4 flex items-center justify-center ${!isEarned ? 'grayscale opacity-50' : ''}`}>
                    {badge.icon_url ? (
                      badge.icon_url.startsWith('http') ? (
                        <img 
                          src={badge.icon_url} 
                          alt={badge.name} 
                          className="w-20 h-20 object-contain rounded-lg"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                      ) : (
                        <span className="text-6xl">{badge.icon_url}</span>
                      )
                    ) : (
                      <span className="text-6xl">{badge.icon || '🏆'}</span>
                    )}
                    <span className="text-6xl" style={{display: 'none'}}>🏆</span>
                  </div>

                  {/* Badge Name */}
                  <h3 className="font-bold text-slate-900 text-lg mb-2 text-center">
                    {badge.name || 'Unknown Badge'}
                  </h3>

                  {/* Badge Description */}
                  <p className="text-sm text-slate-600 mb-3 text-center min-h-[40px]">
                    {badge.description || 'No description available'}
                  </p>

                  {/* Rarity & Category */}
                  <div className="flex items-center justify-center gap-2 mb-3">
                    {badge.category?.category_name && (
                      <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded-full">
                        {badge.category.category_name}
                      </span>
                    )}
                    <span className={`text-xs font-bold ${getRarityText(badge.rarity)} uppercase`}>
                      {badge.rarity || 'Common'}
                    </span>
                  </div>

                  {/* Requirement Type Display */}
                  {badge.requirement_type && (
                    <div className="mb-3 px-3 py-2 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
                        {badge.requirement_type === 'visits' && (
                          <>
                            <span>📍</span>
                            <span>{requirement} Visits Required</span>
                          </>
                        )}
                        {badge.requirement_type === 'points' && (
                          <>
                            <span>🪙</span>
                            <span>{requirement} Points Required</span>
                          </>
                        )}
                        {badge.requirement_type === 'checkins' && (
                          <>
                            <span>✅</span>
                            <span>{requirement} Check-ins Required</span>
                          </>
                        )}
                        {badge.requirement_type === 'categories' && (
                          <>
                            <span>🗂️</span>
                            <span>{requirement} Categories Required</span>
                          </>
                        )}
                        {badge.requirement_type === 'custom' && (
                          <>
                            <span>⭐</span>
                            <span>Special Requirement</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar for Locked Badges */}
                  {!isEarned && badge.requirement_type && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-slate-600 mb-1">
                        <span>Progress</span>
                        <span>{progress} / {requirement}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full bg-gradient-to-r ${getRarityColor(badge.rarity)} transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Points Reward */}
                  <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-200">
                    <Gift className={`w-4 h-4 ${isEarned ? 'text-orange-500' : 'text-slate-400'}`} />
                    <span className={`font-bold ${isEarned ? 'text-orange-600' : 'text-slate-500'}`}>
                      {badge.points_reward || 0} pts
                    </span>
                  </div>

                  {/* Earned Date */}
                  {isEarned && item.earned_at && (
                    <div className="flex items-center justify-center gap-2 mt-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Earned {new Date(item.earned_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8 animate-fade-in" style={{ animationDelay: '200ms' }}>
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${currentPage === 1 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-200 shadow-sm hover:shadow'
                }
              `}
            >
              Previous
            </button>

            {/* Page Numbers */}
            <div className="flex gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                if (
                  page === 1 || 
                  page === totalPages || 
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`
                        w-10 h-10 rounded-lg font-bold transition-all duration-200
                        ${currentPage === page
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600 text-white shadow-lg'
                          : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                        }
                      `}
                    >
                      {page}
                    </button>
                  );
                } else if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page} className="flex items-center px-2 text-slate-400">...</span>;
                }
                return null;
              })}
            </div>

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`
                px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${currentPage === totalPages 
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-white text-teal-600 hover:bg-teal-50 border border-teal-200 shadow-sm hover:shadow'
                }
              `}
            >
              Next
            </button>
          </div>
        )}

        {/* Showing text */}
        {!isLoading && allDisplayBadges.length > 0 && (
          <p className="text-center text-sm text-gray-600 mt-4">
            Showing {startIndex + 1} - {Math.min(endIndex, allDisplayBadges.length)} of {allDisplayBadges.length} badges
          </p>
        )}
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
                // Refresh badges after check-in with React Query
                refetchBadges();
                if (refreshUser) refreshUser();
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

export default UserBadges;
