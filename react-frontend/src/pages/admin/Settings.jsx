import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tabSlide } from '../../utils/animations';
// AnimatedPage removed (unused)
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ToastNotification from '../../components/common/ToastNotification';
import Pagination from '../../components/common/Pagination';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import axios from 'axios';

// Auto-detect API URL for mobile access
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();

// Configure axios to send credentials with every request
axios.defaults.withCredentials = true;

const Settings = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit', 'add', 'delete'
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    status_id: 1
  });

  // Password change state
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  // Current logged-in admin (from AuthContext or localStorage)
  const [currentAdmin, setCurrentAdmin] = useState({
    id: null,
    name: 'Loading...',
    email: '',
    role: '',
    phone: '',
    joinedDate: ''
  });

  // Other admin accounts
  const [adminAccounts, setAdminAccounts] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalAdmins, setTotalAdmins] = useState(0);

  // Fetch current admin info and admin accounts on mount
  useEffect(() => {
    const loadInitialData = async () => {
      // Load from cache first for instant display
      const userData = localStorage.getItem('user_data');
      const cachedAdmins = localStorage.getItem('cached_admin_users');
      
      if (userData) {
        try {
          const user = JSON.parse(userData);
          setCurrentAdmin({
            id: user.id,
            name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.name || 'Admin',
            email: user.email,
            role: user.role_id === 1 ? 'Administrator' : 'User',
            phone: user.phone || 'Not set',
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
          });
        } catch (e) {}
      }
      
      if (cachedAdmins) {
        try {
          const parsed = JSON.parse(cachedAdmins);
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          if (parsed.data && cacheAge < 300000) { // 5 min cache
            setAdminAccounts(parsed.data);
          }
        } catch (e) {}
      }
      
      // Fetch fresh data in background - don't await
      Promise.all([
        fetchCurrentAdmin(),
        fetchAdmins()
      ]).catch(err => console.error('Background fetch error:', err));
    };
    
    loadInitialData();
  }, []);

  const fetchCurrentAdmin = async () => {
    try {
      // Fetch fresh data from API
      const response = await axios.get(`${API_BASE_URL}/user`);
      if (response.data) {
        const user = response.data;
        const adminData = {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          role: user.role_id === 1 ? 'Administrator' : 'User',
          phone: user.phone || 'Not set',
          joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown',
        };
        setCurrentAdmin(adminData);
      }
    } catch (error) {
      console.error('Error fetching current admin:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
      }
    }
  };

  const fetchAdmins = async () => {
    try {
      // Don't set loading for initial load since we have initialLoading
      if (!initialLoading) {
        setLoading(true);
      }
      // Request only admin users by passing role=admin parameter
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { role: 'admin' }
      });
      if (response.data.success) {
        // Data already filtered by backend, no need to filter again
        const adminUsers = response.data.data;
        setAdminAccounts(adminUsers);
        setTotalAdmins(adminUsers.length);
        // Cache the data
        localStorage.setItem('cached_admin_users', JSON.stringify({
          data: adminUsers,
          timestamp: Date.now()
        }));
      }
    } catch (error) {
      console.error('Error fetching admins:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      toast.error('Failed to load admin accounts');
    } finally {
      if (!initialLoading) {
        setLoading(false);
      }
    }
  };

  const handleEditProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = async () => {
    try {
      // Validate password fields
      if (!passwordData.current_password) {
        toast.error('Please enter your current password');
        return;
      }
      if (!passwordData.new_password) {
        toast.error('Please enter a new password');
        return;
      }
      if (passwordData.new_password.length < 8) {
        toast.error('New password must be at least 8 characters');
        return;
      }
      if (passwordData.new_password !== passwordData.new_password_confirmation) {
        toast.error('New passwords do not match');
        return;
      }

      setLoading(true);

      const response = await axios.put(`${API_BASE_URL}/admin/change-password`, {
        current_password: passwordData.current_password,
        password: passwordData.new_password,
        password_confirmation: passwordData.new_password_confirmation
      });

      if (response.data.success) {
        toast.success('Password changed successfully!');
        // Clear password fields
        setPasswordData({
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        });
      }
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
      }
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = () => {
    setModalMode('add');
    setSelectedAdmin(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      status_id: 1
    });
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    setFormData({
      first_name: admin.first_name || '',
      last_name: admin.last_name || '',
      email: admin.email || '',
      password: '',
      status_id: admin.status_id || 1
    });
    setShowModal(true);
  };

  const handleDeleteAdmin = (admin) => {
    if (admin.id === currentAdmin.id) {
      toast.error("You can't delete the account you're currently using");
      return;
    }
    setModalMode('delete');
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleLogout = () => {
    navigate('/');
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Calculate paginated admins
  const indexOfLastAdmin = currentPage * itemsPerPage;
  const indexOfFirstAdmin = indexOfLastAdmin - itemsPerPage;
  const paginatedAdmins = adminAccounts.slice(indexOfFirstAdmin, indexOfLastAdmin);
  const totalPages = Math.ceil(adminAccounts.length / itemsPerPage);

  const handleModalSave = async () => {
    try {
      setLoading(true);

      if (modalMode === 'add') {
        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email || !formData.password) {
          toast.error('Please fill in all required fields');
          setLoading(false);
          return;
        }

        const response = await axios.post(`${API_BASE_URL}/admin/users`, formData);
        
        if (response.data.success) {
          toast.success('Admin added successfully!');
          fetchAdmins(); // Refresh the list
        }
      } else if (modalMode === 'edit') {
        // Validate required fields
        if (!formData.first_name || !formData.last_name || !formData.email) {
          toast.error('Please fill in all required fields');
          setLoading(false);
          return;
        }

        // Remove password if empty (optional in edit)
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password;
        }

        const response = await axios.put(
          `${API_BASE_URL}/admin/users/${selectedAdmin.id}`,
          updateData
        );
        
        if (response.data.success) {
          toast.success('Admin updated successfully!');
          fetchAdmins(); // Refresh the list
        }
      } else if (modalMode === 'delete') {
        if (selectedAdmin?.id === currentAdmin.id) {
          toast.error("You can't delete the account you're currently using");
          setShowModal(false);
          return;
        }
        const response = await axios.delete(
          `${API_BASE_URL}/admin/users/${selectedAdmin.id}`
        );
        
        if (response.data.success) {
          toast.success('Admin deleted successfully!');
          fetchAdmins(); // Refresh the list
        }
      }
      
      setShowModal(false);
    } catch (error) {
      console.error('Error saving admin:', error);
      
      if (error.response?.data?.errors) {
        // Display validation errors
        const errors = error.response.data.errors;
        Object.values(errors).forEach(errorMessages => {
          errorMessages.forEach(msg => toast.error(msg));
        });
      } else {
        toast.error(error.response?.data?.message || 'An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Settings</h1>
                <p className="text-sm text-teal-50 mt-1">Manage your account and system preferences</p>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6 pb-32 sm:pb-20 md:pb-8">
          {!currentAdmin.name && !adminAccounts.length ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="flex items-center justify-center py-32">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mx-auto"></div>
                  <p className="text-slate-600 text-lg">Loading settings...</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 overflow-x-auto">
                <div className="flex gap-2 p-2 min-w-max sm:min-w-0 justify-end">
                  <Button
                    onClick={() => setActiveTab('account')}
                    variant={activeTab === 'account' ? 'primary' : 'outline'}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    }
                    className={activeTab === 'account' ? '' : 'bg-transparent hover:bg-slate-100'}
                  >
                    My Account
                  </Button>
                  <Button
                    onClick={() => setActiveTab('admins')}
                    variant={activeTab === 'admins' ? 'primary' : 'outline'}
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    }
                    className={activeTab === 'admins' ? '' : 'bg-transparent hover:bg-slate-100'}
                  >
                    Admin Accounts
                  </Button>
                </div>
              </div>

              <div className="p-8">
                {activeTab === 'account' && (
                  <>
                    <h3 className="text-xs font-medium text-slate-900 mb-6">Account Information</h3>

                    <div className="flex items-start gap-6 mb-8">
                      <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                        {currentAdmin.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-medium text-slate-900">{currentAdmin.name}</h4>
                        <p className="text-slate-600">{currentAdmin.role}</p>
                        <p className="text-sm text-slate-500 mt-2">Member since {currentAdmin.joinedDate}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={currentAdmin.name}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Email Address
                        </label>
                        <input
                          type="email"
                          defaultValue={currentAdmin.email}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Phone Number
                        </label>
                        <input
                          type="text"
                          defaultValue={currentAdmin.phone}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        />
                      </div>

                      <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                        <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                          Role
                        </label>
                        <input
                          type="text"
                          defaultValue={currentAdmin.role}
                          disabled
                          className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8">
                      <Button variant="primary" onClick={handleEditProfile}>
                        Save Changes
                      </Button>
                    </div>

                    <div className="border-t border-slate-200 pt-8 mt-8">
                      <h3 className="text-xs font-medium text-slate-900 mb-6">Change Password</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Current Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.current_password}
                            onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            New Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                            placeholder="••••••••"
                          />
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                          <label className="flex items-center gap-2 text-sm font-normal text-slate-700 mb-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Confirm Password
                          </label>
                          <input
                            type="password"
                            value={passwordData.new_password_confirmation}
                            onChange={(e) => setPasswordData({ ...passwordData, new_password_confirmation: e.target.value })}
                            className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>

                      <div className="flex gap-4 mt-6">
                        <Button variant="primary" onClick={handleChangePassword}>
                          Update Password
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'admins' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">Admin Accounts</h3>
                        <p className="text-sm text-slate-600 mt-1">Total: {totalAdmins} administrators</p>
                      </div>
                      <Button
                        variant="primary"
                        onClick={handleAddAdmin}
                        icon={
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        }
                      >
                        Add Admin
                      </Button>
                    </div>

                    {loading ? (
                      <div className="mb-6">
                        <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-teal-200">
                              <SkeletonLoader type="table-row" count={5} />
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : adminAccounts.length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-xl border-2 border-dashed border-slate-300">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </div>
                        <p className="text-slate-500 font-medium">No admin accounts found</p>
                        <p className="text-sm text-slate-400 mt-1">Add your first admin to get started</p>
                      </div>
                    ) : (
                      <>
                        <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200 overflow-hidden mb-6">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                              <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Admin</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Last Login</th>
                                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-teal-200">
                              {paginatedAdmins.map((admin) => (
                                <tr key={admin.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150">
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-md">
                                        {admin.name?.charAt(0)?.toUpperCase() || admin.first_name?.charAt(0)?.toUpperCase() || 'A'}
                                      </div>
                                      <div>
                                        <h4 className="text-sm font-semibold text-slate-900">{admin.name}</h4>
                                        <p className="text-xs text-slate-600">{admin.role}</p>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <p className="text-sm text-slate-700">{admin.email}</p>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span
                                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                                        admin.status === 'active' || admin.status_id === 1
                                          ? 'bg-teal-100 text-teal-700'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {admin.status === 'active' || admin.status_id === 1 ? 'Active' : 'Inactive'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <p className="text-xs text-slate-600">
                                      {admin.last_login_at ? new Date(admin.last_login_at).toLocaleDateString() : 'Never'}
                                    </p>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex gap-2 justify-center">
                                      <button
                                        onClick={() => handleEditAdmin(admin)}
                                        className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                        title="Edit"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAdmin(admin)}
                                        disabled={admin.id === currentAdmin.id}
                                        className={`p-2 text-white rounded-lg transition-all shadow-md ${
                                          admin.id === currentAdmin.id
                                            ? 'bg-slate-300 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-lg'
                                        }`}
                                        title="Delete"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {totalAdmins > itemsPerPage && (
                          <div className="mt-6">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              totalItems={totalAdmins}
                              itemsPerPage={itemsPerPage}
                              onPageChange={handlePageChange}
                              onItemsPerPageChange={handleItemsPerPageChange}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

    {/* Admin Modal */}
    <Modal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      title={modalMode === 'add' ? 'Add Admin' : modalMode === 'edit' ? 'Edit Admin' : 'Delete Admin'}
    >
      {modalMode === 'delete' ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xs font-medium text-slate-900">Delete {selectedAdmin?.name}?</h3>
          <p className="text-slate-600">This action cannot be undone.</p>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={handleModalSave} 
              className="flex-1"
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">First Name</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                placeholder="John"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">Last Name</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-normal text-slate-700 mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              placeholder="john@travelquest.com"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-normal text-slate-700 mb-2">Status</label>
            <select
              value={formData.status_id}
              onChange={(e) => setFormData({ ...formData, status_id: parseInt(e.target.value) })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
            >
              <option value={1}>Active</option>
              <option value={2}>Inactive</option>
              <option value={3}>Suspended</option>
              <option value={4}>Banned</option>
            </select>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-normal text-slate-700 mb-2">
              Password {modalMode === 'edit' && <span className="text-xs text-slate-500">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              placeholder="••••••••"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)} 
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={handleModalSave} 
              className="flex-1"
              disabled={loading}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            >
              {loading ? 'Saving...' : (modalMode === 'add' ? 'Add Admin' : 'Save Changes')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
    </div>
  );
});

Settings.displayName = 'Settings';

export default Settings;
