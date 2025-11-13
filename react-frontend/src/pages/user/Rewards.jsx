import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { staggerContainer, slideInFromRight, slideInFromBottom, scaleIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import Button from '../../components/common/Button';
import ToastNotification from '../../components/common/ToastNotification';
import toast from 'react-hot-toast';

const Rewards = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userPoints, setUserPoints] = useState(2450);
  const [rewards, setRewards] = useState([
    {
      id: 1,
      name: 'Hotel Branded Mug',
      description: 'Exclusive ceramic mug with hotel branding',
      points: 30,
      category: 'merchandise',
      available: true,
      image: '☕',
      redeemed: false
    },
    {
      id: 2,
      name: 'Luxury Spa Kit',
      description: 'Premium spa products for relaxation',
      points: 40,
      category: 'wellness',
      available: true,
      image: '🧖',
      redeemed: false
    },
    {
      id: 3,
      name: 'Farm Fresh Basket',
      description: 'Organic produce from local farms',
      points: 50,
      category: 'food',
      available: true,
      image: '🧺',
      redeemed: false
    },
    {
      id: 4,
      name: 'Adventure Gear Pack',
      description: 'Essential items for outdoor adventures',
      points: 100,
      category: 'gear',
      available: true,
      image: '🎒',
      redeemed: false
    },
    {
      id: 5,
      name: 'Restaurant Voucher',
      description: '₱500 dining voucher at partner restaurants',
      points: 150,
      category: 'food',
      available: true,
      image: '🍽️',
      redeemed: false
    },
    {
      id: 6,
      name: 'Travel Discount Pass',
      description: '20% off on next booking',
      points: 200,
      category: 'travel',
      available: true,
      image: '✈️',
      redeemed: false
    },
  ]);

  const [redeemedRewards, setRedeemedRewards] = useState([
    {
      id: 101,
      name: 'Welcome Badge',
      description: 'Starter reward for new members',
      points: 10,
      redeemedDate: '2 weeks ago',
      image: '🎖️'
    },
  ]);

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const handleRedeem = (reward) => {
    if (userPoints >= reward.points) {
      setUserPoints(userPoints - reward.points);
      toast.success(`${reward.name} redeemed successfully!`);
      
      // Move to redeemed
      const redeemedReward = {
        ...reward,
        redeemedDate: 'Just now'
      };
      setRedeemedRewards([redeemedReward, ...redeemedRewards]);
      setRewards(rewards.filter(r => r.id !== reward.id));
    } else {
      toast.error('Not enough points to redeem this reward');
    }
  };

  const filteredRewards = activeCategory === 'all' 
    ? rewards 
    : rewards.filter(r => r.category === activeCategory);

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      <UserHeader user={user} onLogout={handleLogout} />

      <UserDashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          sm:ml-20 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8
        `}
      >
        <motion.h2 
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Your Adventure
        </motion.h2>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Main Rewards Area */}
          <motion.div 
            variants={slideInFromBottom}
            className="lg:col-span-2 space-y-4 sm:space-y-6"
          >
            {/* Points Balance */}
            <motion.div 
              className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl p-6 sm:p-8 text-white"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 100, delay: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-white/80 mb-2 text-sm sm:text-base">Your Points Balance</p>
                  <h3 className="text-4xl sm:text-5xl font-bold mb-2">{userPoints}</h3>
                  <p className="text-white/90 text-sm sm:text-base">Keep exploring to earn more points!</p>
                </div>
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Category Filter */}
            <div className="bg-white rounded-2xl p-4 sm:p-6 border">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Browse Rewards</h3>
              
              <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
                <button
                  onClick={() => setActiveCategory('all')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    activeCategory === 'all'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  All Rewards
                </button>
                <button
                  onClick={() => setActiveCategory('merchandise')}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-all text-sm sm:text-base ${
                    activeCategory === 'merchandise'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  Merchandise
                </button>
                <button
                  onClick={() => setActiveCategory('food')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeCategory === 'food'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  Food & Dining
                </button>
                <button
                  onClick={() => setActiveCategory('travel')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeCategory === 'travel'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  Travel
                </button>
                <button
                  onClick={() => setActiveCategory('wellness')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeCategory === 'wellness'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                  }`}
                >
                  Wellness
                </button>
              </div>

              {/* Available Rewards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRewards.map((reward) => (
                  <div key={reward.id} className="border rounded-xl p-4 hover:shadow-lg transition-shadow bg-gradient-to-br from-gray-50 to-white">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {reward.image}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-900 mb-1">{reward.name}</h4>
                        <p className="text-sm text-slate-600 mb-3">{reward.description}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-orange-500">{reward.points} pts</span>
                          <Button
                            variant={userPoints >= reward.points ? "primary" : "outline"}
                            size="sm"
                            onClick={() => handleRedeem(reward)}
                            disabled={userPoints < reward.points}
                          >
                            {userPoints >= reward.points ? 'Redeem' : 'Locked'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredRewards.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-600">No rewards in this category</p>
                </div>
              )}
            </div>

            {/* Redeemed Rewards */}
            {redeemedRewards.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Redeemed Rewards</h3>
                
                <div className="space-y-3">
                  {redeemedRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{reward.image}</div>
                        <div>
                          <h4 className="font-bold text-slate-900">{reward.name}</h4>
                          <p className="text-sm text-slate-600">{reward.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-700">{reward.points} pts</p>
                        <p className="text-xs text-slate-500">{reward.redeemedDate}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            variants={slideInFromRight}
            className="lg:col-span-1 space-y-4 sm:space-y-6"
          >
            {/* Earning Tips */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 sm:p-6 border border-purple-200">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Earn More Points</h3>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <span className="text-xl">📍</span>
                  <div>
                    <p className="font-medium text-slate-900">Visit Locations</p>
                    <p className="text-xs text-slate-600">Check in to earn points</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xl">⭐</span>
                  <div>
                    <p className="font-medium text-slate-900">Leave Reviews</p>
                    <p className="text-xs text-slate-600">Share your experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xl">🏆</span>
                  <div>
                    <p className="font-medium text-slate-900">Complete Challenges</p>
                    <p className="text-xs text-slate-600">Unlock bonus points</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <p className="font-medium text-slate-900">Daily Streak</p>
                    <p className="text-xs text-slate-600">Visit daily for bonuses</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Points History */}
            <div className="bg-white rounded-2xl p-6 border">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Mountain Peak Visit</span>
                  <span className="text-sm font-bold text-green-600">+100</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Review Bonus</span>
                  <span className="text-sm font-bold text-green-600">+50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Hotel Check-in</span>
                  <span className="text-sm font-bold text-green-600">+50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Welcome Reward</span>
                  <span className="text-sm font-bold text-red-600">-10</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
              
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/map')}
                >
                  Find Locations
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => navigate('/dashboard')}
                >
                  View Progress
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </main>
    </AnimatedPage>
  );
};

export default Rewards;
