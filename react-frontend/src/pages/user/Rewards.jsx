import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoryContext';
import { staggerContainer, slideInFromRight, slideInFromBottom, scaleIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Button from '../../components/common/Button';
import ToastNotification from '../../components/common/ToastNotification';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import Modal from '../../components/common/Modal';
import QRScanner from '../../components/qr/QRScanner';
import CheckInReview from '../../components/user/CheckInReview';
import { useCheckIn } from '../../hooks/useCheckIn.jsx';
import toast from 'react-hot-toast';
import rewardService from '../../services/rewardService';

const Rewards = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout, refreshUser } = useAuth();
  const { categories, loading: categoriesLoading } = useCategories(); // ⚡ Use context - NO repeated API calls
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
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
  
  // ✅ PERFORMANCE: Memoize sidebar collapse handler
  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const [activeCategory, setActiveCategory] = useState('all');
  const [userPoints, setUserPoints] = useState(0);
  const [rewards, setRewards] = useState([]);
  const [redeemedRewards, setRedeemedRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Background fetch indicator
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyRewards, setNearbyRewards] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 rewards per page

  // ⚡ FIX: Define all functions BEFORE useEffect calls
  
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError('Unable to get your location. Please enable location services.');
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: false, // Changed to false for faster response
        timeout: 10000, // Increased timeout to 10 seconds
        maximumAge: 300000 // Cache position for 5 minutes
      }
    );
  }, []);

  // Auto-enable location on mount
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  const fetchUserRedemptions = useCallback(async () => {
    try {
      const response = await rewardService.getUserRedemptions();
      setRedeemedRewards(response.data || response);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  }, []);

  const checkNearbyRewards = useCallback(async () => {
    if (!userLocation) {
      setNearbyRewards([]);
      return;
    }

    try {
      const response = await rewardService.getAvailableAtLocation(
        userLocation.latitude,
        userLocation.longitude
      );
      const nearbyData = response.data?.rewards || [];
      console.log('Nearby rewards response:', nearbyData);
      setNearbyRewards(nearbyData);
    } catch (error) {
      console.error('Error checking nearby rewards:', error);
      setNearbyRewards([]); // On error, assume no nearby rewards
    }
  }, [userLocation]);

  // ⚡ INSTANT LOAD: Fetch rewards from cache, then background update
  const fetchRewards = useCallback(async () => {
    try {
      const rewardData = await rewardService.getAllRewards({ is_active: 1 });
      setRewards(rewardData);
      localStorage.setItem('cached_user_rewards', JSON.stringify({
        data: rewardData,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      if (!rewards.length) {
        toast.error('Failed to load rewards');
      }
    }
  }, [rewards.length]);

  useEffect(() => {
    const loadRewards = () => {
      // INSTANT: Load from cache first
      const cached = localStorage.getItem('cached_user_rewards');
      let shouldFetch = false;
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          setRewards(parsed.data || parsed);
          if (cacheAge > 60000) shouldFetch = true; // Refresh if older than 1 min
        } catch (e) { shouldFetch = true; }
      } else { shouldFetch = true; }
      
      // Background fetch if needed
      if (shouldFetch) {
        setIsFetching(true);
        Promise.all([fetchRewards(), fetchUserRedemptions()])
          .finally(() => setIsFetching(false));
      } else {
        fetchUserRedemptions();
      }
    };
    
    loadRewards();
  }, [fetchRewards, fetchUserRedemptions]);

  useEffect(() => {
    if (userLocation && user) {
      checkNearbyRewards();
    }
  }, [userLocation, user, checkNearbyRewards]);

  useEffect(() => {
    if (user) {
      setUserPoints(user.total_points || 0);
    }
  }, [user]);

  // Helper function to check if reward is redeemable at current location
  const isRewardNearby = (reward) => {
    // If no location or no nearby rewards data, assume not nearby
    if (!userLocation) return false;
    if (!nearbyRewards || nearbyRewards.length === 0) return false;
    
    // Check if this specific reward is in the nearby rewards list
    const isNear = nearbyRewards.some(nr => nr.id === reward.id);
    return isNear;
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const handleRedeem = async (reward) => {
    if (!userLocation) {
      toast.error('Please enable location services to redeem rewards');
      return;
    }

    if (userPoints < reward.points_required) {
      toast.error('Not enough points to redeem this reward');
      return;
    }

    // Check if reward has destinations
    if (!reward.destinations || reward.destinations.length === 0) {
      toast.error('This reward has no available locations');
      return;
    }

    // For now, use the first available destination
    // TODO: Let user select destination if multiple available
    const destination = reward.destinations[0];

    try {
      const response = await rewardService.redeemReward(reward.id, {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        destination_id: destination.destination_id
      });

      toast.success(response.data?.message || 'Reward redeemed successfully!');
      
      // Update local state immediately for instant feedback
      setUserPoints(response.data?.remaining_points || userPoints - reward.points_required);
      
      // Refresh user data from server to sync points
      await refreshUser();
      
      // Refresh data
      fetchRewards();
      fetchUserRedemptions();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to redeem reward';
      toast.error(errorMessage);
      console.error('Redeem error:', error);
    }
  };

  const handleChangeReward = async (redemption, newReward) => {
    if (!userLocation) {
      toast.error('Please enable location services to change rewards');
      return;
    }

    if (!newReward.destinations || newReward.destinations.length === 0) {
      toast.error('This reward has no available locations');
      return;
    }

    const destination = newReward.destinations[0];

    try {
      const response = await rewardService.changeReward(
        redemption.id,
        newReward.id,
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          destination_id: destination.destination_id
        }
      );

      toast.success(response.data?.message || 'Reward changed successfully!');
      
      // Update local state immediately
      setUserPoints(response.data?.remaining_points || userPoints);
      
      // Refresh user data from server
      await refreshUser();
      
      // Refresh data
      fetchRewards();
      fetchUserRedemptions();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change reward';
      toast.error(errorMessage);
      console.error('Change reward error:', error);
    }
  };

  // ⚡ MEMOIZED: Prevent re-filtering on every render
  const filteredRewards = useMemo(() => {
    if (activeCategory === 'all') return rewards;
    
    const categoryId = typeof activeCategory === 'number' ? activeCategory : parseInt(activeCategory);
    return rewards.filter(r => r.category?.id === categoryId);
  }, [rewards, activeCategory]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const paginatedRewards = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRewards.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRewards, currentPage, itemsPerPage]);

  // Reset to page 1 when category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />
      <FetchingIndicator isFetching={isFetching} />
      
      <UserHeader user={user} onLogout={handleLogout} />

      <UserDashboardTabs 
        onCollapseChange={handleSidebarCollapse} 
        onScannerClick={() => {
          console.log('🎥 Camera button clicked! Opening scanner modal...');
          setShowScanModal(true);
          fetchDestinations();
        }}
      />

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-12
        `}
      >
        <motion.h1 
          className="text-3xl font-bold text-slate-900 mb-6"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Adventure
        </motion.h1>

        {/* Location Status Alert */}
        {!userLocation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚠️</span>
              <span className="text-amber-800 font-medium">{locationError || 'Location services disabled'}</span>
            </div>
            <button
              onClick={getUserLocation}
              className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
            >
              Enable Location
            </button>
          </motion.div>
        )}

        <div className="space-y-6">
            {/* Points Balance Card */}
            <motion.div 
              className="bg-gradient-to-r from-orange-500 via-pink-500 to-pink-600 rounded-xl p-6 text-white shadow-md"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/90 text-xs mb-1 font-medium">Your Points Balance</p>
                  <h2 className="text-4xl font-bold mb-1">{userPoints.toLocaleString()}</h2>
                  <p className="text-white/90 text-sm">Keep exploring to earn more points!</p>
                </div>
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <span className="text-4xl">🎁</span>
                </div>
              </div>
            </motion.div>

            {/* Browse Rewards Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-4 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Browse Rewards</h3>
              </div>
              
              <div className="p-4">
              
                {categoriesLoading ? (
                  <div className="flex gap-3 mb-6 overflow-x-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-10 bg-slate-200 rounded-lg animate-pulse flex-shrink-0" style={{width: '120px'}}></div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="flex gap-2 mb-4 overflow-x-auto pb-2 category-scrollbar"
                    style={{
                      scrollbarWidth: 'thin',
                      scrollbarColor: 'rgba(148, 163, 184, 0.3) transparent'
                    }}
                  >
                    <style>{`
                      .category-scrollbar::-webkit-scrollbar {
                        height: 6px;
                      }
                      .category-scrollbar::-webkit-scrollbar-track {
                        background: transparent;
                      }
                      .category-scrollbar::-webkit-scrollbar-thumb {
                        background: rgba(148, 163, 184, 0.3);
                        border-radius: 10px;
                      }
                      .category-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: rgba(148, 163, 184, 0.5);
                      }
                    `}</style>
                    <button
                      onClick={() => setActiveCategory('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                        activeCategory === 'all'
                          ? 'bg-teal-500 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      All Rewards
                    </button>
                    {categories.map((category) => (
                      <button
                        key={`category-${category.id}`}
                        onClick={() => setActiveCategory(category.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                          activeCategory === category.id
                            ? 'bg-teal-500 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Rewards Grid */}
                {loading ? (
                  <div className="text-center py-16">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                    <p className="text-slate-600 mt-4">Loading rewards...</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedRewards.map((reward) => {
                        const isNearby = isRewardNearby(reward);
                        const hasEnoughPoints = userPoints >= reward.points_required;
                        // Count how many times user has redeemed this specific reward
                        const redemptionCount = redeemedRewards.filter(r => r.reward_id === reward.id && r.status === 'active').length;
                        const isRedeemed = redemptionCount >= (reward.max_redemptions_per_user || 1);
                        const canRedeem = userLocation && isNearby && hasEnoughPoints && !isRedeemed;
                        
                        return (
                          <div key={reward.id} className={`border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-teal-300 transition-all duration-200 bg-white flex flex-col h-full ${isRedeemed ? 'opacity-75' : ''}`}>
                            <div className="flex justify-center mb-3 relative">
                              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                                <span className="text-3xl">🎁</span>
                              </div>
                              {isRedeemed && (
                                <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold shadow-md">
                                  ✓ Redeemed
                                </div>
                              )}
                            </div>
                            
                            <div className="flex-1 flex flex-col">
                              <h4 className="font-semibold text-slate-900 mb-2 text-base text-center">{reward.title}</h4>
                              <p className="text-sm text-slate-600 mb-3 line-clamp-2 text-center">{reward.description}</p>
                              
                              {reward.destinations && reward.destinations.length > 0 && (
                                <div className="text-xs text-slate-500 mb-2 flex items-start gap-1 justify-center">
                                  <span className="flex-shrink-0">📍</span>
                                  <span className="line-clamp-1">{reward.destinations.map(d => d.name).join(', ')}</span>
                                </div>
                              )}
                              
                              {!isNearby && userLocation && (
                                <div className="text-xs text-amber-700 bg-amber-50 px-2 py-1.5 rounded-md mb-3 flex items-center gap-1 justify-center">
                                  <span>⚠️</span>
                                  <span>Too far</span>
                                </div>
                              )}
                              
                              <div className="mt-auto space-y-2">
                                <div className="text-center">
                                  <span className="text-xl font-bold text-orange-500">{reward.points_required} pts</span>
                                </div>
                                <Button
                                  variant={canRedeem ? "primary" : "outline"}
                                  size="sm"
                                  onClick={() => handleRedeem(reward)}
                                  disabled={!canRedeem}
                                  className="w-full text-xs"
                                >
                                  {isRedeemed ? '✓ Already Redeemed' :
                                   !userLocation ? '📍 Enable Location' : 
                                   !isNearby ? '🚫 Too Far' :
                                   !hasEnoughPoints ? '🔒 Not Enough Points' : 
                                   'Redeem'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-slate-700 text-sm"
                        >
                          ← Previous
                        </button>
                        
                        <div className="flex gap-2">
                          {[...Array(totalPages)].map((_, index) => (
                            <button
                              key={index + 1}
                              onClick={() => setCurrentPage(index + 1)}
                              className={`w-9 h-9 rounded-lg font-semibold transition-all text-sm ${
                                currentPage === index + 1
                                  ? 'bg-teal-500 text-white shadow-sm'
                                  : 'bg-white border border-slate-300 hover:bg-slate-50 text-slate-700'
                              }`}
                            >
                              {index + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-medium text-slate-700 text-sm"
                        >
                          Next →
                        </button>
                      </div>
                    )}
                </>
              )}

                {filteredRewards.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <span className="text-6xl mb-4 block">🎁</span>
                    <p className="text-slate-600 text-lg">No rewards in this category</p>
                  </div>
                )}
              </div>
            </div>

            {/* Redeemed Rewards - Compact Elegant Design */}
            {redeemedRewards.length > 0 && (
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-4 border border-slate-200 shadow-md">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">My Redeemed Rewards</h3>
                    <p className="text-xs text-slate-500">{redeemedRewards.length} reward{redeemedRewards.length > 1 ? 's' : ''}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {redeemedRewards.map((redemption) => {
                    const statusConfig = {
                      active: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Active' },
                      used: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '✓', label: 'Used' },
                      expired: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Expired' },
                      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏱', label: 'Pending' }
                    };
                    const status = statusConfig[redemption.status] || statusConfig.pending;
                    
                    return (
                      <motion.div 
                        key={redemption.id} 
                        variants={scaleIn}
                        className="group bg-white rounded-lg p-3 border border-slate-200 hover:border-teal-300 hover:shadow-lg transition-all duration-300"
                      >
                        {/* Header with Status */}
                        <div className="flex items-start justify-between mb-2.5">
                          <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 flex-1 pr-2">
                            {redemption.reward?.title}
                          </h4>
                          <span className={`${status.bg} ${status.text} px-2 py-0.5 rounded-full text-xs font-bold whitespace-nowrap`}>
                            {status.icon} {status.label}
                          </span>
                        </div>

                        {/* Redemption Code */}
                        <div className="bg-slate-50 rounded-md p-2 mb-2 border border-slate-100">
                          <p className="text-xs text-slate-500 mb-0.5">Code</p>
                          <p className="font-mono font-bold text-xs text-slate-900 tracking-wide">
                            {redemption.redemption_code}
                          </p>
                        </div>

                        {/* Compact Info */}
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div>
                            <span className="text-slate-500">Points: </span>
                            <span className="font-bold text-teal-700">{redemption.points_spent}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Valid: </span>
                            <span className="font-semibold text-blue-700">
                              {new Date(redemption.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        
                        {/* Change Reward - Compact */}
                        {['active', 'pending'].includes(redemption.status) && userLocation && (
                          <div className="pt-2 border-t border-slate-100">
                            <select
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-md text-xs focus:border-teal-400 focus:ring-1 focus:ring-teal-100 outline-none transition-all bg-white"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const newReward = rewards.find(r => r.id === parseInt(e.target.value));
                                  if (newReward && window.confirm(`Change to "${newReward.title}"? Point difference: ${newReward.points_required - redemption.points_spent} pts`)) {
                                    handleChangeReward(redemption, newReward);
                                  }
                                  e.target.value = '';
                                }
                              }}
                              defaultValue=""
                            >
                              <option value="">🔄 Change reward...</option>
                              {rewards
                                .filter(r => r.id !== redemption.reward_id && r.destinations?.length > 0)
                                .map(r => (
                                  <option key={r.id} value={r.id}>
                                    {r.title} ({r.points_required} pts)
                                  </option>
                                ))
                              }
                            </select>
                            <p className="text-xs text-slate-400 mt-1">💡 Within 100m of destination</p>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
        </div>
      </main>

      {/* QR Scanner Modal */}
      {showScanModal && (
        <Modal
          isOpen={showScanModal}
          onClose={() => {
            console.log('🚪 Closing scanner modal');
            setShowScanModal(false);
          }}
          title="Scan QR Code"
          size="lg"
        >
          <QRScanner
            onScanSuccess={(qrCode) => {
              console.log('✅ QR Code scanned:', qrCode);
              handleScanSuccess(qrCode, destinations);
            }}
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
                // Refresh user points after check-in
                if (refreshUser) refreshUser();
                fetchUserRewards();
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

Rewards.displayName = 'UserRewards';

export default Rewards;
