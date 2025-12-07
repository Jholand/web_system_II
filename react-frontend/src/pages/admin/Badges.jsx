import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Upload, X, ChevronDown, Clock } from 'lucide-react';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import AdminHeader from '../../components/common/AdminHeader';
import ViewToggle from '../../components/common/ViewToggle';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import { getCurrentAdmin } from '../../utils/adminHelper';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import AddButton from '../../components/common/AddButton';
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

const getStorageUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/storage';
  }
  return `http://${hostname}:8000/storage`;
};

const API_BASE_URL = getApiUrl();
const STORAGE_URL = getStorageUrl();

// Configure axios to send credentials with every request
axios.defaults.withCredentials = true;

const Badges = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Helper function to check if icon is an image path
  const isImagePath = (icon) => {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || 
           icon.endsWith('.jpg') || icon.endsWith('.jpeg') || 
           icon.endsWith('.png') || icon.endsWith('.gif') || 
           icon.endsWith('.webp');
  };

  // Helper function to get full image URL
  const getIconUrl = (icon) => {
    if (isImagePath(icon)) {
      return `${STORAGE_URL}/${icon}`;
    }
    return icon; // Return emoji as is
  };
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });
  const [categories, setCategories] = useState([]);
  const [iconPreview, setIconPreview] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '🎯', // Default emoji icon
    category_id: null,
    requirement_type: 'visits',
    requirement_value: 1,
    points_reward: 0,
    rarity: 'common',
    color: '#10B981',
    is_active: true,
  });

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 badges per page
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('badges_view_mode') || 'card';
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [totalBadges, setTotalBadges] = useState(0);
  const [badges, setBadges] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasMounted = useRef(false);
  const fetchIdRef = useRef(0); // Track fetch requests to prevent race conditions

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { per_page: 100 },
      });
      const data = response.data.data || [];
      setCategories(data);
      localStorage.setItem('cached_badge_categories', JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/');
      }
    }
  };

  const fetchBadges = async (page, perPage, search, category) => {
    const currentFetchId = ++fetchIdRef.current;
    
    try {
      setIsFetching(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/badges`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: page,
          per_page: perPage,
          search: search || undefined,
          category: category !== 'all' ? category : undefined,
          _t: Date.now(),
        }
      });
      
      // Only update if this is still the latest fetch
      if (currentFetchId !== fetchIdRef.current) return;
      
      const data = response.data.data || [];
      const meta = response.data.meta || {};
      setBadges([...data]);
      setTotalBadges(meta.total || data.length);
      
      // Cache first page results
      if (page === 1 && !search && category === 'all') {
        localStorage.setItem('cached_badges', JSON.stringify({
          data,
          total: meta.total || data.length,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      if (currentFetchId !== fetchIdRef.current) return;
      console.error('Error fetching badges:', error);
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

  // Initial load
  useEffect(() => {
    const loadInitial = async () => {
      const cached = localStorage.getItem('cached_badges');
      if (cached && currentPage === 1 && !searchQuery && selectedCategory === 'all') {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < 300000 && parsed.data?.length) {
            setBadges(parsed.data);
            setTotalBadges(parsed.total || parsed.data.length);
            setInitialLoading(false);
            hasMounted.current = true;
            // Fetch fresh data in background
            fetchBadges(currentPage, itemsPerPage, searchQuery, selectedCategory);
            fetchCategories();
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      await Promise.all([
        fetchBadges(currentPage, itemsPerPage, searchQuery, selectedCategory),
        fetchCategories()
      ]);
      setInitialLoading(false);
      hasMounted.current = true;
    };
    
    loadInitial();
  }, []);

  // Refetch when pagination/filters change
  useEffect(() => {
    if (!hasMounted.current) return;
    
    console.log('🔄 Pagination/filter change:', { currentPage, itemsPerPage, searchQuery, selectedCategory });
    setIsFetching(true);
    fetchBadges(currentPage, itemsPerPage, searchQuery, selectedCategory)
      .finally(() => setIsFetching(false));
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size should be less than 2MB');
        return;
      }

      setIconFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearIcon = () => {
    setIconFile(null);
    setIconPreview(null);
    setFormData(prev => ({ ...prev, icon: '' }));
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogout = () => {
    navigate('/');
  };

  // API already handles filtering and pagination
  const paginatedBadges = badges; // API returns filtered and paginated data
  const totalCount = totalBadges || badges.length; // Fallback to local length when meta missing
  const totalPages = Math.ceil(totalCount / itemsPerPage); // Use total count for pagination

  // Reset to page 1 when filters change
  const handleSearchChange = useCallback((query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    setIsFetching(true);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleItemsPerPageChange = useCallback((items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setIsFetching(true);
  }, []);

  const openModal = (mode, data = null) => {
    console.log('📦 Raw data received:', JSON.stringify(data, null, 2));
    
    if (mode === 'add') {
      setFormData({
        name: '',
        description: '',
        icon: '🎯', // Default emoji icon
        category_id: '',
        requirement_type: 'visits',
        requirement_value: 1,
        points_reward: 0,
        rarity: 'common',
        color: '#10B981',
        is_active: true,
      });
      setIconPreview(null);
      setIconFile(null);
    } else if (mode === 'edit' && data) {
      // Handle nested requirement object from API
      const requirementType = data.requirement?.type || data.requirement_type || 'visits';
      const requirementValue = data.requirement?.value || data.requirement_value || 1;
      
      console.log('🔧 Extracting requirement data:');
      console.log('  - data.requirement:', data.requirement);
      console.log('  - data.requirement?.type:', data.requirement?.type);
      console.log('  - data.requirement?.value:', data.requirement?.value);
      console.log('  - data.requirement_type:', data.requirement_type);
      console.log('  - data.requirement_value:', data.requirement_value);
      console.log('  - Final requirementType:', requirementType);
      console.log('  - Final requirementValue:', requirementValue);
      
      setFormData({
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || '🎯',
        category_id: data.category_id || '',
        requirement_type: requirementType,
        requirement_value: requirementValue,
        points_reward: data.points_reward || 0,
        rarity: data.rarity || 'common',
        color: data.color || '#10B981',
        is_active: data.is_active === true,
      });
      
      console.log('✅ Form data set:', {
        requirement_type: requirementType,
        requirement_value: requirementValue
      });
      
      // For icon preview, check if it's a path or emoji
      if (data.icon && isImagePath(data.icon)) {
        setIconPreview(`${STORAGE_URL}/${data.icon}`);
      } else {
        setIconPreview(data.icon || null);
      }
      setIconFile(null);
    }
    setModalState({ isOpen: true, mode, data });
  };
  
  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    setFormData({
      name: '',
      description: '',
      icon: '',
      category_id: '',
      requirement_type: 'visits',
      requirement_value: 1,
      points_reward: 0,
      rarity: 'common',
      color: '#10B981',
      is_active: true,
    });
    setIconPreview(null);
    setIconFile(null);
  };

  const handleView = (badge) => openModal('view', badge);
  const handleEdit = (badge) => openModal('edit', badge);
  const handleDelete = (badge) => openModal('delete', badge);
  const handleAddBadge = () => openModal('add');

  const confirmDelete = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/badges/${deleteState.badge.id}`);
      toast.success('Badge deleted successfully!');
      await fetchBadges();
      closeDeleteModal();
    } catch (error) {
      console.error('Error deleting badge:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete badge';
      toast.error(errorMessage);
    }
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.name) {
        toast.error('Badge name is required');
        return;
      }

      console.log('Submitting badge with data:', formData);

      // Prepare data for API
      const dataToSend = { 
        ...formData,
        // Ensure proper types
        category_id: formData.category_id ? parseInt(formData.category_id) : null, // null if empty
        points_reward: parseInt(formData.points_reward) || 0,
        requirement_value: parseInt(formData.requirement_value) || 1,
        is_active: Boolean(formData.is_active), // Ensure boolean
        icon: formData.icon || '🎯', // Ensure icon has a value
      };

      // Handle icon file upload if present
      let requestData;
      let headers = {};
      
      if (iconFile) {
        requestData = new FormData();
        Object.keys(dataToSend).forEach(key => {
          // Don't append the icon field if we have a file
          if (key !== 'icon') {
            requestData.append(key, dataToSend[key]);
          }
        });
        requestData.append('icon', iconFile);
        headers = { 'Content-Type': 'multipart/form-data' };
      } else {
        requestData = dataToSend;
        headers = { 'Content-Type': 'application/json' };
      }

      console.log('Request data:', requestData);

      if (modalState.mode === 'add') {
        await axios.post(`${API_BASE_URL}/badges`, requestData, { headers });
        closeModal();
        
        // Force immediate refresh to show new badge
        const response = await axios.get(`${API_BASE_URL}/badges`, {
          params: { _t: Date.now() },
        });
        setBadges(response.data.data || []);
        toast.success('Badge added successfully!');
      } else if (modalState.mode === 'edit') {
        // For file uploads in edit mode, use POST with _method override
        if (iconFile) {
          requestData.append('_method', 'PUT');
          await axios.post(`${API_BASE_URL}/badges/${modalState.data.id}`, requestData, { headers });
        } else {
          await axios.put(`${API_BASE_URL}/badges/${modalState.data.id}`, requestData, { headers });
        }
        closeModal();
        
        // Force immediate refresh to show updated badge
        const response = await axios.get(`${API_BASE_URL}/badges`, {
          params: { _t: Date.now() },
        });
        setBadges(response.data.data || []);
        toast.success('Badge updated successfully!');
      }
    } catch (error) {
      console.error('Error saving badge:', error);
      console.log('Validation errors:', error.response?.data?.errors);
      console.log('Error response:', error.response?.data);
      console.log('Full error data:', JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.message || 'Failed to save badge';
      
      // Show validation errors if available
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          const errorMsg = `${field}: ${errors[field].join(', ')}`;
          console.error('Field error:', errorMsg);
          toast.error(errorMsg);
        });
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      console.log('🔍 View mode data:', data);
      
      const getRequirementText = () => {
        // Handle nested requirement object from API
        const type = data.requirement?.type || data.requirement_type || 'visits';
        const value = data.requirement?.value || data.requirement_value || 1;
        
        console.log('📊 Requirement - type:', type, 'value:', value);
        
        switch(type) {
          case 'visits': return `Complete ${value} check-in${value > 1 ? 's' : ''} at any destinations`;
          case 'points': return `Earn ${value.toLocaleString()} total points`;
          case 'checkins': return `Visit ${value} unique destination${value > 1 ? 's' : ''}`;
          case 'categories': return `Visit ${value} different categor${value > 1 ? 'ies' : 'y'}`;
          case 'custom': return `Custom requirement: ${value}`;
          default: return `${value} ${type}`;
        }
      };

      // Display icon properly - check if it's an image path or emoji
      const displayIcon = isImagePath(data.icon) ? (
        <img src={`${STORAGE_URL}/${data.icon}`} alt={data.name} className="w-full h-full object-cover rounded-2xl" />
      ) : (
        <span className="text-4xl sm:text-5xl">{data.icon}</span>
      );

      return (
        <div className="space-y-3">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl overflow-hidden">
            {displayIcon}
          </div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">Badge Name</label>
            <p className="text-xs font-medium text-slate-900">{data.name}</p>
          </div>

          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
            <p className="text-xs text-slate-900">{data.description}</p>
          </div>

          {/* Achievement Requirement Display */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-2 border border-teal-200">
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
              <span className="text-sm">🎯</span>
              Achievement Requirement
            </label>
            <p className="text-xs font-medium text-slate-900">{getRequirementText()}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">Points Reward</label>
              <p className="text-xs font-medium text-teal-600">{data.points_reward || 0} pts</p>
            </div>

            <div className="bg-slate-50 rounded-lg p-2 border border-slate-200">
              <label className="block text-xs font-bold text-slate-700 mb-1">Rarity</label>
              <p className="text-xs font-medium text-slate-900 capitalize">{data.rarity}</p>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-4">
          {/* Row 1: Badge Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Badge Name *</label>
              <input 
                type="text" 
                name="name"
                placeholder="Enter badge name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative" ref={categoryDropdownRef}>
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Category (Optional)</label>
              <div
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-teal-400 hover:border-teal-300 cursor-pointer transition-all flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {formData.category_id ? (
                    <>
                      {(() => {
                        const selectedCat = categories.find(c => c.id == formData.category_id);
                        if (!selectedCat) return <span>Select a category</span>;
                        const isImg = isImagePath(selectedCat.icon);
                        return (
                          <>
                            {isImg ? (
                              <img src={getIconUrl(selectedCat.icon)} alt="" className="w-5 h-5 rounded object-cover" />
                            ) : (
                              <span className="text-lg">{selectedCat.icon}</span>
                            )}
                            <span>{selectedCat.name}</span>
                          </>
                        );
                      })()}
                    </>
                  ) : (
                    <span className="text-slate-500">Select a category (optional)</span>
                  )}
                </div>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
              
              {categoryDropdownOpen && (
                <div 
                  className="absolute z-50 w-full mt-1 bg-white border-2 border-slate-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                  onWheel={(e) => e.stopPropagation()}
                  onTouchMove={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => {
                      setFormData(prev => ({ ...prev, category_id: null }));
                      setCategoryDropdownOpen(false);
                    }}
                    className="px-3 py-2 hover:bg-teal-50 cursor-pointer transition-colors text-sm text-slate-500"
                  >
                    None (optional)
                  </div>
                  {categories.map((cat) => {
                    const isImg = isImagePath(cat.icon);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, category_id: cat.id }));
                          setCategoryDropdownOpen(false);
                        }}
                        className={`px-3 py-2 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-2 ${formData.category_id == cat.id ? 'bg-teal-100' : ''}`}
                      >
                        {isImg ? (
                          <img src={getIconUrl(cat.icon)} alt={cat.name} className="w-6 h-6 rounded object-cover flex-shrink-0" />
                        ) : (
                          <span className="text-lg flex-shrink-0">{cat.icon}</span>
                        )}
                        <span className="text-sm">{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Description *</label>
            <textarea 
              name="description"
              placeholder="Enter description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            />
          </div>

          {/* Row 3: Icon Upload (Compact Inline) */}
          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Badge Icon *</label>
            
            <div className="flex items-center gap-3">
              {/* Icon Preview */}
              {iconPreview ? (
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl border-2 border-slate-200 flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
                    {iconFile ? (
                      <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">{iconPreview}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearIcon}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 flex-shrink-0">
                  <Upload size={20} className="text-slate-400" />
                </div>
              )}

              {/* Upload Button */}
              <label className="flex-shrink-0">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconUpload}
                  className="hidden"
                />
                <div className="px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors">
                  <Upload size={14} />
                  Upload
                </div>
              </label>

              {/* Emoji Input */}
              <input
                type="text"
                name="icon"
                placeholder="or emoji 🎯"
                value={formData.icon}
                onChange={(e) => {
                  handleInputChange(e);
                  setIconPreview(e.target.value);
                  setIconFile(null);
                }}
                className="flex-1 px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
          </div>

          {/* Row 4: Achievement Requirements (Compact) */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-3 border-2 border-teal-200">
            <h3 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-2">
              <span className="text-base">🎯</span>
              Achievement Requirements
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Requirement Type *</label>
                <select
                  name="requirement_type"
                  value={formData.requirement_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                >
                  <option value="visits">🏛️ Total Visits</option>
                  <option value="points">⭐ Points</option>
                  <option value="checkins">📍 Destinations</option>
                  <option value="categories">🗂️ Categories</option>
                  <option value="custom">⚙️ Custom</option>
                </select>
              </div>

              <div className="relative">
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Value Required *</label>
                <input 
                  type="number" 
                  name="requirement_value"
                  placeholder={
                    formData.requirement_type === 'visits' ? '50' :
                    formData.requirement_type === 'points' ? '10000' :
                    formData.requirement_type === 'checkins' ? '25' :
                    formData.requirement_type === 'categories' ? '5' : '1'
                  }
                  value={formData.requirement_value}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Row 5: Points Reward, Rarity, Color */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Points Reward *</label>
              <input 
                type="number" 
                name="points_reward"
                placeholder="100"
                value={formData.points_reward}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Rarity *</label>
              <select
                name="rarity"
                value={formData.rarity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              >
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
              </select>
            </div>

            <div className="relative col-span-2 sm:col-span-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-10 h-10 rounded-lg border-2 border-slate-200 cursor-pointer flex-shrink-0"
                />
                <input 
                  type="text" 
                  value={formData.color}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="flex-1 px-3 py-2 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                  placeholder="#10B981"
                />
              </div>
            </div>
          </div>

          {/* Only show Active Badge toggle in edit mode */}
          {mode === 'edit' && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                name="is_active"
                id="is_active"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="w-4 h-4 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
              />
              <label htmlFor="is_active" className="text-xs sm:text-sm font-medium text-slate-700">
                Active Badge
              </label>
            </div>
          )}
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
            Are you sure you want to delete the badge <span className="font-bold text-slate-900">"{data.name}"</span>?
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

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header - Full Width */}
        <motion.header 
          className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
              >
                <h1 className="text-3xl font-bold text-white mb-1">Badges & Achievements</h1>
                <p className="text-sm text-teal-50 mt-1">Create and manage user achievement badges</p>
              </motion.div>
              <motion.div
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1 }}
              >
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <AddButton
                  onClick={handleAddBadge}
                  icon={Plus}
                >
                  Add Badge
                </AddButton>
              </motion.div>
            </div>
          </div>
        </motion.header>

        {/* Content with Padding */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-start justify-between mb-6">
            <div className="flex-1 lg:max-w-2xl">
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                categories={categories.map(cat => ({ id: cat.id, value: cat.id, name: cat.name, icon: cat.icon, label: cat.name }))}
                placeholder="Search badges..."
                showFilter={true}
              />
            </div>
            <div className="flex-shrink-0">
              <ViewToggle 
                view={viewMode} 
                onViewChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem('badges_view_mode', mode);
                }} 
              />
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
        >
          <p className="text-sm text-slate-600">
            Found <span className="font-bold text-teal-600">{totalCount}</span> badge{totalCount !== 1 ? 's' : ''}
            {searchQuery && <span> matching "<span className="font-semibold text-slate-900">{searchQuery}</span>"</span>}
          </p>
        </motion.div>

        {/* Cards Grid / Table */}
        {initialLoading ? (
          viewMode === 'card' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <SkeletonLoader type="card" count={6} />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md border-2 border-teal-200 overflow-hidden">
              <table className="w-full">
                <tbody>
                  <SkeletonLoader type="table-row" count={6} />
                </tbody>
              </table>
            </div>
          )
        ) : paginatedBadges.length > 0 ? (
          <>
            {viewMode === 'card' ? (
              <motion.div
                key={`badges-page-${currentPage}`}
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pb-8"
              >
                {paginatedBadges.map((badge) => (
                  <motion.div key={badge.id} variants={slideInFromRight} className="relative z-0 group">
                    <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)] overflow-visible h-[280px] flex flex-col relative z-10 hover:z-20 hover:scale-[1.02]">{/* Header with Icon */}
                      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 relative overflow-visible">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-14 h-14 ${badge.color || 'bg-gradient-to-br from-teal-400 to-cyan-500'} rounded-xl shadow-md flex items-center justify-center text-3xl relative overflow-hidden flex-shrink-0`}>
                              {isImagePath(badge.icon) ? (
                                <img 
                                  src={getIconUrl(badge.icon)} 
                                  alt={badge.name}
                                  className="w-full h-full object-cover rounded-xl"
                                  loading="lazy"
                                />
                              ) : (
                                <span>{badge.icon}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-bold text-slate-900 truncate" title={badge.name}>{badge.name}</h3>
                              <span className="text-xs text-teal-600 font-medium">
                                {badge.rarity ? `${badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1)} Badge` : 'Badge'}
                              </span>
                            </div>
                          </div>
                          {/* Hover Actions */}
                          <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex-shrink-0 relative z-30">
                            <button
                              onClick={() => handleView(badge)}
                              className="p-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                              title="View"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(badge)}
                              className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(badge)}
                              className="p-2 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg hover:from-red-600 hover:to-pink-700 transition-all shadow-md hover:shadow-lg hover:scale-105"
                              title="Delete"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="p-5 flex-1 flex flex-col">
                        <p className="text-sm text-slate-600 mb-3 line-clamp-2 flex-1">{badge.description}</p>
                        <div className="grid grid-cols-2 gap-3">
                          {badge.category && (
                            <div className="flex items-center gap-2">
                              {isImagePath(badge.category.icon) ? (
                                <img 
                                  src={getIconUrl(badge.category.icon)} 
                                  alt={badge.category.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                />
                              ) : (
                                <span className="text-lg">{badge.category.icon}</span>
                              )}
                              <div>
                                <p className="text-xs text-slate-500">Category</p>
                                <p className="text-sm font-semibold text-slate-900">{badge.category.name}</p>
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="text-lg">⭐</span>
                            <div>
                              <p className="text-xs text-slate-500">Points Reward</p>
                              <p className="text-sm font-semibold text-teal-600">{badge.points_reward || 0}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200 overflow-hidden pb-8">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Badge</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Rarity</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Points</th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-teal-200">
                    {paginatedBadges.map((badge) => (
                      <tr key={badge.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 ${badge.color || 'bg-gradient-to-br from-teal-400 to-cyan-500'} rounded-lg shadow-sm flex items-center justify-center text-2xl flex-shrink-0`}>
                              {isImagePath(badge.icon) ? (
                                <img 
                                  src={getIconUrl(badge.icon)} 
                                  alt={badge.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <span>{badge.icon}</span>
                              )}
                            </div>
                            <span className="font-semibold text-slate-900">{badge.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-md">
                          {badge.description}
                        </td>
                        <td className="px-6 py-4">
                          {badge.category ? (
                            <div className="flex items-center gap-2">
                              {isImagePath(badge.category.icon) ? (
                                <img 
                                  src={getIconUrl(badge.category.icon)} 
                                  alt={badge.category.name}
                                  className="w-8 h-8 rounded-lg object-cover border border-slate-200"
                                />
                              ) : (
                                <span className="text-lg">{badge.category.icon}</span>
                              )}
                              <span className="text-sm text-slate-900">{badge.category.name}</span>
                            </div>
                          ) : (
                            <span className="text-sm text-slate-400">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            badge.rarity === 'legendary' ? 'bg-purple-100 text-purple-700' :
                            badge.rarity === 'epic' ? 'bg-pink-100 text-pink-700' :
                            badge.rarity === 'rare' ? 'bg-blue-100 text-blue-700' :
                            badge.rarity === 'uncommon' ? 'bg-green-100 text-green-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {badge.rarity ? badge.rarity.charAt(0).toUpperCase() + badge.rarity.slice(1) : 'Common'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-sm font-semibold text-teal-600">
                            {badge.points_reward || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleView(badge)}
                              className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all shadow-md"
                              title="View"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleEdit(badge)}
                              className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(badge)}
                              className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all shadow-md"
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
            )}

            {/* Pagination */}
            {totalCount > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        ) : (
          <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-teal-300 p-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-full flex items-center justify-center mb-4 shadow-md">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-xs font-medium text-slate-900 mb-2">No badges found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search criteria</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
              </Button>
            </div>
          </div>
        )}
        </main>
      </div>

      <Modal 
        key={modalState.data?.id || modalState.mode}
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
          modalState.mode === 'view' ? 'View Badge' : 
          modalState.mode === 'edit' ? 'Edit Badge' : 
          modalState.mode === 'delete' ? 'Confirm Delete' : 
          'Add New Badge'
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
        size="lg"
        scrollable={modalState.mode === 'view'}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
});

Badges.displayName = 'Badges';

export default Badges;
