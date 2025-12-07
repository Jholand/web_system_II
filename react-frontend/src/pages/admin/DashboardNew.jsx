import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MapPin, Award, Gift, TrendingUp, TrendingDown } from 'lucide-react';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import { getCurrentAdmin } from '../../utils/adminHelper';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import axios from 'axios';

const Dashboard = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const cacheRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    // INSTANT LOAD: Show cache immediately
    const cachedData = localStorage.getItem('dashboard_cache');
    
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        
        if (parsed.data) {
          setDashboardData(parsed.data);
          console.log('⚡ Dashboard loaded from cache');
        }
        
        // Skip fetch if cache is fresh (< 5 min)
        if (cacheAge < 300000 && parsed.data) {
          return;
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    
    // Fetch fresh data
    fetchDashboardStats();
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
        setDashboardData(data);
        localStorage.setItem('dashboard_cache', JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        cacheRef.current = data;
        console.log('✅ Fresh dashboard data loaded');
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
    navigate('/');
  };

  const overview = dashboardData?.daily?.overview || {};
  const stats = [
    {
      title: 'Total Users',
      value: overview.total_users || 0,
      change: overview.users_growth || 0,
      icon: Users,
      color: 'from-gold-500 to-gold-600'
    },
    {
      title: 'Check-ins',
      value: overview.total_checkins || 0,
      change: overview.checkins_growth || 0,
      icon: MapPin,
      color: 'from-warm-500 to-warm-600'
    },
    {
      title: 'Points Awarded',
      value: overview.total_points || 0,
      change: overview.points_growth || 0,
      icon: Award,
      color: 'from-gold-400 to-gold-500'
    },
    {
      title: 'Rewards Claimed',
      value: overview.rewards_claimed || 0,
      change: overview.rewards_growth || 0,
      icon: Gift,
      color: 'from-warm-600 to-warm-700'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-50 via-warm-100 to-cream-100">
      <AdminHeader 
        admin={getCurrentAdmin()}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-28 pb-12
        `}
      >
        {/* 🔹 SECTION 1: Top Bar Layout */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-6">
          {/* Left: Greeting Area */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-cream-50 rounded-2xl p-6 sm:p-8 shadow-sm border border-warm-200/20 h-full">
              <div className="text-sm text-charcoal-600 mb-2 font-medium">Welcome back,</div>
              <h1 className="text-3xl sm:text-4xl font-bold text-charcoal-800 mb-3">
                {getCurrentAdmin()?.name || 'Admin'}
              </h1>
              <p className="text-charcoal-600 text-sm">
                Here's what's happening with your system today
              </p>
            </div>
          </div>

          {/* Middle: Small Metric Cards */}
          <div className="col-span-12 lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 h-full">
              {loading ? (
                <SkeletonLoader type="stats" count={2} />
              ) : (
                stats.slice(0, 2).map((stat, idx) => (
                  <div key={idx} className="bg-cream-50 rounded-2xl p-4 sm:p-5 shadow-sm border border-warm-200/20 hover:shadow-md transition-shadow">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-xs sm:text-sm text-charcoal-600 mb-1 font-medium">{stat.title}</div>
                    <div className="text-2xl sm:text-3xl font-bold text-charcoal-800 mb-2">
                      {stat.value.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-xs">
                      {stat.change >= 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3 text-green-600" />
                          <span className="text-green-600 font-semibold">+{stat.change}%</span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-3 h-3 text-red-600" />
                          <span className="text-red-600 font-semibold">{stat.change}%</span>
                        </>
                      )}
                      <span className="text-charcoal-500">vs last month</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Gauge-style Card */}
          <div className="col-span-12 lg:col-span-3">
            {loading ? (
              <SkeletonLoader type="stats" count={1} />
            ) : (
              <div className="bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl p-6 shadow-lg h-full flex flex-col justify-between">
                <div>
                  <div className="text-gold-100 text-sm font-medium mb-2">System Health</div>
                  <div className="text-4xl font-bold text-white mb-1">98.5%</div>
                  <div className="text-gold-100 text-xs">All systems operational</div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gold-300/30 rounded-full h-2">
                    <div className="bg-white rounded-full h-2" style={{ width: '98.5%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 SECTION 2: Middle Analytics Grid */}
        <div className="grid grid-cols-12 gap-4 sm:gap-6 mb-6">
          {/* Left Panel: Points & Rewards Stats */}
          <div className="col-span-12 lg:col-span-3">
            {loading ? (
              <SkeletonChart className="h-full" />
            ) : (
              <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-warm-200/20 h-full">
                <h3 className="text-lg font-bold text-charcoal-800 mb-6">Quick Stats</h3>
                <div className="space-y-5">
                  {stats.slice(2, 4).map((stat, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-charcoal-600 mb-1">{stat.title}</div>
                        <div className="text-2xl font-bold text-charcoal-800">
                          {stat.value.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Center Panel: Main Chart */}
          <div className="col-span-12 lg:col-span-6">
            {loading ? (
              <SkeletonLoader type="card" count={1} />
            ) : (
              <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-warm-200/20 h-full">
                <h3 className="text-lg font-bold text-charcoal-800 mb-4">Activity Overview</h3>
                <div className="h-64 flex items-end justify-around gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                    const height = Math.random() * 80 + 20;
                    return (
                      <div key={day} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full bg-gradient-to-t from-gold-500 to-warm-400 rounded-lg hover:opacity-80 transition-opacity" style={{ height: `${height}%` }}></div>
                        <div className="text-xs text-charcoal-600 font-medium">{day}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: Recent Activity */}
          <div className="col-span-12 lg:col-span-3">
            {loading ? (
              <SkeletonLoader type="card" count={1} />
            ) : (
              <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-warm-200/20 h-full">
                <h3 className="text-lg font-bold text-charcoal-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((_, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-warm-200/30">
                      <div className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-charcoal-800 truncate">New check-in</div>
                        <div className="text-xs text-charcoal-500">2 min ago</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🔹 SECTION 3: Bottom Table Layout */}
        <div className="bg-cream-50 rounded-2xl p-6 shadow-sm border border-warm-200/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-charcoal-800">Top Destinations</h3>
            <input
              type="search"
              placeholder="Search..."
              className="px-4 py-2 border border-warm-200 rounded-xl bg-white text-sm text-charcoal-800 placeholder-charcoal-400 focus:outline-none focus:ring-2 focus:ring-gold-400"
            />
          </div>
          
          {loading ? (
            <SkeletonLoader type="table-row" count={5} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-warm-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-charcoal-700">Destination</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-charcoal-700">Category</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-charcoal-700">Visitors</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-charcoal-700">Rating</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-charcoal-700">Points</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="border-b border-warm-100 hover:bg-warm-50 transition-colors">
                      <td className="py-4 px-4 text-sm text-charcoal-800 font-medium">Destination {i}</td>
                      <td className="py-4 px-4">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gold-100 text-gold-700">
                          Hotel
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-charcoal-600">{Math.floor(Math.random() * 500)} visits</td>
                      <td className="py-4 px-4 text-sm text-charcoal-600">⭐ 4.{Math.floor(Math.random() * 10)}</td>
                      <td className="py-4 px-4 text-sm font-semibold text-gold-600">{Math.floor(Math.random() * 100)} pts</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
});

Dashboard.displayName = 'Dashboard';

export default Dashboard;
