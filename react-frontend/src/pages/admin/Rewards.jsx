import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import axios from 'axios';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { getCurrentAdmin } from '../../utils/adminHelper';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import { RewardSkeletonGrid } from '../../components/common/RewardSkeleton';

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

const Rewards = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });

  // Data states
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category_id: null,
    title: '',
    description: '',
    terms_conditions: '',
    points_required: 0,
    stock_quantity: 0,
    stock_unlimited: false,
    max_redemptions_per_user: 1,
    valid_from: '',
    valid_until: '',
    redemption_period_days: 30,
    partner_name: '',
    partner_contact: '',
    image_url: '',
    is_active: true,
    is_featured: false,
    destination_ids: [], // NEW: Selected destinations where reward can be used
  });

  // Destinations state
  const [destinations, setDestinations] = useState([]);
  const [selectedDestinations, setSelectedDestinations] = useState([]);

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 rewards per page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [totalRewards, setTotalRewards] = useState(0);

  const handleLogout = () => {
    navigate('/');
  };

  // Fetch rewards from API
  const fetchRewards = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        }
      });
      const data = response.data.data || [];
      const meta = response.data.meta || {};
      setRewards(data);
      setTotalRewards(meta.total || data.length);
      localStorage.setItem('cached_rewards', JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching rewards:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory, navigate]);

  // Fetch destination categories from API (FIXED: Use destination_categories)
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle paginated response from destination_categories
      const categoryData = response.data?.data || response.data || [];
      setCategories(categoryData);
      localStorage.setItem('cached_destination_categories', JSON.stringify(categoryData));
    } catch (error) {
      console.error('Error fetching reward categories:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
        return;
      }
      toast.error('Failed to load categories');
    }
  };

  // Fetch destinations - get ALL destinations without pagination for rewards assignment
  const fetchDestinations = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/destinations?per_page=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        const data = response.data.data || [];
        setDestinations(data);
        localStorage.setItem('cached_destinations', JSON.stringify(data));
      } else if (response.data.data) {
        // Handle paginated response
        const data = response.data.data || [];
        setDestinations(data);
        localStorage.setItem('cached_destinations', JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
      }
    }
  }, [navigate]);

  useEffect(() => {
    const loadInitialData = () => {
      // Instant load from cache
      const cachedRewards = localStorage.getItem('cached_rewards');
      const cachedCategories = localStorage.getItem('cached_destination_categories');
      const cachedDestinations = localStorage.getItem('cached_destinations');
      
      let shouldFetch = false;
      
      if (cachedRewards) {
        try {
          const parsed = JSON.parse(cachedRewards);
          const cacheAge = Date.now() - (parsed.timestamp || 0);
          setRewards(parsed.data || parsed);
          if (cacheAge > 60000) shouldFetch = true;
        } catch (e) { shouldFetch = true; }
      } else { shouldFetch = true; }
      
      if (cachedCategories) try { setCategories(JSON.parse(cachedCategories)); } catch (e) {}
      if (cachedDestinations) try { setDestinations(JSON.parse(cachedDestinations)); } catch (e) {}
      
      // Fetch in background if needed
      if (shouldFetch) {
        setIsFetching(true);
        Promise.all([fetchCategories(), fetchRewards(), fetchDestinations()])
          .catch(err => console.error(err))
          .finally(() => setIsFetching(false));
      }
    };
    
    loadInitialData();
  }, [fetchRewards, fetchDestinations]);

  // Refetch when pagination or filters change
  useEffect(() => {
    setIsFetching(true);
    fetchRewards()
      .catch(err => console.error(err))
      .finally(() => setIsFetching(false));
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  // Filter and pagination logic
  const filteredRewards = rewards.filter(reward => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      reward.title?.toLowerCase().includes(query) ||
      reward.description?.toLowerCase().includes(query)
    );
    const matchesCategory = selectedCategory === 'all' || reward.category_id === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = filteredRewards.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let processedValue = type === 'checkbox' ? checked : value;
    
    // Convert category_id and points_required to numbers
    if (name === 'category_id' || name === 'points_required' || name === 'stock_quantity') {
      processedValue = value === '' || value === null ? '' : parseInt(value, 10);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
    
    if (mode === 'edit' && data) {
      setFormData({
        category_id: data.category_id || null,
        title: data.title || '',
        description: data.description || '',
        terms_conditions: data.terms_conditions || '',
        points_required: data.points_required || 0,
        stock_quantity: data.stock?.quantity || 0,
        stock_unlimited: data.stock?.unlimited || false,
        max_redemptions_per_user: data.max_redemptions_per_user || 1,
        valid_from: data.validity?.from ? data.validity.from.split('T')[0] : '',
        valid_until: data.validity?.until ? data.validity.until.split('T')[0] : '',
        redemption_period_days: data.validity?.redemption_period_days || 30,
        partner_name: data.partner?.name || '',
        partner_contact: data.partner?.contact || '',
        image_url: data.image_url || '',
        is_active: data.is_active ?? true,
        is_featured: data.is_featured ?? false,
        destination_ids: data.destinations?.map(d => d.id || d.destination_id) || [],
      });
      // Set selected destinations for the checkboxes
      setSelectedDestinations(data.destinations?.map(d => d.id || d.destination_id) || []);
    } else if (mode === 'add') {
      setFormData({
        category_id: null,
        title: '',
        description: '',
        terms_conditions: '',
        points_required: 0,
        stock_quantity: 0,
        stock_unlimited: false,
        max_redemptions_per_user: 1,
        valid_from: '',
        valid_until: '',
        redemption_period_days: 30,
        partner_name: '',
        partner_contact: '',
        image_url: '',
        is_active: true,
        is_featured: false,
        destination_ids: [],
      });
      // Clear selected destinations
      setSelectedDestinations([]);
    }
  };

  const closeModal = () => setModalState({ isOpen: false, mode: '', data: null });

  const handleView = (reward) => openModal('view', reward);
  const handleEdit = (reward) => openModal('edit', reward);
  const handleDelete = (reward) => openModal('delete', reward);
  const handleAddReward = () => openModal('add');

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API_BASE_URL}/rewards/${modalState.data.id}`, { headers });
      closeModal();
      
      // Force immediate refresh
      const response = await axios.get(`${API_BASE_URL}/rewards`, {
        params: { _t: Date.now() },
        headers
      });
      setRewards(response.data.data || []);
      toast.success('Reward deleted successfully!');
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        toast.error('❌ Reward title is required');
        return;
      }

      if (!formData.category_id) {
        toast.error('❌ Please select a category');
        return;
      }

      if (!formData.description || !formData.description.trim()) {
        toast.error('❌ Description is required');
        return;
      }

      if (!formData.points_required || formData.points_required <= 0) {
        toast.error('❌ Points required must be greater than 0');
        return;
      }

      if (selectedDestinations.length === 0) {
        toast.error('❌ Please select at least one destination where this reward can be used');
        return;
      }

      if (!formData.stock_unlimited && (!formData.stock_quantity || formData.stock_quantity <= 0)) {
        toast.error('❌ Stock quantity must be greater than 0 (or enable Unlimited Stock)');
        return;
      }

      const dataToSend = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        points_required: parseInt(formData.points_required) || 0,
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        stock_unlimited: Boolean(formData.stock_unlimited),
        max_redemptions_per_user: parseInt(formData.max_redemptions_per_user) || 1,
        redemption_period_days: parseInt(formData.redemption_period_days) || 30,
        is_active: Boolean(formData.is_active),
        is_featured: Boolean(formData.is_featured),
        destination_ids: selectedDestinations,
      };

      const token = localStorage.getItem('auth_token');
      console.log('🔑 Auth token:', token ? 'EXISTS' : 'MISSING');
      const headers = { Authorization: `Bearer ${token}` };
      console.log('📤 Sending request to:', modalState.mode === 'add' ? 'POST /rewards' : `PUT /rewards/${modalState.data.id}`);
      console.log('📦 Data:', dataToSend);

      if (modalState.mode === 'add') {
        const response = await axios.post(`${API_BASE_URL}/rewards`, dataToSend, { headers });
        closeModal();
        
        // Force immediate refresh
        const refreshResponse = await axios.get(`${API_BASE_URL}/rewards`, {
          params: { _t: Date.now() },
          headers
        });
        setRewards(refreshResponse.data.data || []);
        toast.success('✅ Reward added successfully!');
      } else if (modalState.mode === 'edit') {
        const response = await axios.put(`${API_BASE_URL}/rewards/${modalState.data.id}`, dataToSend, { headers });
        closeModal();
        
        // Force immediate refresh
        const refreshResponse = await axios.get(`${API_BASE_URL}/rewards`, {
          params: { _t: Date.now() },
          headers
        });
        setRewards(refreshResponse.data.data || []);
        toast.success('✅ Reward updated successfully!');
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      console.error('🔴 Error response:', error.response);
      console.error('🔴 Error data:', error.response?.data);
      console.error('🔴 Error status:', error.response?.status);
      
      // Handle different error types
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        // Validation errors (422)
        if (status === 422 && data?.errors) {
          const errors = data.errors;
          const errorFields = Object.keys(errors);
          
          // Show first 3 validation errors
          errorFields.slice(0, 3).forEach(field => {
            const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            toast.error(`❌ ${fieldName}: ${errors[field][0]}`);
          });
          
          if (errorFields.length > 3) {
            toast.error(`❌ ...and ${errorFields.length - 3} more validation error(s)`);
          }
        }
        // Unauthorized (401)
        else if (status === 401) {
          toast.error('🔒 Session expired. Please login again.');
          setTimeout(() => navigate('/'), 2000);
        }
        // Forbidden (403)
        else if (status === 403) {
          toast.error('🚫 You don\'t have permission to perform this action');
        }
        // Not Found (404)
        else if (status === 404) {
          toast.error('❌ Reward not found');
        }
        // Server Error (500)
        else if (status === 500) {
          const errorMsg = data?.message || 'Server error occurred';
          toast.error(`❌ Server Error: ${errorMsg}`);
          console.error('Server error details:', data);
        }
        // Other errors
        else {
          const errorMsg = data?.message || `Request failed with status ${status}`;
          toast.error(`❌ ${errorMsg}`);
        }
      }
      // Network errors
      else if (error.request) {
        toast.error('❌ Network error. Please check your connection.');
      }
      // Other errors
      else {
        toast.error(`❌ Error: ${error.message || 'Failed to save reward'}`);
      }
    }
  };

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-normal text-slate-700 mb-2">Reward Title</label>
            <p className="text-xs font-medium text-slate-900">{data.title}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-sm font-normal text-slate-700 mb-2">Description</label>
            <p className="text-xs text-slate-900">{data.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">Points Required</label>
              <p className="text-xs font-medium text-teal-600">{data.points_required}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">Category</label>
              <p className="text-xs text-slate-900">{data.category?.icon} {data.category?.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">Stock</label>
              <p className="text-xs font-medium text-slate-900">
                {data.stock?.unlimited ? 'Unlimited' : data.stock?.quantity}
              </p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-normal text-slate-700 mb-2">Total Redeemed</label>
              <p className="text-xs font-medium text-slate-900">{data.total_redeemed || 0}</p>
            </div>
          </div>

          {/* Available Destinations */}
          {data.destinations && data.destinations.length > 0 && (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-medium text-slate-700 mb-3">📍 Available at Destinations</label>
              <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-hide">
                {data.destinations.map((dest) => (
                  <div key={dest.id || dest.destination_id} className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-900">{dest.name}</p>
                      <p className="text-xs text-slate-600">📍 {dest.city}</p>
                    </div>
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full whitespace-nowrap">
                      {dest.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-normal text-slate-600 mb-2">Reward Title *</label>
            <input 
              type="text"
              name="title"
              placeholder="Enter reward title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-normal text-slate-600 mb-2">Description *</label>
            <textarea
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-normal text-slate-600 mb-2">Points Required *</label>
              <input 
                type="number"
                name="points_required"
                placeholder="50"
                value={formData.points_required}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-normal text-slate-600 mb-2">Category *</label>
              <select
                name="category_id"
                value={formData.category_id || ''}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                size="1"
                style={{ maxHeight: '200px' }}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.category_id || cat.id} value={cat.category_id || cat.id} className="py-2 text-sm">
                    {cat.icon} {cat.category_name || cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              name="stock_unlimited"
              id="stock_unlimited"
              checked={formData.stock_unlimited}
              onChange={handleInputChange}
              className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
            />
            <label htmlFor="stock_unlimited" className="text-sm font-medium text-slate-700">
              Unlimited Stock
            </label>
          </div>

          {!formData.stock_unlimited && (
            <div className="relative">
              <label className="block text-sm font-normal text-slate-600 mb-2">Stock Quantity *</label>
              <input 
                type="number"
                name="stock_quantity"
                placeholder="100"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          )}

          {/* Destination Selector */}
          <div className="relative border-t-2 border-slate-100 pt-6 mt-6">
            <label className="block text-sm font-semibold text-slate-800 mb-3">
              📍 Available at Destinations *
            </label>
            <p className="text-xs text-slate-600 mb-4">
              Select which destinations can accept this reward. Users can only convert/claim this reward at the selected locations.
            </p>
            
            <div className="grid grid-cols-1 gap-3 max-h-72 overflow-y-auto p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border-2 border-slate-200 shadow-inner scrollbar-hide">
              {destinations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500">No destinations available</p>
                </div>
              ) : (
                destinations.map((dest) => (
                  <label 
                    key={dest.id || dest.destination_id} 
                    className="group flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-teal-400 hover:shadow-md cursor-pointer transition-all duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDestinations.includes(dest.id || dest.destination_id)}
                      onChange={(e) => {
                        const destId = dest.id || dest.destination_id;
                        if (e.target.checked) {
                          setSelectedDestinations([...selectedDestinations, destId]);
                        } else {
                          setSelectedDestinations(selectedDestinations.filter(id => id !== destId));
                        }
                      }}
                      className="w-5 h-5 text-teal-600 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-teal-700 transition-colors">
                        {dest.name}
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        📍 {dest.address?.city || dest.city || 'Unknown location'}
                      </p>
                    </div>
                    <span className="text-xs font-medium bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-700 px-3 py-1.5 rounded-full whitespace-nowrap">
                      {dest.category?.name || 'General'}
                    </span>
                  </label>
                ))
              )}
            </div>
            
            {selectedDestinations.length > 0 && (
              <p className="text-xs text-teal-700 mt-2 font-medium">
                ✓ {selectedDestinations.length} destination{selectedDestinations.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      );
    }

    if (mode === 'delete' && data) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-red-100 rounded-2xl">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-center text-xs text-slate-700">
            Are you sure you want to delete the reward <span className="font-bold text-slate-900">"{data.title}"</span>?
          </p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />
      <FetchingIndicator isFetching={isFetching} />
      <AdminHeader 
        admin={getCurrentAdmin()}
        onLogout={handleLogout}
        sidebarCollapsed={sidebarCollapsed}
      />

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <main 
        className={`
          relative z-10
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12
        `}
      >
        {rewards.length === 0 ? (
          <RewardSkeletonGrid count={6} />
        ) : (
          <>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Rewards</h2>
                <p className="text-sm text-slate-600 mt-1">Manage and track reward redemptions</p>
              </div>
            </div>
            <div>
              <Button
                variant="primary"
                size="md"
                onClick={handleAddReward}
                icon={<Plus className="w-5 h-5" />}
                className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Reward
              </Button>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={Array.isArray(categories) ? categories.map(cat => ({ 
              value: cat.category_id || cat.id, 
              label: `${cat.icon} ${cat.category_name || cat.name}` 
            })) : []}
            placeholder="Search rewards by title, description, or category..."
            showFilter={true}
          />
        </div>

        {/* Results Count */}
        {searchQuery && (
          <div className="mb-4">
            <p className="text-sm text-slate-600">
              Found <span className="font-semibold text-slate-900">{filteredRewards.length}</span> rewards matching your search
            </p>
          </div>
        )}

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {paginatedRewards.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-slate-900 mb-2">No rewards found</p>
                <p className="text-slate-600 mb-4">Try adjusting your search criteria</p>
                {searchQuery && (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setSearchQuery('')}
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              paginatedRewards.map((reward) => (
                <div key={reward.id}>
              <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-300 transition-all duration-300 p-6 relative h-[280px] flex flex-col">
                {/* Category Badge and Actions at Top */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl flex items-center justify-center text-2xl">
                      {reward.category?.icon || '🎁'}
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                      {reward.category?.name || 'General'}
                    </span>
                  </div>
                  
                  {/* Hover Actions */}
                  <div className="flex gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleView(reward)}
                      className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                      title="View"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleEdit(reward)}
                      className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(reward)}
                      className="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                      title="Delete"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-1">{reward.title}</h3>

                {/* Description */}
                <p className="text-sm text-slate-600 mb-4 line-clamp-2 flex-1">{reward.description}</p>

                {/* Divider */}
                <div className="border-t border-slate-200 mb-4"></div>

                {/* Points and Status */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Points Reward</p>
                    <p className="text-2xl font-bold text-teal-600">{reward.points_required.toLocaleString()} pts</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl ${reward.is_active ? 'text-green-500' : 'text-gray-400'}`}>●</span>
                      <span className={`text-sm font-semibold ${reward.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Stock indicator at bottom */}
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
                  <span>📦</span>
                  <span>
                    {reward.stock?.unlimited ? 'Unlimited Stock' : `${reward.stock?.quantity || 0} left`}
                  </span>
                  <span className="mx-2">•</span>
                  <span>Max {reward.max_redemptions_per_user}x per user</span>
                </div>
              </div>
            </div>
              ))
            )}
          </div>

        {/* Pagination */}
        {filteredRewards.length > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredRewards.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
        </>
        )}
      </main>

      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModal}
        titleIcon={
          modalState.mode === 'view' ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : modalState.mode === 'edit' ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ) : modalState.mode === 'delete' ? (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
        title={
          modalState.mode === 'view' ? 'View Reward' : 
          modalState.mode === 'edit' ? 'Edit Reward' : 
          modalState.mode === 'delete' ? 'Confirm Delete' : 
          'Add New Reward'
        } 
        footer={
          modalState.mode === 'view' ? (
            <Button variant="outline" onClick={closeModal}>Close</Button>
          ) : modalState.mode === 'delete' ? (
            <>
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button variant="danger" onClick={confirmDelete}>Delete</Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>
                {modalState.mode === 'add' ? 'Add' : 'Save Changes'}
              </Button>
            </>
          )
        } 
        size="md"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
});

Rewards.displayName = 'Rewards';

export default Rewards;
