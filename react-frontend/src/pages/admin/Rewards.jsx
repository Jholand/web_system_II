import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, ChevronDown, Clock } from 'lucide-react';
import axios from 'axios';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
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
import AddButton from '../../components/common/AddButton';
import AnimatedCard from '../../components/common/AnimatedCard';
import ViewToggle from '../../components/common/ViewToggle';
import SkeletonLoader from '../../components/common/SkeletonLoader';

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
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasMounted = useRef(false);
  const fetchIdRef = useRef(0);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('rewards_view_mode') || 'card';
  });

  // Dropdown state
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

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

  // Helper functions for category icon display
  const isImagePath = (icon) => {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || 
           icon.endsWith('.jpg') || icon.endsWith('.jpeg') || 
           icon.endsWith('.png') || icon.endsWith('.gif') || 
           icon.endsWith('.svg') || icon.endsWith('.webp');
  };

  const getIconUrl = (icon) => {
    if (!icon) return '';
    if (isImagePath(icon)) {
      return `http://localhost:8000/storage/${icon}`;
    }
    return icon;
  };

  // Click outside handler for dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch rewards from API
  const fetchRewards = async (page, perPage, search, category) => {
    const currentFetchId = ++fetchIdRef.current;
    
    try {
      setIsFetching(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          per_page: perPage,
          search: search || undefined,
          category_id: category !== 'all' ? category : undefined,
          _t: Date.now(),
        }
      });
      
      // Only update if this is still the latest fetch
      if (currentFetchId !== fetchIdRef.current) return;
      
      const data = response.data.data || [];
      const meta = response.data.meta || {};
      
      setRewards([...data]); // Force new array reference
      setTotalRewards(meta.total || data.length);
      
      // Cache first page results
      if (page === 1 && !search && category === 'all') {
        localStorage.setItem('cached_rewards', JSON.stringify({
          data,
          total: meta.total || data.length,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error('Error fetching rewards:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) {
        setIsFetching(false);
      }
    }
  };

  // Fetch destination categories from API (FIXED: Use destination_categories)
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        params: { per_page: 100, _t: Date.now() }, // Force fresh data with timestamp
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle paginated response from destination_categories
      const categoryData = response.data?.data || response.data || [];
      setCategories(categoryData);
      // Don't cache categories - always fetch fresh
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
    const loadInitial = async () => {
      const cached = localStorage.getItem('cached_rewards');
      if (cached && currentPage === 1 && !searchQuery && selectedCategory === 'all') {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < 300000 && parsed.data?.length) {
            setRewards(parsed.data);
            setTotalRewards(parsed.total || parsed.data.length);
            setInitialLoading(false);
            hasMounted.current = true;
            // Fetch fresh data in background
            fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory);
            fetchCategories();
            fetchDestinations();
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      await Promise.all([
        fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory),
        fetchCategories(),
        fetchDestinations()
      ]);
      setInitialLoading(false);
      hasMounted.current = true;
    };

    loadInitial();
  }, []);

  // Refetch when pagination or filters change
  useEffect(() => {
    if (!hasMounted.current) return;
    
    console.log('🔄 Pagination/filter change:', { currentPage, itemsPerPage, searchQuery, selectedCategory });
    setIsFetching(true);
    fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory)
      .finally(() => setIsFetching(false));
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  // Enrich rewards with category data
  const rewardsWithCategories = React.useMemo(() => {
    return rewards.map(reward => {
      const category = categories.find(cat => 
        (cat.category_id || cat.id) === reward.category_id
      );
      return {
        ...reward,
        category: category ? {
          id: category.category_id || category.id,
          name: category.category_name || category.name,
          icon: category.icon
        } : null
      };
    });
  }, [rewards, categories]);

  // API already handles filtering and pagination, no need for client-side processing
  const paginatedRewards = rewardsWithCategories; // API returns paginated and filtered data
  const totalPages = Math.ceil(totalRewards / itemsPerPage); // Use total from API meta

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
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1);
    setIsFetching(true);
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
  const handleEdit = (reward) => {
    fetchCategories(); // Fetch in background, don't wait
    openModal('edit', reward);
  };
  const handleDelete = (reward) => openModal('delete', reward);
  const handleAddStock = (reward) => openModal('add-stock', reward);
  const handleAddReward = () => {
    fetchCategories(); // Fetch in background, don't wait
    openModal('add');
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      await axios.delete(`${API_BASE_URL}/rewards/${modalState.data.id}`, { headers });
      closeModal();
      toast.success('Reward deleted successfully!');
      
      // Clear cache and refresh data immediately
      localStorage.removeItem('cached_rewards');
      await fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory);
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleSave = async () => {
    try {
      // Handle "Add Stock" mode separately
      if (modalState.mode === 'add-stock') {
        if (!formData.stock_quantity || formData.stock_quantity <= 0) {
          toast.error('❌ Stock quantity must be greater than 0');
          return;
        }
        
        // Call API to add stock
        const token = localStorage.getItem('auth_token');
        const headers = { Authorization: `Bearer ${token}` };
        
        await axios.post(
          `${API_BASE_URL}/rewards/${modalState.data.id}/add-stock`,
          { quantity: parseInt(formData.stock_quantity) },
          { headers }
        );
        
        closeModal();
        toast.success('✅ Stock added successfully!');
        
        // Clear cache and refresh data immediately
        localStorage.removeItem('cached_rewards');
        await fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory);
        return;
      }

      // Validate required fields for add/edit modes
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
      const headers = { Authorization: `Bearer ${token}` };

      if (modalState.mode === 'add') {
        await axios.post(`${API_BASE_URL}/rewards`, dataToSend, { headers });
        closeModal();
        toast.success('✅ Reward added successfully!');
        
        // Clear cache and refresh data immediately
        localStorage.removeItem('cached_rewards');
        await Promise.all([
          fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory),
          fetchCategories()
        ]);
      } else if (modalState.mode === 'edit') {
        await axios.put(`${API_BASE_URL}/rewards/${modalState.data.id}`, dataToSend, { headers });
        closeModal();
        toast.success('✅ Reward updated successfully!');
        
        // Clear cache and refresh data immediately
        localStorage.removeItem('cached_rewards');
        await Promise.all([
          fetchRewards(currentPage, itemsPerPage, searchQuery, selectedCategory),
          fetchCategories()
        ]);
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
              <div className="flex items-center gap-2">
                {data.category?.icon && (
                  <img 
                    src={`http://localhost:8000/storage/${data.category.icon}`}
                    alt={data.category?.name}
                    className="w-6 h-6 object-cover rounded"
                  />
                )}
                <p className="text-xs font-medium text-slate-900">{data.category?.name}</p>
              </div>
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
              <label className="block text-sm font-medium text-slate-700 mb-3">
                📍 Available at Destinations ({data.destinations.length} locations)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto scrollbar-hide">
                {data.destinations.map((dest) => (
                  <div key={dest.id || dest.destination_id} className="flex items-center gap-3 p-3 bg-white rounded-lg border-2 border-slate-200 hover:border-teal-300 transition-all">
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{dest.name}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        📍 {dest.location || `${dest.city || ''}, ${dest.province || ''}`.trim().replace(/^,\s*|,\s*$/g, '') || 'Location not available'}
                      </p>
                    </div>
                    <div className="text-right">
                      {dest.category && (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full block mb-1">
                          {dest.category}
                        </span>
                      )}
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-xs font-semibold text-slate-900">📦</span>
                        <span className="text-xs font-bold text-teal-600">
                          {data.stock?.unlimited ? '∞' : (data.stock?.quantity || 0)} stock
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-300">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Total Stock Available:</span>
                  <span className="text-lg font-bold text-teal-600">
                    {data.stock?.unlimited 
                      ? '∞ Unlimited' 
                      : `${(data.stock?.quantity || 0) * data.destinations.length} items`
                    }
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  ({data.stock?.quantity || 0} per destination × {data.destinations.length} destinations)
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-3 pb-16">
          {/* Row 1: Reward Title & Category - Inline */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Reward Title *</label>
              <input 
                type="text"
                name="title"
                placeholder="Enter reward title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
              <div 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg cursor-pointer hover:border-teal-400 transition-all flex items-center justify-between"
              >
                {formData.category_id ? (
                  <div className="flex items-center gap-2">
                    {(() => {
                      const selectedCat = categories.find(c => (c.category_id || c.id) === parseInt(formData.category_id));
                      if (!selectedCat) return <span className="text-slate-400">Select category</span>;
                      const isImg = isImagePath(selectedCat.icon);
                      return (
                        <>
                          {isImg ? (
                            <img 
                              src={getIconUrl(selectedCat.icon)} 
                              alt={selectedCat.category_name || selectedCat.name}
                              className="w-4 h-4 object-cover rounded"
                            />
                          ) : (
                            <span className="text-base">{selectedCat.icon}</span>
                          )}
                          <span className="truncate">{selectedCat.category_name || selectedCat.name}</span>
                        </>
                      );
                    })()}
                  </div>
                ) : (
                  <span className="text-slate-400">Select category</span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {categoryDropdownOpen && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-300 rounded-lg shadow-lg max-h-[250px] overflow-y-auto"
                  style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  {categories.map((cat) => {
                    const isImg = isImagePath(cat.icon);
                    return (
                      <div
                        key={cat.category_id || cat.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category_id: cat.category_id || cat.id }));
                          setCategoryDropdownOpen(false);
                        }}
                        className="px-2.5 py-2 hover:bg-teal-50 cursor-pointer flex items-center gap-2 transition-colors"
                      >
                        {isImg ? (
                          <img 
                            src={getIconUrl(cat.icon)} 
                            alt={cat.category_name || cat.name}
                            className="w-5 h-5 object-cover rounded"
                          />
                        ) : (
                          <span className="text-lg">{cat.icon}</span>
                        )}
                        <span className="text-xs text-slate-900">{cat.category_name || cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Description - Compact */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
            <textarea
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Row 3: Points & Stock - Inline (Stock only in Add mode) */}
          <div className={`${mode === 'add' ? 'grid grid-cols-[1fr_1fr_auto] gap-3' : 'grid grid-cols-1'} items-end`}>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1">Points Required *</label>
              <input 
                type="number"
                name="points_required"
                placeholder="50"
                value={formData.points_required}
                onChange={handleInputChange}
                className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            {mode === 'add' && (
              <>
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
                  <input 
                    type="number"
                    name="stock_quantity"
                    placeholder="100"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    disabled={formData.stock_unlimited}
                    className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all disabled:bg-slate-100 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="relative">
                  <label className="flex items-center gap-1.5 cursor-pointer px-2.5 py-1.5 bg-slate-50 rounded-lg border-2 border-slate-200 hover:border-teal-400 transition-all">
                    <input
                      type="checkbox"
                      name="stock_unlimited"
                      checked={formData.stock_unlimited}
                      onChange={handleInputChange}
                      className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-xs font-medium text-slate-700 whitespace-nowrap">Unlimited</span>
                  </label>
                </div>
              </>
            )}
          </div>

          {/* Destination Selector - 3 Columns */}
          <div className="relative border-t border-slate-200 pt-3 mt-2">
            <label className="block text-xs font-semibold text-slate-800 mb-1">
              📍 Available at Destinations *
            </label>
            <p className="text-xs text-slate-500 mb-2">
              Select which destinations can accept this reward.
            </p>
            
            <div className="relative rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
              <div className="max-h-[160px] overflow-y-auto p-2 grid grid-cols-3 gap-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}>
            {destinations.length === 0 ? (
                  <div className="text-center py-8 col-span-3">
                    <p className="text-xs text-slate-500">No destinations available</p>
                  </div>
                ) : (
                  (() => {
                    // Filter destinations ONLY when ADDING a new reward (not editing)
                    // Parse the full user data from localStorage to get role_id
                    const userData = localStorage.getItem('user_data') ? JSON.parse(localStorage.getItem('user_data')) : null;
                    
                    const roleId = userData?.role_id;
                    const isAdmin = roleId === 1; // role_id 1 = admin (Owner is role_id 8)
                    
                    let filteredDests = destinations;
                    
                    // Only filter for owners (role_id 8) when ADDING (mode === 'add'), not when editing
                    if (mode === 'add' && !isAdmin) {
                      // If owner is adding a new reward, only show their destinations
                      const userId = userData?.id;
                      filteredDests = destinations.filter(dest => dest.owner_id === userId);
                    }
                    // When editing (mode === 'edit') or admin is adding, show ALL destinations
                    
                    return filteredDests.length === 0 ? (
                      <div className="text-center py-8 col-span-3">
                        <p className="text-xs text-slate-500">
                          {mode === 'add' && !isAdmin ? 'You have no destinations. Create one first.' : 'No destinations available'}
                        </p>
                      </div>
                    ) : (
                      filteredDests.map((dest) => (
                        <label 
                          key={dest.id || dest.destination_id} 
                          className="group flex flex-col gap-1.5 p-2 bg-white rounded-md border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-start gap-1.5">
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
                              className="w-3.5 h-3.5 mt-0.5 text-teal-600 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-700">
                                {dest.name}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {dest.address?.city || dest.city || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-center truncate">
                            {dest.category?.name || 'General'}
                          </span>
                        </label>
                      ))
                    );
                  })()
                )}
              </div>
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
        <div className="space-y-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl shadow-lg">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-slate-600 mb-1">You're about to delete this reward:</p>
            <p className="text-base font-semibold text-slate-900 break-words">"{data.title}"</p>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-3 mt-4">
            <p className="text-xs text-red-700">
              ⚠️ This action cannot be undone. The reward will be permanently deleted from the system.
            </p>
          </div>
        </div>
      );
    }

    if (mode === 'add-stock' && data) {
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-4 border-2 border-purple-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{data.title}</h3>
            <p className="text-sm text-slate-600">Add stock for this reward across destinations</p>
          </div>

          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Stock Quantity to Add *</label>
            <input 
              type="number"
              name="stock_quantity"
              placeholder="Enter quantity"
              value={formData.stock_quantity || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
            />
            <p className="text-xs text-slate-500 mt-1">This will add stock to all destinations where this reward is available</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
            <p className="text-xs text-slate-600">
              Current Stock: <span className="font-semibold text-slate-900">
                {data.stock?.unlimited ? 'Unlimited' : `${(data.stock?.quantity || 0) * (data.destinations?.length || 1)} total`}
              </span>
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Available at: <span className="font-semibold text-slate-900">{data.destinations?.length || 0} locations</span>
            </p>
          </div>
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

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header - Always Visible */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Rewards</h1>
                <p className="text-sm text-teal-50 mt-1">Manage and track reward redemptions</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <AddButton
                  onClick={handleAddReward}
                  icon={Plus}
                >
                  Add Reward
                </AddButton>
              </div>
            </div>
          </div>
        </header>

        {/* Content with Padding */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          {/* Search and Filter - Always Visible */}
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start justify-between mb-6">
            <div className="flex-1 lg:max-w-2xl">
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                categories={Array.isArray(categories) ? categories.map(cat => ({ 
                  id: cat.category_id || cat.id,
                  value: cat.category_id || cat.id, 
                  name: cat.category_name || cat.name,
                  icon: cat.icon,
                  label: cat.category_name || cat.name 
                })) : []}
                placeholder="Search rewards by title, description, or category..."
                showFilter={true}
              />
            </div>
            <div className="flex-shrink-0">
              <ViewToggle 
                view={viewMode} 
                onViewChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem('rewards_view_mode', mode);
                }} 
              />
            </div>
          </div>

          {initialLoading ? (
            viewMode === 'card' ? (
              <SkeletonLoader type="card" count={6} />
            ) : (
              <div className="bg-white rounded-xl shadow-md border-2 border-teal-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Destinations</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <SkeletonLoader type="table-row" count={6} />
                </table>
              </div>
            )
          ) : (
            <>
              {/* Results Count */}
              {searchQuery && (
                <div className="mb-4">
                  <p className="text-sm text-slate-600">
                    Found <span className="font-semibold text-slate-900">{paginatedRewards.length}</span> rewards matching your search
                  </p>
                </div>
              )}

              {/* Rewards Grid or Table */}
        {viewMode === 'card' ? (
        <motion.div
          key={`rewards-page-${currentPage}`}
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
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
                <AnimatedCard key={reward.id}>
              <div className="group bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl p-6 hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)] relative min-h-[320px] flex flex-col">
                {/* Category Badge and Actions at Top */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl flex items-center justify-center overflow-hidden shadow-md">
                      {(() => {
                        const icon = reward.category?.icon || '🎁';
                        if (isImagePath(icon)) {
                          return (
                            <img 
                              src={getIconUrl(icon)} 
                              alt={reward.category?.name || 'Category'} 
                              className="w-full h-full object-cover"
                            />
                          );
                        }
                        return <span className="text-2xl">{icon}</span>;
                      })()}
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
                    {reward.can_edit && (
                      <button
                        onClick={() => handleEdit(reward)}
                        className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {reward.can_add_stock && (
                      <button
                        onClick={() => handleAddStock(reward)}
                        className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                        title="Add Stock"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}
                    {reward.can_delete && (
                      <button
                        onClick={() => handleDelete(reward)}
                        className="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
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
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-600">
                      <span>📦</span>
                      <span className="font-semibold">
                        {reward.stock?.unlimited 
                          ? 'Unlimited Stock' 
                          : `${(reward.stock?.quantity || 0) * (reward.destinations?.length || 1)} total`
                        }
                      </span>
                    </div>
                    <span className="text-slate-500">
                      Max {reward.max_redemptions_per_user}x/user
                    </span>
                  </div>
                  {!reward.stock?.unlimited && reward.destinations?.length > 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                      {reward.stock?.quantity || 0} per destination × {reward.destinations.length} locations
                    </p>
                  )}
                </div>
                </div>
              </AnimatedCard>
            ))
          )}
        </motion.div>
        ) : (
          <div className="overflow-x-auto bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Points</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Destinations</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-teal-200">
                {paginatedRewards.map((reward) => (
                  <tr key={reward.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{reward.title}</div>
                      <div className="text-xs text-slate-600 truncate max-w-xs">{reward.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg shadow-md flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                          {reward.category?.icon && (reward.category.icon.includes('/') || reward.category.icon.includes('\\') || reward.category.icon.includes('.png') || reward.category.icon.includes('.jpg') || reward.category.icon.includes('.jpeg')) ? (
                            <img 
                              src={reward.category.icon.startsWith('http') ? reward.category.icon : `http://localhost:8000/storage/${reward.category.icon}`}
                              alt={reward.category?.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = '<span class="text-lg">📁</span>';
                              }}
                            />
                          ) : (
                            <span>{reward.category?.icon || '📁'}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-700">{reward.category?.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-teal-600">{reward.points_required} pts</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      {reward.stock?.unlimited ? 'Unlimited' : `${(reward.stock?.quantity || 0) * (reward.destinations?.length || 1)} total`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{reward.destinations?.length || 0} locations</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {reward.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => handleView(reward)} className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all shadow-md" title="View">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        {reward.can_edit && (
                          <button onClick={() => handleEdit(reward)} className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </button>
                        )}
                        {reward.can_add_stock && (
                          <button onClick={() => handleAddStock(reward)} className="p-2 bg-gradient-to-br from-purple-400 to-violet-500 text-white rounded-lg hover:from-purple-500 hover:to-violet-600 transition-all shadow-md" title="Add Stock">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                          </button>
                        )}
                        {reward.can_delete && (
                          <button onClick={() => handleDelete(reward)} className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all shadow-md" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        {totalRewards > itemsPerPage && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalRewards}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        )}
            </>
          )}
        </main>
      </div>

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
                {modalState.mode === 'add' ? 'Add Reward' : 'Save Changes'}
              </Button>
            </>
          )
        } 
        size={modalState.mode === 'delete' ? 'md' : '2xl'}
        scrollable={false}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
});

Rewards.displayName = 'Rewards';

export default Rewards;
