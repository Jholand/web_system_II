  import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Gift, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCategories } from '../../contexts/CategoryContext';
import { staggerContainer, slideInFromRight, slideInFromBottom, scaleIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Button from '../../components/common/Button';
import ToastNotification from '../../components/common/ToastNotification';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import SkeletonLoader from '../../components/common/SkeletonLoader';
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
  const [loading, setLoading] = useState(false); // ⚡ START FALSE - instant!
  const [isFetching, setIsFetching] = useState(false); // Background fetch indicator
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [showDestinationModal, setShowDestinationModal] = useState(false);
  const [pendingReward, setPendingReward] = useState(null);
  const [pendingRedemption, setPendingRedemption] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 rewards per page

  // ⚡ Location services removed - not needed for redemption

  const fetchUserRedemptions = useCallback(async () => {
    try {
      const response = await rewardService.getUserRedemptions();
      setRedeemedRewards(response.data || response);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
    }
  }, []);



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
      // ⚡ F1 SPEED: INSTANT cache load - 0ms loading!
      const cached = localStorage.getItem('cached_user_rewards');
      let shouldFetch = false;
      let hasCache = false;
      
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          const TTL = 60 * 60 * 1000; // ⚡ 1 HOUR CACHE - EXTREME SPEED!
          const rewardData = parsed.data || parsed;
          
          if (cacheAge < TTL && rewardData && rewardData.length > 0) {
            // ⚡ INSTANT: Load from cache (0ms!)
            setRewards(rewardData);
            hasCache = true;
            setLoading(false); // ⚡ NO LOADING - INSTANT!
            
            // Background refresh only if older than 30 min
            if (cacheAge > 30 * 60 * 1000) shouldFetch = true;
          } else {
            shouldFetch = true;
          }
        } catch (e) { 
          shouldFetch = true; 
        }
      } else { 
        shouldFetch = true; 
      }
      
      // Background fetch if needed
      if (shouldFetch) {
        setIsFetching(hasCache); // Only show fetching if we have cache
        Promise.all([fetchRewards(), fetchUserRedemptions()])
          .finally(() => {
            setIsFetching(false);
            setLoading(false);
          });
      } else {
        fetchUserRedemptions();
      }
    };
    
    loadRewards();
  }, [fetchRewards, fetchUserRedemptions]);



  useEffect(() => {
    if (user) {
      setUserPoints(user.total_points || 0);
    }
  }, [user]);

  // ⚡ Location not required - all rewards can be redeemed anywhere
  const isRewardNearby = (reward) => {
    // All rewards available if they have destinations
    return reward.destinations && reward.destinations.length > 0;
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/');
  };

  const handleRedeem = async (reward) => {
    if (userPoints < reward.points_required) {
      toast.error('Not enough points to redeem this reward');
      return;
    }

    // Check if reward has destinations
    if (!reward.destinations || reward.destinations.length === 0) {
      toast.error('This reward has no available locations');
      return;
    }

    // Show destination selection modal
    setPendingReward(reward);
    setPendingRedemption(null);
    setShowDestinationModal(true);
  };

  const confirmRedeem = async (destinationId) => {
    if (!pendingReward) return;

    console.log('🎁 Redeeming reward:', {
      reward_id: pendingReward.id,
      reward_title: pendingReward.title,
      destination_id: destinationId
    });

    try {
      const response = await rewardService.redeemReward(pendingReward.id, destinationId);
      
      console.log('✅ Redemption response:', response);

      toast.success(response.data?.message || 'Reward redeemed successfully!');
      
      // Update local state immediately for instant feedback
      setUserPoints(response.data?.remaining_points || userPoints - pendingReward.points_required);
      
      // Refresh user data from server to sync points
      await refreshUser();
      
      // Refresh data
      fetchRewards();
      fetchUserRedemptions();
      
      // Close modal
      setShowDestinationModal(false);
      setPendingReward(null);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to redeem reward';
      toast.error(errorMessage);
      console.error('Redeem error:', error);
    }
  };

  const handleChangeReward = async (redemption, newReward) => {
    if (!newReward.destinations || newReward.destinations.length === 0) {
      toast.error('This reward has no available locations');
      return;
    }

    // Show destination selection modal
    setPendingReward(newReward);
    setPendingRedemption(redemption);
    setShowDestinationModal(true);
  };

  const confirmChangeReward = async (destinationId) => {
    if (!pendingReward || !pendingRedemption) return;

    try {
      const response = await rewardService.changeReward(
        pendingRedemption.id,
        pendingReward.id,
        destinationId
      );

      toast.success(response.data?.message || 'Reward changed successfully!');
      
      // Update local state immediately
      setUserPoints(response.data?.remaining_points || userPoints);
      
      // Refresh user data from server
      await refreshUser();
      
      // Refresh data
      fetchRewards();
      fetchUserRedemptions();
      
      // Close modal
      setShowDestinationModal(false);
      setPendingReward(null);
      setPendingRedemption(null);
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
      <FetchingIndicator isFetching={isFetching} />
      
      {/* Main Content Container - blur only (keep clicks active) */}
      <div className={`transition-all duration-300 ${showScanModal || showRedeemModal || showDestinationModal ? 'blur-sm' : ''}`}>
      
      <UserDashboardTabs 
        onCollapseChange={handleSidebarCollapse} 
        onScannerClick={() => {
          console.log('🎥 Camera button clicked! Opening scanner modal...');
          setShowScanModal(true);
          fetchDestinations();
        }}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Gift className="w-7 h-7 text-white drop-shadow" strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">Rewards</h1>
                  <p className="text-sm text-teal-50 mt-1">Redeem your points for exciting rewards</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/30">
                <Star className="w-5 h-5 text-yellow-300" fill="currentColor" />
                <span className="text-white font-bold">{userPoints} pts</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">

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
            <div className="bg-white rounded-xl shadow-lg border border-teal-200 relative z-10">
              <div className="p-4 border-b border-teal-100">
                <h3 className="text-lg font-semibold text-slate-900">Browse Rewards</h3>
              </div>
              
              <div className="p-4 overflow-visible">
              
                {categoriesLoading ? (
                  <div className="mb-4">
                    <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
                  </div>
                ) : (
                  <div className="mb-4 relative z-50 pointer-events-auto">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Filter by Category</label>
                    <select
                      value={activeCategory}
                      onChange={(e) => setActiveCategory(e.target.value)}
                      className="w-64 px-4 py-3 bg-white border-2 border-teal-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900 font-medium cursor-pointer hover:border-teal-400 shadow-sm relative z-50 pointer-events-auto"
                      style={{ pointerEvents: 'auto' }}
                    >
                      <option value="all">All Rewards</option>
                      {categories.map((category) => (
                        <option key={`category-${category.id}`} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Rewards Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SkeletonLoader type="card" count={6} />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {paginatedRewards.map((reward) => {
                        const hasDestinations = reward.destinations && reward.destinations.length > 0;
                        const hasEnoughPoints = userPoints >= reward.points_required;
                        // Count how many times user has redeemed this specific reward (active, pending, used)
                        const redemptionCount = redeemedRewards.filter(r => 
                          r.reward_id === reward.id && 
                          ['active', 'pending', 'used'].includes(r.status)
                        ).length;
                        const isRedeemed = redemptionCount >= (reward.max_redemptions_per_user || 1);
                        const canRedeem = hasDestinations && hasEnoughPoints && !isRedeemed;
                        
                        return (
                            <div key={reward.id} className={`border-2 border-teal-300 rounded-xl p-5 shadow-md hover:shadow-xl hover:border-teal-500 transition-all duration-200 bg-white flex flex-col h-full ${isRedeemed ? 'opacity-75' : ''}`}>
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
                                  <span className="line-clamp-1">
                                    {reward.destinations.length} location{reward.destinations.length > 1 ? 's' : ''} available
                                  </span>
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
                                   !hasDestinations ? '🚫 No Locations' :
                                   !hasEnoughPoints ? '🔒 Not Enough Points' : 
                                   'Redeem Now'}
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
              <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-4 border border-teal-200 shadow-sm">
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
                    // ⚡ Check if expired
                    const isExpired = new Date(redemption.valid_until) < new Date();
                    const displayStatus = isExpired && redemption.status === 'active' ? 'expired' : redemption.status;
                    
                    const statusConfig = {
                      active: { bg: 'bg-green-100', text: 'text-green-700', icon: '✓', label: 'Active' },
                      used: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '✓', label: 'Used' },
                      expired: { bg: 'bg-red-100', text: 'text-red-700', icon: '✕', label: 'Expired' },
                      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '⏱', label: 'Pending' }
                    };
                    const status = statusConfig[displayStatus] || statusConfig.pending;
                    
                    return (
                      <motion.div 
                        key={redemption.id} 
                        variants={scaleIn}
                        className="group bg-white rounded-lg p-3 border border-teal-200 hover:border-teal-400 hover:shadow-md transition-all duration-300 shadow-sm"
                      >
                        {/* Header with Status */}
                        <div className="flex items-start justify-between mb-2.5">
                          <h4 className="font-semibold text-sm text-slate-900 line-clamp-1 flex-1 pr-2">
                            {redemption.reward_title || redemption.reward?.title || 'Reward'}
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
                        
                        {/* Expired Warning */}
                        {isExpired && redemption.status === 'active' && (
                          <div className="pt-2 border-t border-slate-100">
                            <div className="text-xs text-red-600 bg-red-50 px-2 py-1.5 rounded-md flex items-center gap-1">
                              <span>⚠️</span>
                              <span>This reward has expired</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Change Reward - Compact */}
                        {['active', 'pending'].includes(redemption.status) && !isExpired && (
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
      </div>

    </div>
    {/* End of blur wrapper */}

    {/* QR Scanner Modal - OUTSIDE blur wrapper */}
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

    {/* Check-In Review Modal - OUTSIDE blur wrapper */}
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

    {/* Destination Selection Modal - OUTSIDE blur wrapper */}
    {showDestinationModal && pendingReward && (
        <Modal
          isOpen={showDestinationModal}
          onClose={() => {
            setShowDestinationModal(false);
            setPendingReward(null);
            setPendingRedemption(null);
          }}
          title="Select Destination"
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
              <h3 className="font-semibold text-teal-900 mb-1">{pendingReward.title}</h3>
              <p className="text-sm text-teal-700">
                {pendingRedemption 
                  ? `Change to this reward (Point difference: ${pendingReward.points_required - pendingRedemption.points_spent} pts)`
                  : `Cost: ${pendingReward.points_required} points`
                }
              </p>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">
                Choose where you want to redeem this reward:
              </p>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {pendingReward.destinations?.map((dest) => (
                  <button
                    key={dest.destination_id}
                    onClick={() => {
                      if (pendingRedemption) {
                        confirmChangeReward(dest.destination_id);
                      } else {
                        confirmRedeem(dest.destination_id);
                      }
                    }}
                    className="w-full text-left p-4 bg-white border-2 border-slate-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                        <span className="text-xl">📍</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 group-hover:text-teal-700 transition-colors">
                          {dest.destination_name || dest.name || `Destination ${dest.destination_id}`}
                        </h4>
                        {dest.address && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                            {dest.address}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 text-teal-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        →
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <button
                onClick={() => {
                  setShowDestinationModal(false);
                  setPendingReward(null);
                  setPendingRedemption(null);
                }}
                className="w-full px-4 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
    )}
  </div>
  );
});

Rewards.displayName = 'UserRewards';

export default Rewards;
