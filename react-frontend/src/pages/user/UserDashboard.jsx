import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, slideInFromRight, slideInFromBottom, scaleIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import ToastNotification from '../../components/common/ToastNotification';
import Button from '../../components/common/Button';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import ProfileCard from '../../components/user/ProfileCard';
import BadgesSection from '../../components/user/BadgesSection';
import AdventureTimeline from '../../components/user/AdventureTimeline';
import QuickStats from '../../components/user/QuickStats';
import MilestoneCard from '../../components/user/MilestoneCard';
import AccountStats from '../../components/user/AccountStats';

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [visits, setVisits] = useState([]);
  const [badges, setBadges] = useState([]);
  const [rewards, setRewards] = useState([]);
  const [stats, setStats] = useState({
    totalVisits: 12,
    totalPoints: 2450,
    badgesEarned: 3,
    rewardsRedeemed: 0,
    reviewsLeft: 8,
    currentStreak: 7,
    memberMonths: 4,
    avgPointsWeek: 612.5,
    totalReviews: 8,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Mock data for now - will connect to API later
      setVisits([
        { id: 1, destination: { name: 'Mountain Peak', category: 'tourist spot' }, points: 100, createdAt: '2 days ago' },
        { id: 2, destination: { name: 'Grand Hotel', category: 'hotel' }, points: 50, createdAt: '5 days ago' },
        { id: 3, destination: { name: 'Organic Farm', category: 'agri farm' }, points: 30, createdAt: '1 week ago' },
      ]);
      
      setBadges([
        { id: 1, name: 'Explorer', description: 'Visit 5 destinations', icon: '🗺️', earned: true, earnedAt: '3 weeks ago' },
        { id: 2, name: 'Reviewer', description: 'Leave 10 reviews', icon: '⭐', earned: true, earnedAt: '2 weeks ago' },
        { id: 3, name: 'Collector', description: 'Collect 5 badges', icon: '🏆', earned: true, earnedAt: '1 week ago' },
        { id: 4, name: 'Globetrotter', description: 'Visit 20 destinations', icon: '🌍', earned: false },
        { id: 5, name: 'Master', description: 'Visit 50 destinations', icon: '👑', earned: false },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const progressToNextLevel = 40; // 40%
  const pointsToNextLevel = 1635;

  const milestoneData = {
    icon: '🌍',
    name: 'Globetrotter',
    description: 'Visit 20 destinations',
    current: 12,
    total: 20,
  };

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
        {/* Page Title */}
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8"
        >
          Your Adventure
        </motion.h2>

        {/* Content Grid */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"
        >
          {/* Left Column - Profile Card */}
          <motion.div variants={slideInFromBottom} className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Profile Overview */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
            >
              <ProfileCard
                userName="Alex Thompson"
                userLevel="Level Explorer"
                memberSince="Jan 2024"
                totalPoints={stats.totalPoints}
                progress={progressToNextLevel}
                pointsToNext={pointsToNextLevel}
              />
            </motion.div>

            {/* Badges Earned */}
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <BadgesSection badges={badges} />
            </motion.div>

            {/* Adventure Timeline */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <AdventureTimeline visits={visits} totalVisits={stats.totalVisits} />
            </motion.div>
          </motion.div>

          {/* Right Column - Stats */}
          <motion.div variants={slideInFromRight} className="space-y-4 sm:space-y-6">
            {/* Quick Stats */}
            <QuickStats stats={stats} />

            {/* Next Milestone */}
            <MilestoneCard milestone={milestoneData} />

            {/* Account Stats */}
            <AccountStats stats={stats} />
          </motion.div>
        </motion.div>
      </main>
    </AnimatedPage>
  );
};

export default UserDashboard;
