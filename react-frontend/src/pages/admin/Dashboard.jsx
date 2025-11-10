import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import StatCard from '../../components/dashboard/StatCard';
import VisitsPointsTrend from '../../components/dashboard/VisitsPointsTrend';
import MonthlyDistribution from '../../components/dashboard/MonthlyDistribution';
import QuickStats from '../../components/dashboard/QuickStats';
import Button from '../../components/common/Button';

const Dashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <AdminHeader 
        admin={{ name: 'em', role: 'Administrator' }}
        onLogout={handleLogout}
      />

      {/* Sidebar Navigation */}
      <DashboardTabs />

      {/* Main Content */}
      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">
        {/* Page Title */}
        <motion.h2 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6 sm:mb-8"
        >
          Admin Dashboard
        </motion.h2>

        {/* Stats Cards */}
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <motion.div variants={slideInFromRight}>
            <StatCard
              title="Total Users"
              value="2,345"
              change="+12% from last month"
              changeType="positive"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              }
              iconBg="bg-blue-500"
            />
          </motion.div>
          <motion.div variants={slideInFromRight}>
            <StatCard
              title="Total Visits"
              value="12,847"
              change="+8% from last month"
              changeType="positive"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-emerald-500"
            />
          </motion.div>
          <motion.div variants={slideInFromRight}>
            <StatCard
              title="Points Awarded"
              value="524,300"
              change="+23% from last month"
              changeType="positive"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              }
              iconBg="bg-orange-500"
            />
          </motion.div>
          <motion.div variants={slideInFromRight}>
            <StatCard
              title="Rewards Claimed"
              value="1,203"
              change="-5% from last month"
              changeType="negative"
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
              iconBg="bg-purple-500"
            />
          </motion.div>
        </motion.div>

        {/* Charts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8"
        >
          <VisitsPointsTrend />
          <MonthlyDistribution />
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <QuickStats />
        </motion.div>
      </main>
    </AnimatedPage>
  );
};

export default Dashboard;
