import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { staggerContainer, slideInFromRight, fadeInUp } from '../../utils/animations';
import AdminHeader from '../../components/common/AdminHeader';
import ViewToggle from '../../components/common/ViewToggle';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import { getCurrentAdmin } from '../../utils/adminHelper';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { Users as UsersIcon, Shield, User, Mail, Phone, MapPin, Award, Calendar, Plus, Edit, Trash2, X, Eye, EyeOff, Clock } from 'lucide-react';
import AddButton from '../../components/common/AddButton';
import AnimatedCard from '../../components/common/AnimatedCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';

const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();
axios.defaults.withCredentials = true;

const Users = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('users_view_mode') || 'table';
  });

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '', // 'add', 'edit', 'delete', 'view'
    data: null,
    step: 1, // Step 1: User Info, Step 2: Account Info
  });

  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password_confirmation: '',
    username: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    role_id: 2, // default to user
    status_id: 1, // default to active
  });

  const [showPassword, setShowPassword] = useState(false);
  const [emailValidation, setEmailValidation] = useState({
    checking: false,
    isValid: null,
    message: ''
  });

  const handleLogout = () => {
    navigate('/');
  };

  // Fetch users from API is now handled below with instant cache loading

  const fetchUsers = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          role: selectedRole !== 'all' ? selectedRole : undefined,
        }
      });

      const data = response.data.data || [];
      const meta = response.data.meta || {};
      
      setUsers(data);
      setTotalUsers(meta.total || data.length);
      setLoading(false);
      
      // Cache the data
      localStorage.setItem('cached_users', JSON.stringify({
        data: data,
        total: meta.total || data.length,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
        return;
      }
      toast.error('Failed to load users');
      setLoading(false);
    } finally {
      setIsFetching(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  // Initial load with instant cache
  useEffect(() => {
    const cached = localStorage.getItem('cached_users');
    let hasCache = false;
    
    if (cached) {
      try {
        const { data, total, timestamp } = JSON.parse(cached);
        const cacheAge = Date.now() - timestamp;
        
        // Show cached data instantly only on first page
        if (data && data.length > 0 && currentPage === 1) {
          setUsers(data);
          setTotalUsers(total || 0);
          setLoading(false);
          hasCache = true;
          console.log('⚡ Users loaded from cache:', data.length);
          
          // Skip fetch if cache is fresh (< 5 min)
          if (cacheAge < 300000) {
            setIsFetching(false);
            return;
          }
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    
    // Fetch fresh data
    setIsFetching(hasCache); // Only show fetching indicator if we have cache
    fetchUsers();
  }, []);

  // Fetch users when filters/pagination change
  useEffect(() => {
    if (currentPage > 1 || searchQuery || selectedRole !== 'all') {
      fetchUsers();
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedRole]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-700',
      user: 'bg-blue-100 text-blue-700',
      moderator: 'bg-orange-100 text-orange-700',
      owner: 'bg-green-100 text-green-700'
    };
    return roleStyles[role] || 'bg-gray-100 text-gray-700';
  };

  // Modal handlers
  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data, step: 1 });
    if (mode === 'add') {
      const roleId = selectedRole === 'owner' ? 4 : 2; // Only user or owner
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        username: '',
        phone: '',
        date_of_birth: '',
        gender: '',
        role_id: roleId,
        status_id: 1,
      });
      setEmailValidation({ checking: false, isValid: null, message: '' });
    } else if (mode === 'edit' && data) {
      setFormData({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        password: '',
        password_confirmation: '',
        username: data.username || '',
        phone: data.phone || '',
        date_of_birth: data.date_of_birth || '',
        gender: data.gender || '',
        role_id: data.role_id || 2,
        status_id: data.status_id || 1,
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null, step: 1 });
    setShowPassword(false);
    setEmailValidation({ checking: false, isValid: null, message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Real-time email validation for step 1
    if (name === 'email' && modalState.step === 1) {
      validateEmail(value);
    }
  };

  // Real-time email validation
  const validateEmail = async (email) => {
    if (!email) {
      setEmailValidation({ checking: false, isValid: null, message: '' });
      return;
    }

    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailValidation({ checking: false, isValid: false, message: 'Invalid email format' });
      return;
    }

    setEmailValidation({ checking: true, isValid: null, message: 'Checking...' });

    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE_URL}/check-email`, 
        { email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.exists) {
        setEmailValidation({ checking: false, isValid: false, message: 'Email is already taken' });
      } else {
        setEmailValidation({ checking: false, isValid: true, message: 'Email is available' });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailValidation({ checking: false, isValid: null, message: 'Could not verify email' });
    }
  };

  // Step navigation
  const goToNextStep = () => {
    if (modalState.step === 1) {
      // Validate step 1 fields
      if (!formData.first_name || !formData.last_name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (emailValidation.isValid !== true) {
        toast.error('Please provide a valid and available email');
        return;
      }

      setModalState(prev => ({ ...prev, step: 2 }));
    }
  };

  const goToPreviousStep = () => {
    setModalState(prev => ({ ...prev, step: 1 }));
  };

  // CRUD operations
  const handleAdd = async () => {
    try {
      if (!formData.password) {
        toast.error('Password is required');
        return;
      }

      if (formData.password !== formData.password_confirmation) {
        toast.error('Passwords do not match');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_BASE_URL}/admin/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'User created successfully');
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEdit = async () => {
    try {
      if (!formData.first_name || !formData.last_name || !formData.email) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (formData.password && formData.password !== formData.password_confirmation) {
        toast.error('Passwords do not match');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const updateData = { ...formData };
      if (!updateData.password) {
        delete updateData.password;
        delete updateData.password_confirmation;
      }

      const response = await axios.put(`${API_BASE_URL}/admin/users/${modalState.data.id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'User updated successfully');
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(`${API_BASE_URL}/admin/users/${modalState.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success(response.data.message || 'User deleted successfully');
        closeModal();
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleSubmit = () => {
    if (modalState.mode === 'add') {
      handleAdd();
    } else if (modalState.mode === 'edit') {
      handleEdit();
    } else if (modalState.mode === 'delete') {
      handleDelete();
    }
  };

  // Get modal content based on mode
  const getModalContent = () => {
    const { mode, data, step } = modalState;

    if (mode === 'view' && data) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {data.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{data.name}</h3>
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getRoleBadge(data.role)}`}>
                {data.role?.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">First Name</label>
              <p className="text-sm text-slate-900">{data.first_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Last Name</label>
              <p className="text-sm text-slate-900">{data.last_name || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
              <p className="text-sm text-slate-900">{data.email || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Username</label>
              <p className="text-sm text-slate-900">{data.username ? `@${data.username}` : 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
              <p className="text-sm text-slate-900">{data.phone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
              <p className="text-sm text-slate-900 capitalize">{data.gender || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Total Points</label>
              <p className="text-sm text-slate-900">{data.total_points || 0}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Level</label>
              <p className="text-sm text-slate-900">{data.level || 1}</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                data.status === 'active' ? 'bg-green-100 text-green-700' :
                data.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                data.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {data.status}
              </span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Joined</label>
              <p className="text-sm text-slate-900">{formatDate(data.created_at)}</p>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'add') {
      if (step === 1) {
        // Step 1: User/Owner Info
        return (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-teal-700 font-medium">Step 1 of 2: Personal Information</p>
            </div>

            {/* Row 1: First Name & Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2: Email with validation */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                className={`w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 rounded-lg focus:ring-2 outline-none transition-all ${
                  emailValidation.isValid === true ? 'border-green-500 focus:border-green-500 focus:ring-green-100' :
                  emailValidation.isValid === false ? 'border-red-500 focus:border-red-500 focus:ring-red-100' :
                  'border-slate-300 focus:border-teal-400 focus:ring-teal-100'
                }`}
              />
              {emailValidation.message && (
                <div className={`flex items-center gap-2 mt-1.5 text-xs ${
                  emailValidation.isValid === true ? 'text-green-600' :
                  emailValidation.isValid === false ? 'text-red-600' :
                  'text-slate-500'
                }`}>
                  {emailValidation.checking ? (
                    <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : emailValidation.isValid === true ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : emailValidation.isValid === false ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                  <span>{emailValidation.message}</span>
                </div>
              )}
            </div>

            {/* Row 3: Username & Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder="username"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+1234567890"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 4: Date of Birth & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>
            </div>
          </div>
        );
      } else if (step === 2) {
        // Step 2: Account Info
        return (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-teal-700 font-medium">Step 2 of 2: Account Information</p>
            </div>

            {/* Email (read-only, from step 1) */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                readOnly
                className="w-full px-3 py-2 text-sm text-slate-900 bg-slate-100 border-2 border-slate-300 rounded-lg cursor-not-allowed"
              />
              <p className="text-xs text-slate-500 mt-1">Email from previous step</p>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password (min. 8 characters)"
                    className="w-full px-3 py-2 pr-10 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password *</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>

            {/* Status - Hidden in add mode, automatically set to Active */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Account Status</label>
              <div className="w-full px-3 py-2 text-sm text-slate-900 bg-slate-100 border-2 border-slate-300 rounded-lg">
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">New accounts are automatically set to Active</p>
            </div>
          </div>
        );
      }
    }

    if (mode === 'edit') {
      return (
        <div className="space-y-4">
          {/* Row 1: First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">First Name *</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleInputChange}
                placeholder="Enter first name"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Last Name *</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleInputChange}
                placeholder="Enter last name"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 2: Email & Username */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="user@example.com"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="username"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 3: Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Leave blank to keep current"
                  className="w-full px-3 py-2 pr-10 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleInputChange}
                placeholder="Confirm password"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 4: Phone & Date of Birth */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="+1234567890"
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date of Birth</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 5: Gender & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Status *</label>
              <select
                name="status_id"
                value={formData.status_id}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              >
                <option value={1}>Active</option>
                <option value={2}>Inactive</option>
                <option value={3}>Suspended</option>
                <option value={4}>Banned</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'delete' && data) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-100 rounded-2xl">
            <Trash2 className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" />
          </div>
          <p className="text-center text-sm text-slate-700">
            Are you sure you want to delete user <span className="font-bold text-slate-900">"{data.name}"</span>?
            <br />
            <span className="text-xs text-red-600 mt-2 block">This action cannot be undone.</span>
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      <ToastNotification />
      <FetchingIndicator isFetching={isFetching} />
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header - Full Width */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Users Management</h1>
                <p className="text-sm text-teal-50 mt-1">Manage system users • Total: {totalUsers} users</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                {selectedRole !== 'all' && (
                  <AddButton
                    onClick={() => openModal('add')}
                    icon={Plus}
                  >
                    Add {selectedRole === 'user' ? 'User' : selectedRole === 'admin' ? 'Admin' : 'Owner'}
                  </AddButton>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content with Padding */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
        {/* Filters */}
        <div className="mb-6 flex flex-col lg:flex-row gap-4 items-stretch lg:items-start justify-between">
          <div className="flex-1 lg:max-w-2xl">
            <SearchFilter
              searchQuery={searchQuery}
              onSearchChange={handleSearchChange}
              placeholder="Search users by name, email, or username..."
            />
          </div>
          <div className="flex-shrink-0">
            <ViewToggle 
              view={viewMode} 
              onViewChange={(mode) => {
                setViewMode(mode);
                localStorage.setItem('users_view_mode', mode);
              }} 
            />
          </div>
        </div>

        {/* Role Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleRoleChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => handleRoleChange('user')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'user'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleRoleChange('owner')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'owner'
              ? 'bg-teal-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Owners
        </button>
        </div>

        {/* Users List */}
        {loading ? (
          viewMode === 'card' ? (
            <SkeletonLoader type="card" count={itemsPerPage} />
          ) : (
            <div className="bg-white rounded-xl shadow-md border-2 border-teal-200 overflow-hidden">
              <SkeletonLoader type="table-row" count={itemsPerPage} />
            </div>
          )
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
              >
                {users.map((user) => (
                  <AnimatedCard key={user.id}>
                    <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl p-6 hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)] h-full flex flex-col">
                      {/* Avatar & Header */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-bold text-gray-900 truncate">
                            {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                          </h3>
                          <div className="flex gap-2 flex-wrap mt-1">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                              {user.role === 'admin' && <Shield className="w-3 h-3 inline mr-1" />}
                              {user.role?.toUpperCase() || 'USER'}
                            </span>
                            {user.status && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                user.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' :
                                user.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                user.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {user.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* User Details */}
                      <div className="flex-1 space-y-2 text-sm mb-4">
                        {user.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        {user.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}
                        {user.username && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <User className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">@{user.username}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="w-4 h-4 flex-shrink-0" />
                          <span className="font-semibold text-teal-600">{user.total_points || 0} points</span>
                          {user.level && <span className="text-gray-400">• Level {user.level}</span>}
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Joined {formatDate(user.created_at)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openModal('view', user)}
                          className="flex-1 p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all text-sm font-medium"
                        >
                          View
                        </button>
                        {selectedRole !== 'all' && (
                          <>
                            <button
                              onClick={() => openModal('edit', user)}
                              className="flex-1 p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => openModal('delete', user)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </motion.div>
            ) : (
              <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Username</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Points/Level</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-teal-200">
                      {users.map((user) => (
                        <motion.tr
                          key={user.id}
                          variants={fadeInUp}
                          className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150"
                        >
                          {/* User Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unnamed User'}
                                </div>
                                <div className="flex gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                                    {user.role?.toUpperCase() || 'USER'}
                                  </span>
                                  {user.status && (
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                      user.status === 'active' ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' :
                                      user.status === 'inactive' ? 'bg-gray-100 text-gray-700' :
                                      user.status === 'suspended' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-red-100 text-red-700'
                                    }`}>
                                      {user.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Column */}
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              {user.email && (
                                <div className="flex items-center gap-2 text-gray-600 mb-1">
                                  <Mail className="w-4 h-4 flex-shrink-0" />
                                  <span className="truncate max-w-[200px]">{user.email}</span>
                                </div>
                              )}
                              {user.phone && (
                                <div className="flex items-center gap-2 text-gray-600">
                                  <Phone className="w-4 h-4 flex-shrink-0" />
                                  <span>{user.phone}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Username Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.username && (
                              <div className="flex items-center gap-2 text-gray-600 text-sm">
                                <User className="w-4 h-4 flex-shrink-0" />
                                <span>@{user.username}</span>
                              </div>
                            )}
                          </td>

                          {/* Points/Level Column */}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm">
                              <div className="flex items-center gap-2 text-gray-900 font-semibold">
                                <Award className="w-4 h-4 text-teal-600" />
                                <span>{user.total_points || 0} pts</span>
                              </div>
                              {user.level && (
                                <div className="text-teal-600 text-xs mt-1">Level {user.level}</div>
                              )}
                            </div>
                          </td>

                          {/* Joined Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {formatDate(user.created_at)}
                            </div>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openModal('view', user)}
                                className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all shadow-md"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {selectedRole !== 'all' && (
                                <>
                                  <button
                                    onClick={() => openModal('edit', user)}
                                    className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md"
                                    title="Edit"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => openModal('delete', user)}
                                    className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all shadow-md"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalUsers}
              />
            </div>
          </>
        )}
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === 'add' 
            ? `Add New ${selectedRole === 'owner' ? 'Owner' : 'User'}${modalState.step === 1 ? ' - Personal Info' : ' - Account Setup'}`
            : modalState.mode === 'edit' ? 'Edit User' 
            : modalState.mode === 'delete' ? 'Delete User' 
            : 'View User Details'
        }
        size="3xl"
      >
        <div className="p-6">
          {getModalContent()}
        </div>

        <div className="border-t border-slate-200 px-6 py-4 flex justify-between">
          <div>
            {modalState.mode === 'add' && modalState.step === 2 && (
              <Button
                variant="secondary"
                onClick={goToPreviousStep}
              >
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            {modalState.mode === 'view' ? (
              <Button
                variant="secondary"
                onClick={closeModal}
              >
                Close
              </Button>
            ) : modalState.mode === 'delete' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleSubmit}
                >
                  Delete User
                </Button>
              </>
            ) : modalState.mode === 'add' && modalState.step === 1 ? (
              <>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={goToNextStep}
                >
                  Next →
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="secondary"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmit}
                >
                  {modalState.mode === 'add' ? 'Create User' : 'Save Changes'}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Users;
