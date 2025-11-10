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

const Badges = () => {
  const navigate = useNavigate();
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

  const badges = [
    {
      id: 1,
      title: 'Explorer',
      description: 'Visit 5 destinations',
      icon: '🗺️',
      points: 100,
      color: 'bg-blue-500',
      category: 'travel',
    },
    {
      id: 2,
      title: 'Adventurer',
      description: 'Visit 10 destinations',
      icon: '⛰️',
      points: 250,
      color: 'bg-green-500',
      category: 'travel',
    },
    {
      id: 3,
      title: 'Master Traveler',
      description: 'Visit 25 destinations',
      icon: '🌟',
      points: 500,
      color: 'bg-purple-500',
      category: 'travel',
    },
    {
      id: 4,
      title: 'Local Hero',
      description: 'Visit 3 local farms',
      icon: '🌾',
      points: 150,
      color: 'bg-emerald-500',
      category: 'agriculture',
    },
    {
      id: 5,
      title: 'Peak Seeker',
      description: 'Visit 5 mountain peaks',
      icon: '⛰️',
      points: 300,
      color: 'bg-orange-500',
      category: 'nature',
    },
    {
      id: 6,
      title: 'Ultimate Explorer',
      description: 'Visit 50 destinations',
      icon: '👑',
      points: 1000,
      color: 'bg-yellow-500',
      category: 'travel',
    },
    {
      id: 7,
      title: 'Cultural Enthusiast',
      description: 'Visit 5 heritage sites',
      icon: '🏛️',
      points: 200,
      color: 'bg-indigo-500',
      category: 'culture',
    },
    {
      id: 8,
      title: 'Beach Lover',
      description: 'Visit 3 beach resorts',
      icon: '🏖️',
      points: 175,
      color: 'bg-cyan-500',
      category: 'nature',
    },
    {
      id: 9,
      title: 'Nature Guide',
      description: 'Complete 10 nature trails',
      icon: '🌿',
      points: 350,
      color: 'bg-green-600',
      category: 'nature',
    },
  ];

  const categories = [
    { value: 'travel', label: '🗺️ Travel' },
    { value: 'nature', label: '🌿 Nature' },
    { value: 'agriculture', label: '🌾 Agriculture' },
    { value: 'culture', label: '🏛️ Culture' },
  ];

  // Filter and search logic
  const filteredBadges = badges.filter((badge) => {
    const matchesSearch = badge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         badge.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredBadges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBadges = filteredBadges.slice(startIndex, startIndex + itemsPerPage);

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

  const handleView = (badge) => openModal('view', badge);
  const handleEdit = (badge) => openModal('edit', badge);
  const handleDelete = (badge) => openModal('delete', badge);
  const handleAddBadge = () => openModal('add');

  const confirmDelete = () => {
    toast.success('Badge deleted successfully!');
    closeModal();
  };

  const handleSave = () => {
    if (modalState.mode === 'add') toast.success('Badge added successfully!');
    else if (modalState.mode === 'edit') toast.success('Badge updated successfully!');
    closeModal();
  };

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl text-4xl sm:text-5xl">
            {data.icon}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Badge Name</label>
            <p className="text-base sm:text-lg font-semibold text-slate-900">{data.title}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Description</label>
            <p className="text-sm sm:text-base text-slate-900">{data.description}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-2">Points</label>
            <p className="text-base sm:text-lg font-semibold text-slate-900">{data.points}</p>
          </div>
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
      return (
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Badge Name *</label>
            <input 
              type="text" 
              placeholder="Enter badge name"
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
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Icon *</label>
              <input 
                type="text" 
                placeholder="🎯"
                defaultValue={mode === 'edit' ? data?.icon : ''}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>

            <div className="relative">
              <label className="block text-xs sm:text-sm font-semibold text-slate-600 mb-2">Points *</label>
              <input 
                type="number" 
                placeholder="100"
                defaultValue={mode === 'edit' ? data?.points : ''}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
              />
            </div>
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
            Are you sure you want to delete the badge <span className="font-bold text-slate-900">"{data.title}"</span>?
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

      <DashboardTabs />

      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-900">Badges & Achievements</h2>
                <p className="text-sm text-slate-600 mt-1">Create and manage user achievement badges</p>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button 
                variant="primary" 
                onClick={handleAddBadge} 
                icon={<Plus className="w-5 h-5" />}
                className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Add Badge
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
            placeholder="Search badges..."
            showFilter={true}
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
            Found <span className="font-bold text-purple-600">{filteredBadges.length}</span> badge{filteredBadges.length !== 1 ? 's' : ''}
            {searchQuery && <span> matching "<span className="font-semibold text-slate-900">{searchQuery}</span>"</span>}
          </p>
        </motion.div>

        {/* Cards Grid */}
        {paginatedBadges.length > 0 ? (
          <>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6"
            >
              {paginatedBadges.map((badge) => (
                <motion.div key={badge.id} variants={slideInFromRight}>
                  <div className="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 relative">
                    {/* Hover Actions - Top Right */}
                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleView(badge)}
                        className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors shadow-md"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEdit(badge)}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(badge)}
                        className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>

                    <div className={`flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mx-auto ${badge.color} rounded-2xl text-4xl sm:text-5xl mb-4`}>
                      {badge.icon}
                    </div>
                    <h4 className="text-lg font-bold text-slate-900 text-center mb-2">{badge.title}</h4>
                    <p className="text-sm text-slate-600 text-center mb-4">{badge.description}</p>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-bold text-purple-600">{badge.points}</span>
                      <span className="text-sm text-slate-500">points</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            {filteredBadges.length > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredBadges.length}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No badges found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search criteria</p>
              <Button variant="outline" onClick={() => setSearchQuery('')}>
                Clear Search
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
        size="md"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Badges;
