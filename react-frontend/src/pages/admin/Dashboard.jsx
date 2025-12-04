import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import StatCard from '../../components/dashboard/StatCard';
import VisitsPointsTrend from '../../components/dashboard/VisitsPointsTrend';
import MonthlyDistribution from '../../components/dashboard/MonthlyDistribution';
import { getCurrentAdmin } from '../../utils/adminHelper';
import QuickStats from '../../components/dashboard/QuickStats';
import Button from '../../components/common/Button';
import axios from 'axios';

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [allDashboardData, setAllDashboardData] = useState(null);
  const [currentPeriod, setCurrentPeriod] = useState('daily');
  const [loading, setLoading] = useState(true);
  const cacheRef = useRef(null);
  const fetchIntervalRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    // INSTANT LOAD: Show cache immediately
    const cachedData = localStorage.getItem('dashboard_cache');
    
    if (cachedData) {
      try {
        const parsedData = JSON.parse(cachedData);
        setAllDashboardData(parsedData);
      } catch (e) {}
    }
    
    // Fetch fresh data in background
    fetchDashboardStats();
    
    // REAL-TIME: Auto-refresh every 30 seconds
    fetchIntervalRef.current = setInterval(fetchDashboardStats, 30000);
    
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current);
      }
    };
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { period: 'all' }
      });

      if (response.data.success) {
        const data = response.data.data;
        setAllDashboardData(data);
        localStorage.setItem('dashboard_cache', JSON.stringify(data));
        cacheRef.current = data;
      }
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Add logout logic here
    navigate('/');
  };

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
      
      <AdminHeader 
        admin={getCurrentAdmin()}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Sidebar Navigation */}
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12
        `}
      >
        {/* Page Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-xl border border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Dashboard Overview
                </h1>
                <p className="text-slate-600 text-sm sm:text-base mt-1">Real-time system analytics and metrics</p>
              </div>
              {loading && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg border border-teal-200">
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-teal-600"></div>
                  <span className="text-xs font-medium text-teal-700">Updating...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="h-full">
            <StatCard
              title="Total Users"
              value={allDashboardData?.[currentPeriod]?.overview?.total_users || "0"}
              change={`${allDashboardData?.[currentPeriod]?.overview?.users_growth > 0 ? '+' : ''}${allDashboardData?.[currentPeriod]?.overview?.users_growth || 0}% from last month`}
              changeType={allDashboardData?.[currentPeriod]?.overview?.users_growth >= 0 ? "positive" : "negative"}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              }
              iconBg="bg-gradient-to-br from-teal-500 to-teal-600"
            />
          </div>
          <div className="h-full">
            <StatCard
              title="Total Check-ins"
              value={allDashboardData?.[currentPeriod]?.overview?.total_checkins || "0"}
              change={`${allDashboardData?.[currentPeriod]?.overview?.checkins_growth > 0 ? '+' : ''}${allDashboardData?.[currentPeriod]?.overview?.checkins_growth || 0}% from last month`}
              changeType={allDashboardData?.[currentPeriod]?.overview?.checkins_growth >= 0 ? "positive" : "negative"}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
            />
          </div>
          <div className="h-full">
            <StatCard
              title="Points Awarded"
              value={allDashboardData?.[currentPeriod]?.overview?.total_points || "0"}
              change={`${allDashboardData?.[currentPeriod]?.overview?.points_growth > 0 ? '+' : ''}${allDashboardData?.[currentPeriod]?.overview?.points_growth || 0}% from last month`}
              changeType={allDashboardData?.[currentPeriod]?.overview?.points_growth >= 0 ? "positive" : "negative"}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              }
              iconBg="bg-gradient-to-br from-cyan-500 to-cyan-600"
            />
          </div>
          <div className="h-full">
            <StatCard
              title="Rewards Claimed"
              value={allDashboardData?.[currentPeriod]?.overview?.rewards_claimed || "0"}
              change={`${allDashboardData?.[currentPeriod]?.overview?.rewards_growth > 0 ? '+' : ''}${allDashboardData?.[currentPeriod]?.overview?.rewards_growth || 0}% from last month`}
              changeType={allDashboardData?.[currentPeriod]?.overview?.rewards_growth >= 0 ? "positive" : "negative"}
              icon={
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              }
              iconBg="bg-gradient-to-br from-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Charts */}
        <div className="mb-6 sm:mb-8">
          <VisitsPointsTrend data={allDashboardData} currentPeriod={currentPeriod} />
        </div>

        <div className="mb-6 sm:mb-8">
          <MonthlyDistribution data={allDashboardData} currentPeriod={currentPeriod} />
        </div>

        {/* Quick Stats */}
        <div>
          <QuickStats data={allDashboardData} currentPeriod={currentPeriod} />
        </div>
      </main>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
