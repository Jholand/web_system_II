import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { staggerContainer, fadeInUp } from '../../utils/animations';
import { Store, Gift, LayoutDashboard, LogOut, Plus, Edit, Trash2, Eye, ChevronLeft, Award, Tag, Package, MapPin, QrCode, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import ViewToggle from '../../components/common/ViewToggle';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import AddButton from '../../components/common/AddButton';
import AnimatedCard from '../../components/common/AnimatedCard';
import SkeletonLoader from '../../components/common/SkeletonLoader';
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
const STORAGE_URL = `${getApiUrl().replace('/api', '')}/storage`;
axios.defaults.withCredentials = true;

const OwnerRewards = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rewards, setRewards] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myDestinations, setMyDestinations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasMounted = useRef(false);
  const fetchIdRef = useRef(0);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [totalRewards, setTotalRewards] = useState(0);
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('owner_rewards_view_mode') || 'card';
  });
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);

  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '', // 'add', 'edit', 'delete', 'view'
    data: null,
  });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    points_required: 0,
    stock_quantity: 0,
    stock_unlimited: false,
    destination_ids: [],
    is_active: true,
  });

  const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
  const userInitial = currentUser.first_name ? currentUser.first_name.charAt(0).toUpperCase() : 'O';

  // Helper function to check if icon is an image file path
  const isImageIcon = (icon) => {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || 
           icon.endsWith('.png') || icon.endsWith('.jpg') || 
           icon.endsWith('.jpeg') || icon.endsWith('.gif') || 
           icon.endsWith('.webp') || icon.endsWith('.svg');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadInitial = async () => {
      const cached = localStorage.getItem('cached_owner_rewards');
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
            fetchRewards();
            fetchCategories();
            fetchMyDestinations();
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      await Promise.all([fetchRewards(), fetchCategories(), fetchMyDestinations()]);
      setInitialLoading(false);
      hasMounted.current = true;
    };

    loadInitial();
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  const fetchRewards = async () => {
    const currentFetchId = ++fetchIdRef.current;
    
    try {
      setIsFetching(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/rewards`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          _t: Date.now(), // Force fresh data
        }
      });

      // Only update if this is still the latest fetch
      if (currentFetchId !== fetchIdRef.current) return;

      const data = response.data.data || [];
      const meta = response.data.meta || {};
      setRewards([...data]); // Force new array reference for React re-render
      setTotalRewards(meta.total || data.length);

      // Cache first page results
      if (currentPage === 1 && !searchQuery && selectedCategory === 'all') {
        localStorage.setItem('cached_owner_rewards', JSON.stringify({
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

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchMyDestinations = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/owner/destinations`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyDestinations(response.data.data || []);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

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

  const openModal = (mode, rewardData = null) => {
    setModalState({ isOpen: true, mode, data: rewardData });
    if (rewardData && mode === 'edit') {
      setFormData({
        title: rewardData.title || '',
        description: rewardData.description || '',
        category_id: rewardData.category_id || '',
        points_required: rewardData.points_required || 0,
        stock_quantity: rewardData.stock?.quantity || rewardData.stock_quantity || 0,
        stock_unlimited: rewardData.stock?.unlimited || false,
        destination_ids: rewardData.destinations?.map(d => d.destination_id || d.id) || [],
        is_active: rewardData.is_active !== false,
      });
    } else if (mode === 'add') {
      setFormData({
        title: '',
        description: '',
        category_id: '',
        points_required: 0,
        stock_quantity: 0,
        stock_unlimited: false,
        destination_ids: [],
        is_active: true,
      });
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    setFormData({
      title: '',
      description: '',
      category_id: '',
      points_required: 0,
      stock_quantity: 0,
      stock_unlimited: false,
      destination_ids: [],
      is_active: true,
    });
  };

  const handleSave = async () => {
    try {
      // Validate required fields
      if (!formData.title || !formData.title.trim()) {
        toast.error('Reward title is required');
        return;
      }
      if (!formData.category_id) {
        toast.error('Please select a category');
        return;
      }
      if (!formData.description || !formData.description.trim()) {
        toast.error('Description is required');
        return;
      }
      if (!formData.points_required || formData.points_required <= 0) {
        toast.error('Points required must be greater than 0');
        return;
      }
      if (formData.destination_ids.length === 0) {
        toast.error('Please select at least one destination');
        return;
      }

      const token = localStorage.getItem('auth_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Prepare payload for backend
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
        points_required: parseInt(formData.points_required),
        stock_quantity: formData.stock_unlimited ? 0 : (parseInt(formData.stock_quantity) || 0),
        stock_unlimited: formData.stock_unlimited,
        is_active: modalState.mode === 'add' ? true : (formData.is_active === true || formData.is_active === 'true'),
        destination_ids: formData.destination_ids,
      };

      if (modalState.mode === 'add') {
        await axios.post(`${API_BASE_URL}/owner/rewards`, payload, { headers });
        closeModal();
        toast.success('Reward added successfully!');
        // Clear cache and refresh
        localStorage.removeItem('cached_owner_rewards');
        await fetchRewards();
      } else if (modalState.mode === 'edit') {
        await axios.put(`${API_BASE_URL}/owner/rewards/${modalState.data.id}`, payload, { headers });
        closeModal();
        toast.success('Reward updated successfully!');
        // Clear cache and refresh
        localStorage.removeItem('cached_owner_rewards');
        await fetchRewards();
      }
    } catch (error) {
      console.error('Error saving reward:', error);
      const errorMsg = error.response?.data?.message || 'Failed to save reward';
      toast.error(errorMsg);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/owner/rewards/${modalState.data.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      closeModal();
      toast.success('Reward deleted successfully!');
      // Clear cache and refresh
      localStorage.removeItem('cached_owner_rewards');
      await fetchRewards();
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    }
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const totalPages = Math.ceil(totalRewards / itemsPerPage);

  const getModalContent = () => {
    if (modalState.mode === 'delete') {
      return (
        <div className="text-center py-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to delete "{modalState.data?.title}"?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        </div>
      );
    }

    if (modalState.mode === 'view') {
      const reward = modalState.data;
      return (
        <div className="relative max-h-[80vh] overflow-y-auto flex flex-col gap-4 p-4">
          {/* Image and Title */}
          <div className="flex flex-col items-center gap-2">
            <img
              src={reward.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}
              alt={reward.title}
              className="w-full max-w-xs h-40 object-cover rounded-xl border border-slate-200 bg-slate-100"
              onError={e => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
            />
            <h2 className="text-lg font-bold text-slate-900 text-center mt-2">{reward.title}</h2>
            <div className="flex flex-wrap gap-2 justify-center mt-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-teal-700">
                {reward.category?.icon && <span>{reward.category.icon}</span>}
                <span>{reward.category?.name || 'Reward'}</span>
              </span>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{reward.is_active ? 'Active' : 'Inactive'}</span>
              {reward.is_featured && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">⭐ Featured</span>
              )}
            </div>
          </div>

          {/* Points & Stock */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white rounded-lg border p-2 text-center">
              <div className="text-xs text-slate-500">Points Required</div>
              <div className="text-base font-bold text-teal-600">{reward.points_required} pts</div>
            </div>
            <div className="bg-white rounded-lg border p-2 text-center">
              <div className="text-xs text-slate-500">Stock</div>
              <div className="text-base font-bold text-purple-600">{reward.stock?.unlimited ? '∞ Unlimited' : reward.stock?.quantity || 0}</div>
            </div>
          </div>

          {/* Description & Terms */}
          <div className="bg-white rounded-lg border p-2">
            <div className="text-xs text-slate-500 mb-1">Description</div>
            <div className="text-sm text-slate-900">{reward.description || 'No description provided'}</div>
            {reward.terms_conditions && (
              <div className="mt-2 text-xs text-slate-500">Terms & Conditions</div>
            )}
            {reward.terms_conditions && (
              <div className="text-sm text-slate-700">{reward.terms_conditions}</div>
            )}
          </div>

          {/* Destinations */}
          {reward.destinations && reward.destinations.length > 0 && (
            <div className="bg-white rounded-lg border p-2">
              <div className="text-xs text-slate-500 mb-1">Available at Destinations</div>
              <div className="flex flex-wrap gap-2">
                {reward.destinations.map(dest => (
                  <span key={dest.id} className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs">{dest.name}</span>
                ))}
              </div>
            </div>
          )}

          {/* Sticky Close Button */}
          <div className="sticky bottom-0 left-0 w-full bg-gradient-to-t from-white via-white/80 to-transparent pt-3 pb-2 flex justify-center">
            <button
              onClick={closeModal}
              className="px-6 py-2 bg-slate-800 text-white rounded-lg shadow hover:bg-slate-900 transition-all text-sm font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    // Add/Edit Form - Minimalist, modern, admin-inspired
    return (
      <div className="space-y-3 pb-16">
        {/* Row 1: Title & Category */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Reward Title *</label>
            <input
              type="text"
              name="title"
              placeholder="Enter reward title"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Category *</label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={e => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            >
              <option value="">Select category</option>
              {categories.map(cat => {
                const catId = cat.category_id || cat.id;
                const catName = cat.category_name || cat.name;
                return (
                  <option key={catId} value={catId}>{catName}</option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Row 2: Description */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
          <textarea
            name="description"
            placeholder="Describe the reward..."
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
          />
        </div>

        {/* Row 3: Points & Stock - Inline with Unlimited checkbox */}
        <div className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Points Required *</label>
            <input
              type="number"
              name="points_required"
              placeholder="0"
              value={formData.points_required}
              onChange={e => setFormData({ ...formData, points_required: parseInt(e.target.value) || 0 })}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Stock Quantity</label>
            <input
              type="number"
              name="stock_quantity"
              placeholder="0"
              value={formData.stock_quantity}
              onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
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
                onChange={e => setFormData({ ...formData, stock_unlimited: e.target.checked })}
                className="w-3.5 h-3.5 text-teal-600 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-xs font-medium text-slate-700 whitespace-nowrap">Unlimited</span>
            </label>
          </div>
        </div>

        {/* Row 4: Status - Only show when editing */}
        {modalState.mode === 'edit' && (
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
            <select
              name="is_active"
              value={formData.is_active ? 'true' : 'false'}
              onChange={e => setFormData({ ...formData, is_active: e.target.value === 'true' })}
              className="w-full px-2.5 py-1.5 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-lg focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        )}

        {/* Row 5: Destination Selector */}
        <div className="relative border-t border-slate-200 pt-3 mt-2">
          <label className="block text-xs font-semibold text-slate-800 mb-1">📍 Available at Destinations *</label>
          <p className="text-xs text-slate-500 mb-2">Select which destinations can accept this reward.</p>
          <div className="relative rounded-lg border-2 border-slate-200 bg-gradient-to-br from-slate-50 to-white overflow-hidden">
            <div className="max-h-[160px] overflow-y-auto p-2 grid grid-cols-3 gap-2" style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}>
              {myDestinations.length === 0 ? (
                <div className="text-center py-8 col-span-3">
                  <p className="text-xs text-slate-500">You have no destinations. Create one first.</p>
                </div>
              ) : (
                myDestinations.map(dest => {
                  const destId = dest.destination_id || dest.id;
                  return (
                    <label key={`dest-${destId}`} className="group flex flex-col gap-1.5 p-2 bg-white rounded-md border border-slate-200 hover:border-teal-400 hover:bg-teal-50/30 cursor-pointer transition-all duration-200">
                      <div className="flex items-start gap-1.5">
                        <input
                          type="checkbox"
                          checked={formData.destination_ids.includes(destId)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                destination_ids: [...formData.destination_ids, destId]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                destination_ids: formData.destination_ids.filter(id => id !== destId)
                              });
                            }
                          }}
                          className="w-3.5 h-3.5 mt-0.5 text-teal-600 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 cursor-pointer flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 truncate group-hover:text-teal-700">{dest.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{dest.address?.city || dest.city || ''}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-medium bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded text-center truncate">
                        {dest.category?.icon ? (isImageIcon(dest.category.icon) ? <img src={`http://localhost:8000/storage/${dest.category.icon}`} alt={dest.category.name} className="inline w-4 h-4 mr-1" /> : dest.category.icon) : null} {dest.category?.name || 'General'}
                      </span>
                    </label>
                  );
                })
              )}
            </div>
          </div>
          {formData.destination_ids.length > 0 && (
            <p className="text-xs text-teal-700 mt-2 font-medium">✓ {formData.destination_ids.length} destination{formData.destination_ids.length > 1 ? 's' : ''} selected</p>
          )}
        </div>

        {/* Action Buttons - Right aligned */}
        <div className="flex gap-3 pt-4 justify-end">
          <button
            onClick={closeModal}
            className="min-w-[120px] px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="min-w-[120px] px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
          >
            {modalState.mode === 'add' ? 'Add Reward' : 'Update Reward'}
          </button>
        </div>
      </div>
    );
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
                    onClick={handleLogout}
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
                onClick={handleLogout}
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20">
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
        {/* Header - Full Width */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">My Rewards</h1>
                <p className="text-sm text-teal-50 mt-1">Manage your reward offerings • Total: {totalRewards} rewards</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <AddButton onClick={() => openModal('add')} icon={Plus}>
                  Add Reward
                </AddButton>
              </div>
            </div>
          </div>
        </header>

        {/* Content with Padding */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
        {/* Search & Filter */}
        <div className="mb-6 bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-xl p-4 border-2 border-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="flex-1 max-w-md">
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                placeholder="Search rewards..."
              />
            </div>
            <div className="w-full sm:w-auto sm:min-w-[200px] sm:max-w-[220px]" ref={categoryDropdownRef}>
              <div 
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full h-[42px] px-4 bg-white border-2 border-gray-200 rounded-lg font-medium text-gray-700 hover:border-teal-400 focus:border-teal-500 transition-all cursor-pointer flex items-center justify-between"
              >
                {selectedCategory === 'all' ? (
                  <span>All Categories</span>
                ) : (() => {
                    const selectedCat = categories.find(c => c.id === parseInt(selectedCategory));
                    if (!selectedCat) return <span>All Categories</span>;
                    return (
                      <div className="flex items-center gap-2">
                        {isImageIcon(selectedCat.icon) ? (
                          <img 
                            src={selectedCat.icon.startsWith('http') ? selectedCat.icon : `http://localhost:8000/storage/${selectedCat.icon}`}
                            alt={selectedCat.name}
                            className="w-5 h-5 object-cover rounded"
                          />
                        ) : (
                          <span className="text-base">{selectedCat.icon}</span>
                        )}
                        <span className="truncate">{selectedCat.name}</span>
                      </div>
                    );
                  })()
                }
                <svg className={`w-5 h-5 text-gray-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {categoryDropdownOpen && (
                <div className="absolute z-50 mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto" style={{width: '220px'}}>
                  <div
                    onClick={() => {
                      handleCategoryChange('all');
                      setCategoryDropdownOpen(false);
                    }}
                    className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer transition-colors"
                  >
                    <span className="text-sm font-medium text-gray-900">All Categories</span>
                  </div>
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        handleCategoryChange(cat.id);
                        setCategoryDropdownOpen(false);
                      }}
                      className="px-4 py-2.5 hover:bg-teal-50 cursor-pointer flex items-center gap-2 transition-colors"
                    >
                      {isImageIcon(cat.icon) ? (
                        <img 
                          src={cat.icon.startsWith('http') ? cat.icon : `http://localhost:8000/storage/${cat.icon}`}
                          alt={cat.name}
                          className="w-6 h-6 object-cover rounded"
                        />
                      ) : (
                        <span className="text-lg">{cat.icon}</span>
                      )}
                      <span className="text-sm text-gray-900">{cat.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="hidden sm:block sm:ml-auto">
              <ViewToggle 
                view={viewMode} 
                onViewChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem('owner_rewards_view_mode', mode);
                }} 
              />
            </div>
          </div>
        </div>

        {/* Rewards List */}
        {initialLoading ? (
          <div className="mb-6">
            {viewMode === 'card' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <SkeletonLoader type="card" count={6} />
              </div>
            ) : (
              <SkeletonLoader type="table-row" count={5} />
            )}
          </div>
        ) : rewards.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No rewards found</p>
              <button
                onClick={() => openModal('add')}
                className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700"
              >
                Add Your First Reward
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === 'card' ? (
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6"
              >
                {rewards.map((reward) => (
                  <AnimatedCard key={reward.id}>
                    <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl p-6 hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)] h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 pr-3">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate">{reward.title}</h3>
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg shadow-md flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {isImageIcon(reward.category?.icon) ? (
                                <img 
                                  src={reward.category.icon.startsWith('http') ? reward.category.icon : `http://localhost:8000/storage/${reward.category.icon}`}
                                  alt={reward.category?.name} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span class="text-base">📁</span>';
                                  }}
                                />
                              ) : (
                                <span className="text-base">{reward.category?.icon || '📁'}</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700">{reward.category?.name}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                          reward.is_active ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {reward.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {reward.description || 'No description'}
                      </p>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="text-gray-600 font-medium">Points Required:</span>
                          <span className="font-bold text-teal-600">{reward.points_required} pts</span>
                        </div>
                        <div className="flex items-center justify-between text-sm bg-slate-50 px-3 py-2 rounded-lg">
                          <span className="text-gray-600 font-medium">Stock:</span>
                          <span className="font-semibold text-gray-900">{reward.stock_quantity}</span>
                        </div>
                      </div>

                      {reward.destinations && reward.destinations.length > 0 && (
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <p className="text-xs font-semibold text-gray-500 mb-2">Available at:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {reward.destinations.slice(0, 2).map((dest, idx) => (
                              <span key={`${reward.id}-dest-${dest.id || idx}`} className="px-2 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-xs font-medium">
                                {dest.name}
                              </span>
                            ))}
                            {reward.destinations.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                                +{reward.destinations.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Created By Info */}
                      {reward.created_by_name && (
                        <div className="mb-4 pb-4 border-b border-gray-100">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-500">Created by:</span>
                            <span className={`font-semibold ${reward.can_edit ? 'text-teal-600' : 'text-gray-700'}`}>
                              {reward.can_edit ? 'You' : reward.created_by_name}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => openModal('view', reward)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all text-sm font-medium shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        {reward.can_edit && (
                          <button
                            onClick={() => openModal('edit', reward)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-all text-sm font-medium shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </button>
                        )}
                        {reward.can_delete && (
                          <button
                            onClick={() => openModal('delete', reward)}
                            className="p-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </AnimatedCard>
                ))}
              </motion.div>
            ) : (
              <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-xl shadow-[0_8px_20px_rgba(0,0,0,0.1)] border-2 border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-100 to-slate-200 border-b-2 border-slate-300">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Reward</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Points</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created By</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {rewards.map((reward) => (
                        <motion.tr
                          key={reward.id}
                          variants={fadeInUp}
                          className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150"
                        >
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-900">{reward.title}</div>
                              <div className="text-sm text-gray-500">{reward.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg shadow-md flex items-center justify-center text-lg flex-shrink-0 overflow-hidden">
                                {isImageIcon(reward.category?.icon) ? (
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
                              <span className="text-sm font-medium text-gray-700">{reward.category?.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="font-bold text-teal-600">{reward.points_required} pts</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-gray-900">{reward.stock_quantity}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-sm font-medium ${reward.can_edit ? 'text-teal-600' : 'text-gray-700'}`}>
                              {reward.can_edit ? 'You' : reward.created_by_name || 'Unknown'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              reward.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {reward.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => openModal('view', reward)}
                                className="p-2 bg-gradient-to-br from-teal-400 to-cyan-500 text-white rounded-lg hover:from-teal-500 hover:to-cyan-600 transition-all shadow-md"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {reward.can_edit && (
                                <button
                                  onClick={() => openModal('edit', reward)}
                                  className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              )}
                              {reward.can_delete && (
                                <button
                                  onClick={() => openModal('delete', reward)}
                                  className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all shadow-md"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(items) => {
                    setItemsPerPage(items);
                    setCurrentPage(1);
                  }}
                  totalItems={totalRewards}
                />
              </div>
            )}
          </>
        )}
        </main>
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={
          modalState.mode === 'add' ? 'Add New Reward' :
          modalState.mode === 'edit' ? 'Edit Reward' :
          modalState.mode === 'delete' ? 'Delete Reward' :
          'Reward Details'
        }
        size="2xl"
      >
        <div className="p-6">
          {getModalContent()}
        </div>
      </Modal>
    </div>
  );
};

export default OwnerRewards;
