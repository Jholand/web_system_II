import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { QrCode, Search, CheckCircle, XCircle, Clock, LayoutDashboard, Gift, LogOut, Menu, X, Scan, ChevronLeft, Store } from 'lucide-react';
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

const OwnerRedemptions = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCode, setSearchCode] = useState('');
  const [selectedRedemption, setSelectedRedemption] = useState(null);
  const [claiming, setClaiming] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [ownerDestinations, setOwnerDestinations] = useState([]);
  const [selectedDestinationId, setSelectedDestinationId] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userInitial = currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : 'O';

  useEffect(() => {
    fetchRedemptions();
    fetchOwnerDestinations();
  }, [statusFilter]);

  const fetchOwnerDestinations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/destinations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOwnerDestinations(response.data.data || []);
      // Don't auto-select here - let useEffect handle it when redemption is selected
    } catch (error) {
      console.error('Error fetching owner destinations:', error);
    }
  };

  const fetchRedemptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/redemptions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { status: statusFilter }
      });
      setRedemptions(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching redemptions:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        toast.error('Session expired');
        navigate('/');
      }
      setLoading(false);
    }
  };

  // Auto-select destination when redemption is loaded
  useEffect(() => {
    if (selectedRedemption && ownerDestinations.length > 0) {
      if (selectedRedemption.destination_id) {
        // If redemption has specific destination, check if owner owns it
        const redemptionDestId = selectedRedemption.destination_id;
        const redemptionDest = ownerDestinations.find(d => d.destination_id === redemptionDestId);
        
        if (redemptionDest) {
          // Owner owns the redemption destination - auto-select it
          setSelectedDestinationId(redemptionDestId);
        } else {
          // Owner doesn't own the redemption destination - can't claim this
          setSelectedDestinationId(null);
          toast.error('This reward was redeemed for a different destination that you do not own');
        }
      } else {
        // No specific destination, select first available
        if (ownerDestinations.length > 0) {
          setSelectedDestinationId(ownerDestinations[0].destination_id);
        }
      }
    }
  }, [selectedRedemption, ownerDestinations]);

  const handleSearchCode = async () => {
    if (!searchCode.trim()) {
      toast.error('Please enter a redemption code');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const apiUrl = getApiUrl();
      const response = await axios.get(`${apiUrl}/owner/redemptions/code/${searchCode}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedRedemption(response.data.data);
    } catch (error) {
      console.error('Error searching code:', error);
      toast.error(error.response?.data?.message || 'Redemption code not found');
      setSelectedRedemption(null);
    }
  };

  const handleClaimReward = async () => {
    if (!selectedRedemption) return;
    
    if (!selectedDestinationId) {
      toast.error('Please select a destination to claim at');
      return;
    }

    try {
      setClaiming(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(
        `${API_BASE_URL}/owner/redemptions/claim/${selectedRedemption.redemption_code}`,
        { destination_id: selectedDestinationId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(response.data.message || 'Reward claimed successfully!');
      setSelectedRedemption(null);
      setSearchCode('');
      setShowCodeModal(false);
      fetchRedemptions();
      setClaiming(false);
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error(error.response?.data?.message || 'Failed to claim reward');
      setClaiming(false);
    }
  };

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    navigate('/');
    toast.success('Logged out successfully');
  };

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

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-700',
      active: 'bg-blue-100 text-blue-700',
      used: 'bg-green-100 text-green-700',
      expired: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700',
    };
    return styles[status] || 'bg-gray-100 text-gray-700';
  };

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

      {/* Navigation */}
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
                <h1 className="text-3xl font-bold text-white">Reward Redemptions</h1>
                <p className="text-sm text-teal-50 mt-1">Scan and verify customer reward codes</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                <Clock className="w-5 h-5 text-white" />
                <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scanner Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-1 overflow-x-auto">
              {['all', 'pending', 'used', 'expired'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                    statusFilter === filter
                      ? 'bg-teal-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>

            {/* Enter Code Button */}
            <button
              onClick={() => setShowCodeModal(true)}
              className="px-6 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition font-semibold flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
            >
              <QrCode className="w-5 h-5" />
              Enter Code
            </button>
          </div>

          {/* Redemptions List */}
          {loading ? (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reward</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Destination</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    <SkeletonLoader type="table-row" count={10} />
                  </tbody>
                </table>
              </div>
            </div>
          ) : redemptions.length > 0 ? (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reward</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Destination</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {redemptions.map((redemption) => {
                      // ⚡ Check if expired
                      const isExpired = new Date(redemption.valid_until) < new Date();
                      const displayStatus = isExpired && redemption.status === 'active' ? 'expired' : redemption.status;
                      
                      return (
                        <tr key={redemption.id} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4">
                            <span className="font-mono text-sm font-semibold text-gray-900">
                              {redemption.redemption_code}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{redemption.user?.name || 'N/A'}</p>
                            <p className="text-xs text-gray-500">{redemption.user?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-medium text-gray-900">{redemption.reward?.title || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-900">{redemption.destination?.name || 'N/A'}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600">
                              {new Date(redemption.redeemed_at).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(redemption.redeemed_at).toLocaleTimeString()}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(displayStatus)}`}>
                              {displayStatus}
                            </span>
                            {isExpired && redemption.status === 'active' && (
                              <p className="text-xs text-red-600 mt-1">⚠️ Expired</p>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg mb-2">No redemptions found</p>
              <p className="text-gray-500 text-sm">Scan customer QR codes to see them here</p>
            </div>
          )}
        </main>
      </div>

      {/* Enter Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Enter Redemption Code</h3>
              <button
                onClick={() => {
                  setShowCodeModal(false);
                  setSearchCode('');
                  setSelectedRedemption(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Redemption Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchCode()}
                    placeholder="Enter code (e.g., ABC123)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent font-mono uppercase"
                  />
                  <button
                    onClick={handleSearchCode}
                    className="px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
                  >
                    <Search className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {selectedRedemption && (
                <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Customer</p>
                      <p className="font-semibold text-gray-900">{selectedRedemption.user?.name}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-teal-600" />
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Reward</p>
                    <p className="font-semibold text-gray-900">{selectedRedemption.reward?.title}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    {(() => {
                      const isExpired = new Date(selectedRedemption.valid_until) < new Date();
                      const displayStatus = isExpired && selectedRedemption.status === 'active' ? 'expired' : selectedRedemption.status;
                      return (
                        <>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(displayStatus)}`}>
                            {displayStatus}
                          </span>
                          {isExpired && selectedRedemption.status === 'active' && (
                            <p className="text-xs text-red-600 mt-1">⚠️ This code has expired</p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {selectedRedemption.status === 'active' && new Date(selectedRedemption.valid_until) >= new Date() && ownerDestinations.length > 0 && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Destination <span className="text-red-500">*</span>
                        </label>
                        {(() => {
                          const redemptionDestId = selectedRedemption.destination_id;
                          const redemptionDest = ownerDestinations.find(d => d.destination_id === redemptionDestId);
                          
                          if (redemptionDestId && !redemptionDest) {
                            // Redemption has specific destination but owner doesn't own it
                            return (
                              <div className="w-full px-4 py-3 bg-red-50 border-2 border-red-300 rounded-lg">
                                <p className="text-sm font-medium text-red-900">
                                  ❌ Cannot claim this reward
                                </p>
                                <p className="text-xs text-red-700 mt-1">
                                  This reward was redeemed for a destination you do not own.
                                  {selectedRedemption.destination && ` (${selectedRedemption.destination.name})`}
                                </p>
                              </div>
                            );
                          }
                          
                          if (redemptionDest) {
                            // Owner owns the redemption destination - auto-selected
                            return (
                              <>
                                <div className="w-full px-4 py-3 bg-teal-50 border-2 border-teal-300 rounded-lg font-medium text-teal-900">
                                  📍 {redemptionDest.name}
                                </div>
                                <p className="text-xs text-teal-600 mt-1">
                                  ✓ Auto-selected - Reward was redeemed for this destination
                                </p>
                              </>
                            );
                          }
                          
                          // No specific destination - allow owner to select any of their destinations
                          return (
                            <>
                              <select
                                value={selectedDestinationId || ''}
                                onChange={(e) => setSelectedDestinationId(Number(e.target.value))}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                              >
                                {ownerDestinations.map((dest) => (
                                  <option key={dest.destination_id} value={dest.destination_id}>
                                    {dest.name}
                                  </option>
                                ))}
                              </select>
                              <p className="text-xs text-gray-500 mt-1">
                                Select which destination is claiming this reward
                              </p>
                            </>
                          );
                        })()}
                      </div>

                      {(() => {
                        const redemptionDestId = selectedRedemption.destination_id;
                        const redemptionDest = ownerDestinations.find(d => d.destination_id === redemptionDestId);
                        const canClaim = !redemptionDestId || redemptionDest; // Can claim if no specific destination OR owner owns it
                        
                        return (
                          <button
                            onClick={handleClaimReward}
                            disabled={claiming || !selectedDestinationId || !canClaim}
                            className="w-full mt-4 px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {claiming ? 'Processing...' : 'Claim Reward'}
                          </button>
                        );
                      })()}
                    </>
                  )}

                  {selectedRedemption.status === 'active' && ownerDestinations.length === 0 && (
                    <div className="flex items-center gap-2 text-amber-600 mt-2 bg-amber-50 p-3 rounded-lg">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">No destinations found</span>
                    </div>
                  )}

                  {selectedRedemption.status === 'used' && (
                    <div className="flex items-center gap-2 text-green-600 mt-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Already claimed</span>
                    </div>
                  )}

                  {selectedRedemption.status === 'expired' && (
                    <div className="flex items-center gap-2 text-red-600 mt-2">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Expired</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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

export default OwnerRedemptions;
