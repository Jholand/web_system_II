import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { staggerContainer, slideInFromRight } from '../../utils/animations';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';

const Rewards = () => {
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

  const rewards = [
    {
      id: 1,
      title: 'Free Coffee',
      description: 'Get a free coffee at any partner cafe',
      points: 50,
      category: 'Food & Beverage',
      stock: 100,
      claimed: 45,
    },
    {
      id: 2,
      title: 'Hotel Discount',
      description: '20% off on hotel bookings',
      points: 200,
      category: 'Accommodation',
      stock: 50,
      claimed: 12,
    },
    {
      id: 3,
      title: 'Tour Package',
      description: 'Free guided tour for 2 persons',
      points: 500,
      category: 'Experience',
      stock: 20,
      claimed: 8,
    },
    {
      id: 4,
      title: 'Restaurant Voucher',
      description: '₱500 voucher at partner restaurants',
      points: 150,
      category: 'Food & Beverage',
      stock: 75,
      claimed: 32,
    },
    {
      id: 5,
      title: 'Spa Package',
      description: 'Full body massage and spa treatment',
      points: 300,
      category: 'Wellness',
      stock: 30,
      claimed: 15,
    },
    {
      id: 6,
      title: 'Adventure Bundle',
      description: 'Zipline, ATV, and hiking experience',
      points: 750,
      category: 'Experience',
      stock: 15,
      claimed: 5,
    },
    {
      id: 7,
      title: 'Shopping Voucher',
      description: '₱1000 voucher at local shops',
      points: 250,
      category: 'Shopping',
      stock: 50,
      claimed: 20,
    },
    {
      id: 8,
      title: 'Museum Pass',
      description: 'Free entry to 3 museums',
      points: 100,
      category: 'Culture',
      stock: 60,
      claimed: 25,
    },
    {
      id: 9,
      title: 'Premium Tour Package',
      description: '3-day all-inclusive tour',
      points: 1000,
      category: 'Experience',
      stock: 10,
      claimed: 3,
    },
  ];

  const categories = [
    { value: 'Food & Beverage', label: '☕ Food & Beverage' },
    { value: 'Accommodation', label: '🏨 Accommodation' },
    { value: 'Experience', label: '🎯 Experience' },
    { value: 'Wellness', label: '💆 Wellness' },
    { value: 'Shopping', label: '🛍️ Shopping' },
    { value: 'Culture', label: '🎭 Culture' },
  ];

  // Filter and pagination logic
  const filteredRewards = rewards.filter(reward => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = (
      reward.title.toLowerCase().includes(query) ||
      reward.description.toLowerCase().includes(query) ||
      reward.category.toLowerCase().includes(query)
    );
    const matchesCategory = selectedCategory === 'all' || reward.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.ceil(filteredRewards.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRewards = filteredRewards.slice(startIndex, startIndex + itemsPerPage);

  // Handlers
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1); // Reset to first page on category change
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(value);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const openModal = (mode, data = null) => setModalState({ isOpen: true, mode, data });
  const closeModal = () => setModalState({ isOpen: false, mode: '', data: null });

  const handleView = (reward) => openModal('view', reward);
  const handleEdit = (reward) => openModal('edit', reward);
  const handleDelete = (reward) => openModal('delete', reward);
  const handleAddReward = () => openModal('add');

  const confirmDelete = () => {
    toast.success('Reward deleted successfully!');
    closeModal();
  };

  const handleSave = () => {
    if (modalState.mode === 'add') toast.success('Reward added successfully!');
    else if (modalState.mode === 'edit') toast.success('Reward updated successfully!');
    closeModal();
  };

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      return (
        <div className="space-y-4">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Reward Title</label>
            <p className="text-base sm:text-lg font-semibold text-slate-900">{data.title}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Description</label>
            <p className="text-sm sm:text-base text-slate-900">{data.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Points Required</label>
              <p className="text-base sm:text-lg font-semibold text-teal-600">{data.points}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Category</label>
              <p className="text-sm sm:text-base text-slate-900">{data.category}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Stock</label>
              <p className="text-base sm:text-lg font-semibold text-slate-900">{data.stock}</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Claimed</label>
              <p className="text-base sm:text-lg font-semibold text-slate-900">{data.claimed}</p>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Reward Title *</label>
            <input 
              type="text" 
              placeholder="Enter reward title"
              defaultValue={mode === 'edit' ? data?.title : ''}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
          </div>

          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Description *</label>
            <textarea 
              placeholder="Enter description"
              defaultValue={mode === 'edit' ? data?.description : ''}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Points Required *</label>
              <input 
                type="number" 
                placeholder="50"
                defaultValue={mode === 'edit' ? data?.points : ''}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Category *</label>
              <select 
                defaultValue={mode === 'edit' ? data?.category : ''}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              >
                <option value="">Select category</option>
                <option value="Food & Beverage">Food & Beverage</option>
                <option value="Accommodation">Accommodation</option>
                <option value="Experience">Experience</option>
                <option value="Transport">Transport</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Stock *</label>
            <input 
              type="number" 
              placeholder="100"
              defaultValue={mode === 'edit' ? data?.stock : ''}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
            />
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
          <p className="text-center text-sm sm:text-base text-slate-700">
            Are you sure you want to delete the reward <span className="font-bold text-slate-900">"{data.title}"</span>?
          </p>
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
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between gap-3 mb-3">
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Rewards</h2>
                <p className="text-slate-600 mt-1">Manage and track reward redemptions</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                variant="primary"
                size="md"
                onClick={handleAddReward}
                icon={<Plus className="w-5 h-5" />}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Reward
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div 
          className="mb-6"
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
            placeholder="Search rewards by title, description, or category..."
            showFilter={true}
          />
        </motion.div>

        {/* Results Count */}
        {searchQuery && (
          <motion.div 
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="text-sm text-slate-600">
              Found <span className="font-semibold text-slate-900">{filteredRewards.length}</span> rewards matching your search
            </p>
          </motion.div>
        )}

        {/* Rewards Grid */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {paginatedRewards.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-10 h-10 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <motion.div key={reward.id} variants={slideInFromRight}>
              <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 relative">
                {/* Hover Actions - Top Right */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleView(reward)}
                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
                    title="View"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleEdit(reward)}
                    className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(reward)}
                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm font-semibold rounded-full mb-2">
                      {reward.category}
                    </span>
                    <h4 className="text-lg font-bold text-slate-900 mb-2">{reward.title}</h4>
                    <p className="text-sm text-slate-600">{reward.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Points Required</p>
                    <p className="text-xl font-bold text-purple-600">{reward.points}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500 mb-1">Stock</p>
                    <p className="text-lg font-semibold text-slate-900">{reward.stock - reward.claimed}/{reward.stock}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
          )}
        </motion.div>

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
};

export default Rewards;
