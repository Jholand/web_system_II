import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Upload, Clock, X } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import ViewToggle from '../../components/common/ViewToggle';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import ToastNotification from '../../components/common/ToastNotification';
import Pagination from '../../components/common/Pagination';
import SearchFilter from '../../components/common/SearchFilter';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import SkeletonLoader from '../../components/common/SkeletonLoader';
import AddButton from '../../components/common/AddButton';
import axios from 'axios';

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
axios.defaults.withCredentials = true;

const isImagePath = (icon) => {
  if (!icon) return false;
  return icon.includes('/') || icon.includes('\\') ||
    icon.endsWith('.jpg') || icon.endsWith('.jpeg') ||
    icon.endsWith('.png') || icon.endsWith('.gif') ||
    icon.endsWith('.webp');
};

const getIconUrl = (icon) => {
  if (!icon) return '';
  if (isImagePath(icon)) return `${STORAGE_URL}/${icon}`;
  return icon;
};

const Categories = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({ isOpen: false, mode: '', data: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, category: null });
  const [formData, setFormData] = useState({ name: '', description: '', icon: '📁', is_active: true });
  const [iconPreview, setIconPreview] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('categories_view_mode') || 'card');
  const [totalCategories, setTotalCategories] = useState(0);
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const hasMounted = useRef(false);
  const fetchIdRef = useRef(0);
  const abortControllerRef = useRef(null);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async (page, perPage, search) => {
    const currentFetchId = ++fetchIdRef.current;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsFetching(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          per_page: perPage,
          search: search || undefined,
          _t: Date.now(),
        },
      });

      if (currentFetchId !== fetchIdRef.current) return;

      const data = response.data.data || [];
      const meta = response.data.meta || {};

      setCategories(data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: cat.icon,
        description: cat.description,
        destinationCount: cat.destinations_count || 0,
        isActive: cat.is_active,
      })));
      setTotalCategories(meta.total ?? data.length);

      if (page === 1 && !search) {
        localStorage.setItem('cached_categories', JSON.stringify({
          data,
          total: meta.total ?? data.length,
          timestamp: Date.now(),
        }));
      }
    } catch (error) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') return;
      console.error('Error fetching categories:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/');
      } else {
        toast.error('Failed to load categories');
      }
    } finally {
      if (currentFetchId === fetchIdRef.current) setIsFetching(false);
    }
  }, [navigate]);

  useEffect(() => {
    const loadInitial = async () => {
      const cached = localStorage.getItem('cached_categories');
      if (cached && currentPage === 1 && !searchQuery) {
        try {
          const parsed = JSON.parse(cached);
          const age = Date.now() - (parsed.timestamp || 0);
          if (age < 300000 && parsed.data?.length) {
            setCategories(parsed.data);
            setTotalCategories(parsed.total || parsed.data.length);
            setInitialLoading(false);
            hasMounted.current = true;
            fetchCategories(currentPage, itemsPerPage, searchQuery);
            return;
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      await fetchCategories(currentPage, itemsPerPage, searchQuery);
      setInitialLoading(false);
      hasMounted.current = true;
    };

    loadInitial();
    return () => {
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [currentPage, itemsPerPage, searchQuery, fetchCategories]);

  useEffect(() => {
    if (!hasMounted.current) return;
    fetchCategories(currentPage, itemsPerPage, searchQuery);
  }, [currentPage, itemsPerPage, searchQuery, fetchCategories]);

  const openModal = (mode, data = null) => {
    setModalState({ isOpen: true, mode, data });
    if (mode === 'edit' && data) {
      setFormData({
        name: data.name || '',
        description: data.description || '',
        icon: data.icon || '📁',
        is_active: data.isActive ?? true,
      });
      setIconPreview(isImagePath(data.icon) ? getIconUrl(data.icon) : null);
    } else {
      setFormData({ name: '', description: '', icon: '📁', is_active: true });
      setIconPreview(null);
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    setFormData({ name: '', description: '', icon: '📁', is_active: true });
    setIconPreview(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Icon must be less than 2MB');
      return;
    }
    setFormData((prev) => ({ ...prev, icon: file }));
    setIconPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('category_name', formData.name.trim());
      fd.append('description', formData.description || '');
      fd.append('is_active', formData.is_active ? '1' : '0');

      if (formData.icon instanceof File) {
        fd.append('icon', formData.icon);
      } else if (typeof formData.icon === 'string' && formData.icon) {
        fd.append('icon', formData.icon);
      }

      const token = localStorage.getItem('auth_token');
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      };

      if (modalState.mode === 'edit' && modalState.data) {
        fd.append('_method', 'PUT');
        await axios.post(`${API_BASE_URL}/categories/${modalState.data.id}`, fd, config);
        toast.success('Category updated successfully');
        await fetchCategories(currentPage, itemsPerPage, searchQuery);
      } else {
        await axios.post(`${API_BASE_URL}/categories`, fd, config);
        toast.success('Category added successfully');
        if (currentPage !== 1) setCurrentPage(1);
        await fetchCategories(1, itemsPerPage, searchQuery);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving category:', error);
      const msg = error.response?.data?.message || 'Failed to save category';
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    setDeleteConfirm({ isOpen: true, category });
  };

  const confirmDelete = async () => {
    const category = deleteConfirm.category;
    if (!category) return;

    try {
      const token = localStorage.getItem('auth_token');
      await axios.delete(`${API_BASE_URL}/categories/${category.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Category deleted');
      setDeleteConfirm({ isOpen: false, category: null });
      await fetchCategories(currentPage, itemsPerPage, searchQuery);
    } catch (error) {
      console.error('Error deleting category:', error);
      const msg = error.response?.data?.message || 'Failed to delete category';
      toast.error(msg);
      setDeleteConfirm({ isOpen: false, category: null });
      await fetchCategories(currentPage, itemsPerPage, searchQuery);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const renderModalContent = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">
          Category Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="Enter category name"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows="3"
          placeholder="Brief description"
          className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs text-slate-900 bg-white border-2 border-slate-300 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
        />
      </div>

      <div>
        <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Category Icon</label>
        <div className="flex items-center gap-4">
          {iconPreview ? (
            <div className="relative group">
              <div className="w-20 h-20 rounded-xl border-2 border-slate-200 flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 overflow-hidden">
                <img src={iconPreview} alt="Icon preview" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => {
                  setIconPreview(null);
                  setFormData((prev) => ({ ...prev, icon: '📁' }));
                }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center bg-slate-50 text-3xl">
              {typeof formData.icon === 'string' ? formData.icon : '📁'}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <label className="block">
              <input
                type="file"
                id="icon-upload"
                accept="image/*"
                onChange={handleIconChange}
                className="hidden"
              />
              <label
                htmlFor="icon-upload"
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs font-medium rounded-lg cursor-pointer inline-flex items-center gap-2 transition-colors"
              >
                <Upload size={16} />
                Upload Image
              </label>
            </label>
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-slate-200"></div>
              <span className="text-xs text-slate-500">or use emoji</span>
              <div className="h-px flex-1 bg-slate-200"></div>
            </div>
            <p className="text-xs text-slate-500">{formData.icon instanceof File ? formData.icon.name : 'Upload image (max 2MB) or enter emoji'}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const paginatedCategories = categories;
  const totalPages = Math.max(1, Math.ceil((totalCategories || 0) / itemsPerPage));

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>

      <ToastNotification />
      <FetchingIndicator isFetching={isFetching} />
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Destination Categories</h1>
                <p className="text-sm text-teal-50 mt-1">Manage destination types and classifications</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-lg border border-white/30">
                  <Clock className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <AddButton onClick={() => openModal('add')} icon={Plus}>
                  Add Category
                </AddButton>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-start justify-between mb-6">
            <div className="flex-1 sm:max-w-md lg:max-w-2xl">
              <SearchFilter
                searchQuery={searchQuery}
                onSearchChange={handleSearchChange}
                searchPlaceholder="Search categories..."
              />
            </div>
            <div className="flex-shrink-0">
              <ViewToggle
                view={viewMode}
                onViewChange={(mode) => {
                  setViewMode(mode);
                  localStorage.setItem('categories_view_mode', mode);
                }}
              />
            </div>
          </div>

          <div className="mb-4">
            <p className="text-sm text-slate-600">
              Found <span className="font-medium text-slate-900">{totalCategories}</span> categories
              {searchQuery && <span> matching "<span className="font-medium text-slate-900">{searchQuery}</span>"</span>}
            </p>
          </div>

          {initialLoading ? (
            <SkeletonLoader type="card" count={6} />
          ) : (
            <>
              {paginatedCategories.length > 0 ? (
                <>
                  {viewMode === 'card' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                      {paginatedCategories.map((category) => (
                        <div
                          key={category.id}
                          className="group bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 border-2 border-teal-200 rounded-xl hover:shadow-2xl hover:border-teal-400 hover:from-teal-50 hover:via-cyan-50 hover:to-blue-50 transition-all duration-300 shadow-[0_8px_20px_rgba(20,184,166,0.15)] overflow-hidden h-[200px] flex flex-col hover:scale-[1.02]"
                        >
                          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-5 relative">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-14 h-14 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-xl shadow-md flex items-center justify-center text-3xl flex-shrink-0 overflow-hidden">
                                  {isImagePath(category.icon) ? (
                                    <img
                                      src={getIconUrl(category.icon)}
                                      alt={category.name}
                                      loading="lazy"
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        e.currentTarget.parentElement.innerHTML = '<span class="text-3xl">📁</span>';
                                      }}
                                    />
                                  ) : (
                                    <span>{category.icon || '📁'}</span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-slate-900">{category.name}</h3>
                                  <span className="text-xs text-teal-600 font-medium">{category.destinationCount} destinations</span>
                                </div>
                              </div>
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

                          <div className="p-5 flex-1 overflow-hidden">
                            <p className="text-sm text-slate-600 line-clamp-3">{category.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/30 rounded-xl shadow-[0_8px_20px_rgba(20,184,166,0.15)] border-2 border-teal-200 overflow-hidden mb-6">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-teal-100 to-cyan-100 border-b-2 border-teal-300">
                          <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Destinations</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-teal-200">
                          {paginatedCategories.map((category) => (
                            <tr key={category.id} className="hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors duration-150">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg shadow-md flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden">
                                    {isImagePath(category.icon) ? (
                                      <img
                                        src={getIconUrl(category.icon)}
                                        alt={category.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                          e.currentTarget.parentElement.innerHTML = '<span class="text-2xl">📁</span>';
                                        }}
                                      />
                                    ) : (
                                      <span>{category.icon || '📁'}</span>
                                    )}
                                  </div>
                                  <span className="font-semibold text-slate-900">{category.name}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-600 max-w-md">{category.description}</td>
                              <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-700">
                                  {category.destinationCount}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => openModal('edit', category)}
                                    className="p-2 bg-gradient-to-br from-blue-400 to-indigo-500 text-white rounded-lg hover:from-blue-500 hover:to-indigo-600 transition-all shadow-md"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(category)}
                                    className="p-2 bg-gradient-to-br from-red-400 to-pink-500 text-white rounded-lg hover:from-red-500 hover:to-pink-600 transition-all shadow-md"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

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
              ) : !isFetching ? (
                <div className="bg-gradient-to-br from-white via-slate-50 to-gray-50 rounded-xl border-2 border-dashed border-teal-300 p-12 text-center shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mb-4 shadow-md">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-medium text-slate-900 mb-2">No categories found</h3>
                    <p className="text-sm text-slate-600 mb-6">
                      {searchQuery ? `No categories match "${searchQuery}"` : 'Get started by adding your first category'}
                    </p>
                    {!searchQuery && (
                      <Button variant="primary" onClick={() => openModal('add')} icon={<Plus className="w-4 h-4" />}>
                        Add Category
                      </Button>
                    )}
                  </div>
                </div>
              ) : null}
            </>
          )}
        </main>
      </div>

      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.mode === 'edit' ? 'Edit Category' : 'Add New Category'}
        titleIcon="🏷️"
        size="2xl"
        footer={(
          <>
            <Button variant="outline" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={saving}>
              {modalState.mode === 'edit' ? 'Save Changes' : 'Add Category'}
            </Button>
          </>
        )}
      >
        {renderModalContent()}
      </Modal>

      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, category: null })}
        onConfirm={confirmDelete}
        type="delete"
        title="Delete Category"
        message={`Are you sure you want to delete "${deleteConfirm.category?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
  );
});

Categories.displayName = 'Categories';

export default Categories;
