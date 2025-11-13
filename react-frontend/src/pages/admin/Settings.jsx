import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tabSlide } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ToastNotification from '../../components/common/ToastNotification';

const Settings = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('account');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState(''); // 'edit', 'add', 'delete'
  const [selectedAdmin, setSelectedAdmin] = useState(null);

  // Current logged-in admin
  const currentAdmin = {
    id: 1,
    name: 'em',
    email: 'admin@travelquest.com',
    role: 'Administrator',
    phone: '+63 912 345 6789',
    joinedDate: 'January 15, 2024',
  };

  // Other admin accounts
  const [adminAccounts, setAdminAccounts] = useState([
    {
      id: 2,
      name: 'John Doe',
      email: 'john@travelquest.com',
      role: 'Administrator',
      status: 'Active',
      lastLogin: '2 hours ago',
    },
    {
      id: 3,
      name: 'Jane Smith',
      email: 'jane@travelquest.com',
      role: 'Moderator',
      status: 'Active',
      lastLogin: '1 day ago',
    },
  ]);

  const handleEditProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    toast.success('Password changed successfully!');
  };

  const handleAddAdmin = () => {
    setModalMode('add');
    setSelectedAdmin(null);
    setShowModal(true);
  };

  const handleEditAdmin = (admin) => {
    setModalMode('edit');
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleDeleteAdmin = (admin) => {
    setModalMode('delete');
    setSelectedAdmin(admin);
    setShowModal(true);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleModalSave = () => {
    if (modalMode === 'add') {
      toast.success('Admin added successfully!');
    } else if (modalMode === 'edit') {
      toast.success('Admin updated successfully!');
    } else if (modalMode === 'delete') {
      toast.success('Admin deleted successfully!');
    }
    setShowModal(false);
  };

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      {/* Header */}
      <AdminHeader
        admin={{ name: currentAdmin.name, role: currentAdmin.role }}
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Settings</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Manage your account and system preferences</p>
            </div>
          </div>
        </motion.div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Settings Tabs */}
          <div className="border-b border-slate-200 bg-slate-50 overflow-x-auto">
            <div className="flex gap-2 p-2 min-w-max sm:min-w-0 justify-end">
              <Button
                onClick={() => setActiveTab('account')}
                variant={activeTab === 'account' ? 'primary' : 'outline'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                }
                className={activeTab === 'account' ? '' : 'bg-transparent hover:bg-slate-100'}
              >
                My Account
              </Button>
              <Button
                onClick={() => setActiveTab('admins')}
                variant={activeTab === 'admins' ? 'primary' : 'outline'}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                className={activeTab === 'admins' ? '' : 'bg-transparent hover:bg-slate-100'}
              >
                Admin Accounts
              </Button>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'account' && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Account Information</h3>
                  
                  <div className="flex items-start gap-6 mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl flex items-center justify-center text-white text-4xl font-bold shadow-lg">
                      {currentAdmin.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-slate-900">{currentAdmin.name}</h4>
                      <p className="text-slate-600">{currentAdmin.role}</p>
                      <p className="text-sm text-slate-500 mt-2">Member since {currentAdmin.joinedDate}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Full Name
                      </label>
                      <input
                        type="text"
                        defaultValue={currentAdmin.name}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Email Address
                      </label>
                      <input
                        type="email"
                        defaultValue={currentAdmin.email}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        Phone Number
                      </label>
                      <input
                        type="text"
                        defaultValue={currentAdmin.phone}
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Role
                      </label>
                      <input
                        type="text"
                        defaultValue={currentAdmin.role}
                        disabled
                        className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-8">
                    <Button variant="primary" onClick={handleEditProfile}>
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6">Change Password</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        New Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>

                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Confirm Password
                      </label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button variant="primary" onClick={handleChangePassword}>
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'admins' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-slate-900">Admin Accounts</h3>
                  <Button variant="primary" onClick={handleAddAdmin} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}>
                    Add Admin
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {adminAccounts.map((admin) => (
                    <div key={admin.id} className="bg-slate-50 rounded-xl p-6 border border-slate-200 hover:border-teal-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                            {admin.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{admin.name}</h4>
                            <p className="text-sm text-slate-600">{admin.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 mb-1">
                              {admin.role}
                            </span>
                            <p className="text-xs text-slate-500">Last login: {admin.lastLogin}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => handleEditAdmin(admin)}
                              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm" 
                              onClick={() => handleDeleteAdmin(admin)}
                              icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Admin Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalMode === 'add' ? 'Add Admin' : modalMode === 'edit' ? 'Edit Admin' : 'Delete Admin'}
      >
        {modalMode === 'delete' ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900">Delete {selectedAdmin?.name}?</h3>
            <p className="text-slate-600">This action cannot be undone.</p>
            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="danger" 
                onClick={handleModalSave} 
                className="flex-1"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
              >
                Delete
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input
                type="text"
                defaultValue={selectedAdmin?.name || ''}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                placeholder="John Doe"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Email</label>
              <input
                type="email"
                defaultValue={selectedAdmin?.email || ''}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                placeholder="john@travelquest.com"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="block text-sm font-bold text-slate-700 mb-2">Role</label>
              <select
                defaultValue={selectedAdmin?.role || 'Moderator'}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              >
                <option value="Administrator">Administrator</option>
                <option value="Moderator">Moderator</option>
              </select>
            </div>

            {modalMode === 'add' && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
                  placeholder="••••••••"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="secondary" onClick={() => setShowModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleModalSave} 
                className="flex-1"
                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
              >
                {modalMode === 'add' ? 'Add' : 'Save'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </AnimatedPage>
  );
};

export default Settings;
