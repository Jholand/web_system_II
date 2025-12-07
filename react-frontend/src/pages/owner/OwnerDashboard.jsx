import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Store, QrCode, TrendingUp, MapPin, LayoutDashboard, Gift, LogOut, Menu, X, Users, Star, Award, Calendar, ChevronLeft, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import ConfirmModal from '../../components/common/ConfirmModal';
import MobileHeader from '../../components/layout/MobileHeader';
import TabletHeader from '../../components/layout/TabletHeader';
import MobileBottomNav from '../../components/layout/MobileBottomNav';

const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();
axios.defaults.withCredentials = true;

const OwnerDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [destinations, setDestinations] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // INSTANT LOAD: Show cached data immediately
    const cachedStats = localStorage.getItem('owner_dashboard_stats');
    const cachedDests = localStorage.getItem('owner_destinations');
    
    if (cachedStats) {
      try {
        const { data, timestamp } = JSON.parse(cachedStats);
        const age = Date.now() - timestamp;
        // Show cache immediately regardless of age
        setStats(data);
        setLoading(false);
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    
    if (cachedDests) {
      try {
        const { data } = JSON.parse(cachedDests);
        setDestinations(data);
      } catch (e) {}
    }
    
    // Fetch fresh data in background
    fetchDashboardData();
    fetchDestinations();
    
    // AUTO-REFRESH: Update every 30 seconds
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchDestinations();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data;
      setStats(data);
      setLoading(false);
      
      // Cache with timestamp
      localStorage.setItem('owner_dashboard_stats', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired');
        navigate('/');
      }
      setLoading(false);
    }
  };

  const fetchDestinations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/destinations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = response.data.data || [];
      setDestinations(data);
      
      // Cache destinations
      localStorage.setItem('owner_destinations', JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/');
    toast.success('Logged out successfully');
  };

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userInitial = currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : 'O';

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Close sidebar when resizing to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const Sidebar = () => (
    <>
      {/* Backdrop for tablet view */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:block lg:hidden transition-opacity duration-300 ease-in-out animate-in fade-in"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r-2 border-slate-300 shadow-[4px_0_20px_rgba(0,0,0,0.15)] flex flex-col transition-all duration-300 ease-in-out
          hidden md:flex lg:flex
          z-50
          md:w-64 lg:w-auto
          ${isSidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-full'}
          lg:translate-x-0`}
        style={{ width: window.innerWidth >= 1024 ? (isCollapsed ? '5rem' : '16rem') : undefined }}
      >
      {/* Desktop Header - Only visible on desktop */}
      <div className="p-4 flex items-center gap-3 hidden lg:flex">
        {!isCollapsed ? (
          <>
            <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
              <Store className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">TravelQuest</h2>
              <p className="text-xs text-gray-500">Owner</p>
            </div>
            <button
              onClick={handleToggleCollapse}
              className="ml-auto p-1.5 bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
          </>
        ) : (
          <div className="w-full flex justify-center">
            <button
              onClick={handleToggleCollapse}
              className="p-1.5 bg-white border border-gray-200 hover:border-teal-500 rounded-lg transition-all"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600 rotate-180" />
            </button>
          </div>
        )}
      </div>
      
      {/* Tablet Sidebar Header */}
      <div className="lg:hidden p-4 flex items-center gap-3 border-b border-gray-200">
        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900">TravelQuest</h2>
          <p className="text-xs text-gray-500">Owner Panel</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <Link
          to="/owner/dashboard"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-75 ${
            location.pathname === '/owner/dashboard'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-transparent text-gray-700 hover:bg-gray-50'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title="Dashboard"
        >
          <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Dashboard</span>}
        </Link>
        
        <Link
          to="/owner/rewards"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-75 ${
            location.pathname === '/owner/rewards'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-transparent text-gray-700 hover:bg-gray-50'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title="Rewards"
        >
          <Gift className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Rewards</span>}
        </Link>
        
        <Link
          to="/owner/redemptions"
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-75 ${
            location.pathname === '/owner/redemptions'
              ? 'bg-teal-500 text-white shadow-md'
              : 'bg-transparent text-gray-700 hover:bg-gray-50'
          } ${isCollapsed ? 'justify-center' : ''}`}
          title="Redemptions"
        >
          <QrCode className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Redemptions</span>}
        </Link>
      </nav>

      {/* User Profile at Bottom */}
      <div className="p-3 relative">
        {isCollapsed ? (
          <>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold hover:from-teal-600 hover:to-cyan-700 transition-all"
              title={`${currentUser.first_name} ${currentUser.last_name}`}
            >
              {userInitial}
            </button>
            {showProfileMenu && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowProfileMenu(false)}
                />
                <div className="absolute left-16 bottom-0 z-50 bg-white rounded-xl shadow-2xl border-2 border-teal-200 p-3 min-w-[200px]">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{currentUser.first_name} {currentUser.last_name}</p>
                      <p className="text-xs text-teal-600">Owner</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border border-teal-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-semibold">
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <p className="text-xs text-teal-600">Owner</p>
              </div>
              <button
                onClick={() => setShowLogoutModal(true)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ToastNotification />
        
        {/* Mobile Header (< md) */}
        <MobileHeader user={currentUser} />
        
        {/* Tablet Header (md to lg) */}
        <TabletHeader 
          user={currentUser} 
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          isSidebarOpen={isSidebarOpen}
        />
        
        {/* Desktop Sidebar */}
        <Sidebar />
        
        {/* Mobile Bottom Navigation */}
        <MobileBottomNav />
        
        <div className={`transition-all duration-300 pb-16 md:pb-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <header className="bg-white shadow-sm border-b border-gray-200 mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div>
                <div className="h-7 w-40 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-1"></div>
              </div>
            </div>
          </header>

          <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto">
            {/* Stats Skeleton */}
            <SkeletonLoader type="stats" count={4} />

            {/* Quick Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow p-6">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Destinations Skeleton */}
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <SkeletonLoader type="destination-card" count={3} />
            </div>

            {/* Redemptions Skeleton */}
            <div className="bg-white rounded-xl shadow p-6">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-64 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      {/* Mobile Header (< md) */}
      <MobileHeader user={currentUser} />
      
      {/* Tablet Header (md to lg) */}
      <TabletHeader 
        user={currentUser} 
        onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        isSidebarOpen={isSidebarOpen}
      />
      
      {/* Desktop Sidebar */}
      <Sidebar />
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
      
      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Top Header - Flush to top */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-sm text-teal-50 mt-1">Welcome back, manage your destinations and rewards</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-100 mb-1">My Destinations</p>
                  <p className="text-4xl font-bold">{stats?.total_destinations || 0}</p>
                  <p className="text-xs text-teal-100 mt-1">Active locations</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Total Visits</p>
                  <p className="text-4xl font-bold">{stats?.total_visits || 0}</p>
                  <p className="text-xs text-blue-100 mt-1">All time</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-100 mb-1">Pending Claims</p>
                  <p className="text-4xl font-bold">{stats?.pending_redemptions || 0}</p>
                  <p className="text-xs text-orange-100 mt-1">Awaiting approval</p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 text-white transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-100 mb-1">Average Rating</p>
                  <p className="text-4xl font-bold">{stats?.average_rating?.toFixed(1) || '0.0'}</p>
                  <p className="text-xs text-purple-100 mt-1 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-purple-200" />
                    From all reviews
                  </p>
                </div>
                <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl shadow-[0_8px_20px_rgba(20,184,166,0.2)] border-2 border-teal-300 p-6 hover:shadow-2xl hover:border-teal-400 hover:from-teal-100 hover:to-cyan-100 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                This Week
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Visits</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.weekly_visits || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Redemptions</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.weekly_redemptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New Reviews</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.weekly_reviews || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-[0_8px_20px_rgba(59,130,246,0.2)] border-2 border-blue-300 p-6 hover:shadow-2xl hover:border-blue-400 hover:from-blue-100 hover:to-indigo-100 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center shadow-md">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Avg Visit Duration</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.avg_duration || '0'} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Return Rate</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.return_rate || '0'}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Satisfaction</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.satisfaction || '0'}%</span>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl shadow-[0_8px_20px_rgba(249,115,22,0.2)] border-2 border-orange-300 p-6 hover:shadow-2xl hover:border-orange-400 hover:from-orange-100 hover:to-amber-100 transition-all duration-300">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center shadow-md">
                  <Gift className="w-5 h-5 text-white" />
                </div>
                Rewards Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Claimed</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.total_claimed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pending</span>
                  <span className="text-lg font-bold text-orange-600">{stats?.pending_redemptions || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">This Month</span>
                  <span className="text-lg font-bold text-gray-900">{stats?.monthly_claimed || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* My Destinations */}
          <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-2 border-slate-200 p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center shadow-md">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                My Destinations
              </h3>
              <span className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-full text-sm font-semibold shadow-md">{destinations.length} total</span>
            </div>
            {destinations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {destinations.map((dest) => (
                  <div 
                    key={dest.destination_id} 
                    className="group relative bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl p-5 hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)]"
                  >
                    <div className="absolute top-3 right-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center group-hover:from-teal-500 group-hover:to-cyan-600 group-hover:scale-110 transition-all duration-300 shadow-lg">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 mb-1 pr-10 line-clamp-2">{dest.name}</h4>
                    <p className="text-xs text-gray-500 mb-4">{dest.category?.name || 'Uncategorized'}</p>
                    
                    <div className="space-y-2.5">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold">{dest.total_visits || 0}</span>
                          <span className="text-gray-500 text-xs ml-1">visits</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                          <Star className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold">{typeof dest.average_rating === 'number' ? dest.average_rating.toFixed(1) : '0.0'}</span>
                          <span className="text-gray-500 text-xs ml-1">rating</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                          <Award className="w-4 h-4 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <span className="font-semibold">{dest.total_reviews || 0}</span>
                          <span className="text-gray-500 text-xs ml-1">reviews</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        dest.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          dest.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                        }`}></span>
                        {dest.status || 'inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 font-medium">No destinations assigned yet</p>
                <p className="text-sm text-gray-400 mt-1">Contact admin to get destinations assigned</p>
              </div>
            )}
          </div>

          {/* Recent Redemptions */}
          {stats?.recent_redemptions?.length > 0 && (
            <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-2xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-2 border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center shadow-md">
                    <QrCode className="w-5 h-5 text-white" />
                  </div>
                  Recent Redemptions
                </h3>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold">{stats.recent_redemptions.length} recent</span>
              </div>
              <div className="space-y-3">
                {stats.recent_redemptions.slice(0, 10).map((redemption) => (
                  <div 
                    key={redemption.id}
                    className="flex items-center gap-4 p-4 bg-gradient-to-r from-white via-orange-50/30 to-amber-50/30 border-2 border-orange-200 rounded-lg hover:border-orange-400 hover:from-orange-50 hover:via-amber-50 hover:to-yellow-50 hover:shadow-xl transition-all duration-300 shadow-[0_4px_12px_rgba(249,115,22,0.12)]"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">
                          {redemption.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{redemption.user?.name || 'Unknown User'}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1.5 mt-0.5">
                        <Gift className="w-3.5 h-3.5 text-teal-500" />
                        <span className="truncate">{redemption.reward?.title || 'Reward'}</span>
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(redemption.redeemed_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                          redemption.status === 'used'
                            ? 'bg-green-100 text-green-700'
                            : redemption.status === 'pending' || redemption.status === 'active'
                            ? 'bg-yellow-100 text-yellow-700'
                            : redemption.status === 'expired'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {redemption.status === 'used' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {(redemption.status === 'pending' || redemption.status === 'active') && <Clock className="w-3 h-3 mr-1" />}
                        {redemption.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        type="logout"
        title="Confirm Logout"
        message="Are you sure you want to logout? You'll need to sign in again to access your account."
        confirmText="Yes, Logout"
        cancelText="Cancel"
      />
    </div>
  );
};

export default OwnerDashboard;
