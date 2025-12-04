import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import AdminHeader from '../../components/common/AdminHeader';
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { getCurrentAdmin } from '../../utils/adminHelper';
import ToastNotification from '../../components/common/ToastNotification';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import { CategorySkeletonGrid } from '../../components/common/CategorySkeleton';
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

const Categories = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });

  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 categories per page
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: null,
  });
  const [iconPreview, setIconPreview] = useState(null);

  // Categories data from API
  const [categories, setCategories] = useState([]);
  const [totalCategories, setTotalCategories] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
        },
      });

      const data = response.data.data || [];
      const meta = response.data.meta || {};

      setCategories(data.map(cat => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        destinationCount: cat.destinations_count || 0,
        isActive: cat.is_active,
      })));

      setTotalCategories(meta.total || data.length);
      
      // Save to cache with timestamp
      localStorage.setItem('cached_categories', JSON.stringify({
        categories: data.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          destinationCount: cat.destinations_count || 0,
          isActive: cat.is_active,
        })),
        total: meta.total || data.length,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [currentPage, itemsPerPage, searchQuery]);

  useEffect(() => {
    const loadInitialData = () => {
      // Load from cache instantly
      const cached = localStorage.getItem('cached_categories');
      
      if (cached) {
        try {
          const data = JSON.parse(cached);
          const cacheAge = Date.now() - (data.timestamp || 0);
          if (data.categories) {
            setCategories(data.categories);
            setTotalCategories(data.total || 0);
          }
          
          // Only fetch if cache is older than 1 minute
          if (cacheAge > 60000) {
            setIsFetching(true);
            fetchCategories()
              .catch(err => console.error(err))
              .finally(() => setIsFetching(false));
          }
        } catch (e) {
          setIsFetching(true);
          fetchCategories()
            .catch(err => console.error(err))
            .finally(() => setIsFetching(false));
        }
      } else {
        setIsFetching(true);
        fetchCategories()
          .catch(err => console.error(err))
          .finally(() => setIsFetching(false));
      }
    };
    
    loadInitialData();
  }, [fetchCategories]);

  // Refetch when pagination changes
  useEffect(() => {
    setIsFetching(true);
    fetchCategories()
      .catch(err => console.error(err))
      .finally(() => setIsFetching(false));
  }, [currentPage, itemsPerPage, searchQuery]);

  const handleLogout = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const openModal = (mode, categoryData = null) => {
    setModalState({ isOpen: true, mode, data: categoryData });
    if (categoryData) {
      setFormData({
        name: categoryData.name,
        description: categoryData.description,
        icon: null,
      });
      setIconPreview(categoryData.icon);
    } else {
      setFormData({
        name: '',
        description: '',
        icon: null,
      });
      setIconPreview(null);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    setFormData({
      name: '',
      description: '',
      icon: null,
    });
    setIconPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Icon must be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, icon: file }));
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name) {
        toast.error('Category name is required');
        return;
      }

      setSaving(true);

      const formDataToSend = new FormData();
      formDataToSend.append('category_name', formData.name);
      formDataToSend.append('description', formData.description || '');
      
      // Handle icon - always send icon field
      if (formData.icon instanceof File) {
        // New file uploaded
        formDataToSend.append('icon', formData.icon);
      } else if (iconPreview) {
        // Existing icon (emoji or URL) - send as text
        const iconText = iconPreview.startsWith('http') ? '' : iconPreview;
        if (iconText) {
          formDataToSend.append('icon', iconText);
        }
      }
      
      formDataToSend.append('is_active', '1');

      if (modalState.mode === 'edit') {
        formDataToSend.append('_method', 'PUT');
        closeModal();
        toast.success('Updating category...');

        const token = localStorage.getItem('auth_token');
        await axios.post(`${API_BASE_URL}/categories/${modalState.data.id}`, formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        // Force immediate refetch to show the updated category
        const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
          params: {
            page: currentPage,
            per_page: itemsPerPage,
            search: searchQuery || undefined,
            _t: Date.now(),
          },
        });

        const data = categoriesResponse.data.data || [];
        const meta = categoriesResponse.data.meta || {};

        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          destinationCount: cat.destinations_count || 0,
          isActive: cat.is_active,
        })));

        setTotalCategories(meta.total || data.length);
        toast.success('Category updated successfully!');
      } else {
        // Close modal immediately for better UX
        closeModal();
        toast.success('Adding category...');

        const token = localStorage.getItem('auth_token');
        const response = await axios.post(`${API_BASE_URL}/categories`, formDataToSend, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        
        // Reset to page 1 to see the new category (categories are sorted alphabetically)
        if (currentPage !== 1) {
          setCurrentPage(1);
        }
        
        // Force immediate refetch to show the new category in its alphabetically sorted position
        const categoriesResponse = await axios.get(`${API_BASE_URL}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            page: 1,
            per_page: itemsPerPage,
            search: searchQuery || undefined,
            _t: Date.now(),
          },
        });

        const data = categoriesResponse.data.data || [];
        const meta = categoriesResponse.data.meta || {};

        setCategories(data.map(cat => ({
          id: cat.id,
          name: cat.name,
          icon: cat.icon,
          description: cat.description,
          destinationCount: cat.destinations_count || 0,
          isActive: cat.is_active,
        })));

        setTotalCategories(meta.total || data.length);
        toast.success('Category added successfully!');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.response?.data?.errors || 'Failed to save category';
      toast.error(typeof errorMessage === 'object' ? JSON.stringify(errorMessage) : errorMessage);
      fetchCategories(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"?`)) {
      try {
        // Optimistic delete
        const previousCategories = [...categories];
        setCategories(prev => prev.filter(cat => cat.id !== category.id));
        setTotalCategories(prev => prev - 1);
        toast.success('Deleting category...');

        const token = localStorage.getItem('auth_token');
        await axios.delete(`${API_BASE_URL}/categories/${category.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchCategories(false);
      } catch (error) {
        console.error('Error deleting category:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete category';
        toast.error(errorMessage);
        fetchCategories(false);
      }
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(totalCategories / itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const renderModalContent = () => {
    return (
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter category name"
            className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            placeholder="Brief description"
            className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Category Icon
          </label>
          
          {/* Icon Preview */}
          <div className="flex items-center gap-4 mb-3">
            {iconPreview ? (
              <div className="relative group">
                <img 
                  src={iconPreview} 
                  alt="Icon preview" 
                  className="w-20 h-20 rounded-lg object-cover border-2 border-teal-200"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIconPreview(null);
                    setFormData(prev => ({ ...prev, icon: null }));
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ) : formData.icon && typeof formData.icon === 'string' ? (
              <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-lg flex items-center justify-center text-4xl border-2 border-teal-200">
                {formData.icon}
              </div>
            ) : (
              <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                <Upload className="w-8 h-8 text-slate-400" />
              </div>
            )}
          </div>

          {/* File Input */}
          <div className="relative">
            <input
              type="file"
              id="icon-upload"
              accept="image/*"
              onChange={handleIconChange}
              className="hidden"
            />
            <label
              htmlFor="icon-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white rounded-lg hover:from-teal-600 hover:to-cyan-700 transition-all cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Choose Image
            </label>
            <span className="ml-3 text-sm text-slate-600">
              {formData.icon instanceof File ? formData.icon.name : 'No file chosen'}
            </span>
          </div>
          
          <p className="text-xs text-slate-500 mt-2">
            Upload an image (max 2MB) or use emoji. Recommended: 200x200px
          </p>
        </div>
      </div>
    );
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

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12
        `}
      >
        {categories.length === 0 ? (
          <CategorySkeletonGrid count={9} />
        ) : (
          <>
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">Destination Categories</h2>
                <p className="text-sm text-slate-600">Manage destination types and classifications</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={() => openModal('add')}
              icon={<Plus className="w-5 h-5" />}
            >
              Add Category
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Search categories..."
        />

        {/* Results count */}
        <div className="mb-4">
          <p className="text-sm text-slate-600">
            Found <span className="font-medium text-slate-900">{totalCategories}</span> categories
            {searchQuery && <span> matching "<span className="font-medium text-slate-900">{searchQuery}</span>"</span>}
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
              {categories.map((category) => (
                <div key={category.id}>
                  <div className="group bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-teal-300 transition-all duration-300 overflow-hidden h-[200px] flex flex-col">
                    {/* Header with Icon */}
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 relative">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-14 h-14 bg-white rounded-xl shadow-md flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                            {category.icon?.startsWith('http') ? (
                              <img src={category.icon} alt={category.name} loading="lazy" className="w-full h-full object-cover" />
                            ) : (
                              <span>{category.icon}</span>
                            )}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                            <span className="text-xs text-teal-600 font-medium">{category.destinationCount} destinations</span>
                          </div>
                        </div>
                        {/* Hover Actions */}
                        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openModal('edit', category)}
                            className="p-2 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(category)}
                            className="p-2 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg transition-all shadow-md hover:shadow-lg hover:scale-105"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex-1 overflow-hidden">
                      <p className="text-sm text-slate-600 line-clamp-3">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalCategories > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCategories}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-slate-900 mb-2">No categories found</h3>
              <p className="text-sm text-slate-600 mb-6">
                {searchQuery ? `No categories match "${searchQuery}"` : 'Get started by adding your first category'}
              </p>
              {!searchQuery && (
                <Button
                  variant="primary"
                  onClick={() => openModal('add')}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Add Category
                </Button>
              )}
            </div>
          </div>
        )}
        </>
        )}
      </main>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === 'edit' ? 'Edit Category' : 'Add New Category'}
        titleIcon="🏷️"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {modalState.mode === 'edit' ? 'Save Changes' : 'Add Category'}
            </Button>
          </>
        }
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
});

Categories.displayName = 'Categories';

export default Categories;
