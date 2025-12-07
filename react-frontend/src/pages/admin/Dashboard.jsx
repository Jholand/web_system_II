import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import { Clock, Users, MapPin, Award, Gift } from 'lucide-react';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
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

      {/* Sidebar Navigation */}
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header - Full Width */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Dashboard Overview</h1>
                <p className="text-sm text-teal-50 mt-1">Real-time system analytics and metrics</p>
              </div>
              <div className="flex items-center gap-3">
                {loading && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    <span className="text-xs font-medium text-white">Updating...</span>
                  </div>
                )}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with Padding */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Total Users */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-teal-100 mb-1">Total Users</p>
                <p className="text-4xl font-bold">{allDashboardData?.[currentPeriod]?.overview?.total_users || 0}</p>
                <p className="text-xs text-teal-100 mt-1">Registered accounts</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Destinations */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100 mb-1">Total Destinations</p>
                <p className="text-4xl font-bold">{allDashboardData?.[currentPeriod]?.overview?.total_destinations || 0}</p>
                <p className="text-xs text-blue-100 mt-1">Active locations</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Badges */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100 mb-1">Total Badges</p>
                <p className="text-4xl font-bold">{allDashboardData?.[currentPeriod]?.overview?.total_badges || 0}</p>
                <p className="text-xs text-purple-100 mt-1">Achievement types</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Award className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          {/* Total Rewards */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100 mb-1">Total Rewards</p>
                <p className="text-4xl font-bold">{allDashboardData?.[currentPeriod]?.overview?.total_rewards || 0}</p>
                <p className="text-xs text-orange-100 mt-1">Available rewards</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
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
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
