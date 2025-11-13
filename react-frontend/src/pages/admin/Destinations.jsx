import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import AdminHeader from '../../components/common/AdminHeader';
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import DestinationCard from '../../components/dashboard/DestinationCard';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';

const Destinations = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });
  
  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleLogout = () => {
    navigate('/login');
  };

  const destinations = [
    {
      id: 1,
      title: 'Grand Hotel Resort',
      category: 'hotel',
      categoryColor: 'bg-blue-100 text-blue-700',
      categoryIcon: '🏨',
      description: 'Luxury resort with excellent facilities',
      points: 50,
      location: 'Downtown',
      rating: 4.8,
    },
    {
      id: 2,
      title: 'Organic Farm Experience',
      category: 'agri farm',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '🌾',
      description: 'Farm tours and organic produce',
      points: 30,
      location: 'Countryside',
      rating: 4.5,
    },
    {
      id: 3,
      title: 'Mountain Peak Viewpoint',
      category: 'tourist spot',
      categoryColor: 'bg-purple-100 text-purple-700',
      categoryIcon: '🏔️',
      description: 'Scenic mountain views and hiking trails',
      points: 100,
      location: 'Highland Region',
      rating: 4.9,
    },
    {
      id: 4,
      title: 'Beach Paradise Resort',
      category: 'hotel',
      categoryColor: 'bg-blue-100 text-blue-700',
      categoryIcon: '🏨',
      description: 'Beachfront luxury with stunning views',
      points: 75,
      location: 'Coastal Area',
      rating: 4.7,
    },
    {
      id: 5,
      title: 'Heritage Rice Farm',
      category: 'agri farm',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '🌾',
      description: 'Traditional rice farming experience',
      points: 40,
      location: 'Rural Valley',
      rating: 4.6,
    },
    {
      id: 6,
      title: 'Waterfall Adventure',
      category: 'tourist spot',
      categoryColor: 'bg-purple-100 text-purple-700',
      categoryIcon: '🏔️',
      description: 'Spectacular waterfall and nature trail',
      points: 85,
      location: 'Forest Reserve',
      rating: 4.8,
    },
    {
      id: 7,
      title: 'City Center Inn',
      category: 'hotel',
      categoryColor: 'bg-blue-100 text-blue-700',
      categoryIcon: '🏨',
      description: 'Modern budget hotel in the heart of the city',
      points: 35,
      location: 'City Center',
      rating: 4.3,
    },
    {
      id: 8,
      title: 'Sunset Vineyard',
      category: 'agri farm',
      categoryColor: 'bg-green-100 text-green-700',
      categoryIcon: '🌾',
      description: 'Wine tasting and vineyard tours',
      points: 60,
      location: 'Wine Country',
      rating: 4.7,
    },
    {
      id: 9,
      title: 'Ancient Temple Ruins',
      category: 'tourist spot',
      categoryColor: 'bg-purple-100 text-purple-700',
      categoryIcon: '🏔️',
      description: 'Historical temple with cultural significance',
      points: 90,
      location: 'Heritage Site',
      rating: 4.9,
    },
  ];

  const categories = [
    { value: 'hotel', label: '🏨 Hotels' },
    { value: 'agri farm', label: '🌾 Agri Farms' },
    { value: 'tourist spot', label: '🏔️ Tourist Spots' },
  ];

  // Filter and search logic
  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch = destination.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || destination.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDestinations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDestinations = filteredDestinations.slice(startIndex, startIndex + itemsPerPage);

  // Reset to page 1 when filters change
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

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ isOpen: false, mode: '', data: null });

  const handleView = (destination) => navigate(`/admin/destinations/${destination.id}`);
  const handleEdit = (destination) => navigate(`/admin/destinations/${destination.id}/edit`);
  const handleDelete = (destination) => openModal('delete', destination);
  const handleAddDestination = () => navigate('/admin/destinations/new');

  const confirmDelete = () => {
    toast.success('Destination deleted successfully!');
    closeModal();
  };

  const handleSave = () => {
    if (modalState.mode === 'add') toast.success('Destination added successfully!');
    else if (modalState.mode === 'edit') toast.success('Destination updated successfully!');
    closeModal();
  };

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Title
            </label>
            <p className="text-lg font-semibold text-slate-900">{data.title}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Category
            </label>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${data.categoryColor}`}>
              <span>{data.categoryIcon}</span>
              <span>{data.category}</span>
            </span>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
              Description
            </label>
            <p className="text-slate-900">{data.description}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <label className="flex items-center gap-2 text-xs font-bold text-orange-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Points
              </label>
              <p className="text-2xl font-bold text-orange-600">{data.points}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-4 border border-teal-200">
              <label className="flex items-center gap-2 text-xs font-bold text-teal-700 mb-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Location
              </label>
              <p className="text-sm font-bold text-teal-900">{data.location}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
              <label className="flex items-center gap-2 text-xs font-bold text-yellow-700 mb-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Rating
              </label>
              <p className="text-2xl font-bold text-yellow-600">{data.rating}</p>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'delete' && data) {
      return (
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-6 animate-pulse">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Delete Destination?</h3>
          <p className="text-slate-600 mb-2 text-lg">You're about to delete</p>
          <p className="text-xl font-bold text-red-600 mb-4">"{data.title}"</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-red-800">⚠️ This action cannot be undone. All data associated with this destination will be permanently removed.</p>
          </div>
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-5">
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Title *</label>
            <div className="relative group">
              <input 
                type="text" 
                defaultValue={data?.title || ''} 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300" 
                placeholder="Enter destination title" 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Category *</label>
            <div className="relative group">
              <select 
                defaultValue={data?.category || 'hotel'} 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300" 
              >
                <option value="hotel">🏨 Hotel</option>
                <option value="agri farm">🌾 Agri Farm</option>
                <option value="tourist spot">⛰️ Tourist Spot</option>
              </select>
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Description</label>
            <div className="relative group">
              <textarea 
                defaultValue={data?.description || ''} 
                rows={3} 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300 resize-none" 
                placeholder="Brief description" 
              />
              <div className="absolute left-3 top-3 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Address</label>
            <div className="relative group">
              <input 
                type="text" 
                defaultValue={data?.address || ''} 
                className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300" 
                placeholder="e.g., 123 Main Street, Manila, Philippines" 
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Latitude *</label>
              <div className="relative group">
                <input 
                  type="text" 
                  defaultValue={data?.latitude || ''} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300 font-mono" 
                  placeholder="14.599512" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Longitude *</label>
              <div className="relative group">
                <input 
                  type="text" 
                  defaultValue={data?.longitude || ''} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300 font-mono" 
                  placeholder="120.984219" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Points</label>
              <div className="relative group">
                <input 
                  type="number" 
                  defaultValue={data?.points || 50} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 transition-all duration-200 hover:border-slate-300" 
                  placeholder="50" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Location</label>
              <div className="relative group">
                <input 
                  type="text" 
                  defaultValue={data?.location || ''} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300" 
                  placeholder="City" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Rating</label>
              <div className="relative group">
                <input 
                  type="number" 
                  step="0.1" 
                  max="5" 
                  defaultValue={data?.rating || ''} 
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-50 transition-all duration-200 hover:border-slate-300" 
                  placeholder="4.5" 
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-yellow-500 transition-colors duration-200">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification />
      <AdminHeader 
        admin={{ name: 'em', role: 'Administrator' }}
        onLogout={handleLogout}
      />
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />
      {/* Main Content */}
      <main 
        className={`
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          sm:ml-20 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8
        `}
      >
        {/* Page Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between mb-6">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Destinations</h2>
                <p className="text-sm text-slate-600 mt-1">Manage tourist spots, hotels, and agricultural farms</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                variant="primary" 
                onClick={handleAddDestination}
                icon={<Plus className="w-5 h-5" />}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Destination
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <SearchFilter
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            categories={categories}
            placeholder="Search destinations..."
          />
        </motion.div>

        {/* Results Count */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-sm text-slate-600">
            Found <span className="font-bold text-purple-600">{filteredDestinations.length}</span> destination{filteredDestinations.length !== 1 ? 's' : ''}
            {searchQuery && <span> matching "<span className="font-semibold text-slate-900">{searchQuery}</span>"</span>}
            {selectedCategory !== 'all' && <span> in <span className="font-semibold text-slate-900">{categories.find(c => c.value === selectedCategory)?.label}</span></span>}
          </p>
        </motion.div>

        {/* Cards Grid */}
        {paginatedDestinations.length > 0 ? (
          <>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6"
            >
              {paginatedDestinations.map((destination) => (
                <motion.div key={destination.id} variants={slideInFromRight}>
                  <DestinationCard title={destination.title} category={destination.category} categoryColor={destination.categoryColor} categoryIcon={destination.categoryIcon} description={destination.description} points={destination.points} location={destination.location} rating={destination.rating} onView={() => handleView(destination)} onEdit={() => handleEdit(destination)} onDelete={() => handleDelete(destination)} />
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {filteredDestinations.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredDestinations.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No destinations found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search or filter criteria</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
      </main>
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModal}
        titleIcon={
          modalState.mode === 'view' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : modalState.mode === 'edit' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ) : modalState.mode === 'delete' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
        title={
          modalState.mode === 'view' ? 'View Destination' : 
          modalState.mode === 'edit' ? 'Edit Destination' : 
          modalState.mode === 'delete' ? 'Confirm Delete' : 
          'Add New Destination'
        } 
        footer={
          modalState.mode === 'view' ? (
            <Button 
              variant="outline" 
              onClick={closeModal}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            >
              View
            </Button>
          ) : modalState.mode === 'delete' ? (
            <>
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button 
                variant="danger" 
                onClick={confirmDelete}
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
              >
                Delete
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={closeModal}>Cancel</Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                icon={
                  modalState.mode === 'add' ? 
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> :
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                }
              >
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
};

export default Destinations;
