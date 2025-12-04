import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import { getCurrentAdmin } from '../../utils/adminHelper';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import { Users as UsersIcon, Shield, User, Mail, Phone, MapPin, Award, Calendar } from 'lucide-react';
import { UserSkeletonGrid } from '../../components/common/UserSkeleton';

const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();
axios.defaults.withCredentials = true;

const Users = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  
  // Pagination and filters
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [totalUsers, setTotalUsers] = useState(0);

  const handleLogout = () => {
    navigate('/');
  };

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, searchQuery, selectedRole]);

  const fetchUsers = async () => {
    try {
      setIsFetching(true);
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          role: selectedRole !== 'all' ? selectedRole : undefined,
        }
      });

      const data = response.data.data || [];
      const meta = response.data.meta || {};
      
      setUsers(data);
      setTotalUsers(meta.total || data.length);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired');
        navigate('/');
        return;
      }
      toast.error('Failed to load users');
      setLoading(false);
    } finally {
      setIsFetching(false);
    }
  };

  const totalPages = Math.ceil(totalUsers / itemsPerPage);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRoleBadge = (role) => {
    const roleStyles = {
      admin: 'bg-purple-100 text-purple-700',
      user: 'bg-blue-100 text-blue-700',
      moderator: 'bg-orange-100 text-orange-700'
    };
    return roleStyles[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      <ToastNotification />
      <FetchingIndicator isFetching={isFetching} />
      <AdminHeader 
        admin={getCurrentAdmin()}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        sidebarCollapsed={sidebarCollapsed}
      />
      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <main 
        className={`
          relative z-10
          transition-all duration-150 ease-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12
        `}
      >
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Users Management</h2>
          </div>
          <p className="text-gray-600">Total: {totalUsers} users</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            onClick={() => handleRoleChange('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'all'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => handleRoleChange('user')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'user'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => handleRoleChange('admin')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedRole === 'admin'
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Admins
          </button>
        </div>

        {/* Users List */}
        {loading ? (
          <UserSkeletonGrid count={itemsPerPage} />
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <UsersIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">No users found</p>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {user.name || 'Unnamed User'}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                          {user.role === 'admin' && <Shield className="w-3 h-3 inline mr-1" />}
                          {user.role?.toUpperCase() || 'USER'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                        {user.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        
                        {user.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{user.phone}</span>
                          </div>
                        )}

                        {user.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{user.address}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-gray-600">
                          <Award className="w-4 h-4 flex-shrink-0" />
                          <span>{user.points || 0} points</span>
                        </div>

                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>Joined {formatDate(user.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={handleItemsPerPageChange}
                totalItems={totalUsers}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Users;
