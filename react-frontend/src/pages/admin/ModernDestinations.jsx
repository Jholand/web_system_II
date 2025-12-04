import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Moon, MapPin, Users } from 'lucide-react';
import axios from 'axios';
import AdminSidebar from '../../components/layout/AdminSidebar';
import { DestinationSkeletonGrid } from '../../components/common/DestinationSkeleton';
import toast from 'react-hot-toast';

// Auto-detect API URL
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();

const ModernDestinations = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Fetch destinations with instant cache loading
  useEffect(() => {
    const loadData = async () => {
      // Instant load from cache
      const cached = localStorage.getItem('cached_destinations_modern');
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setDestinations(parsed.data || parsed);
          setLoading(false);
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }

      // Fetch fresh data in background
      setIsFetching(true);
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get(`${API_BASE_URL}/destinations`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { per_page: 100 }
        });
        
        const data = response.data.data || [];
        setDestinations(data);
        localStorage.setItem('cached_destinations_modern', JSON.stringify({
          data,
          timestamp: Date.now()
        }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destinations:', error);
        if (error.response?.status === 401) {
          toast.error('Session expired');
          navigate('/');
        }
        setLoading(false);
      } finally {
        setIsFetching(false);
      }
    };

    loadData();
  }, [navigate]);

  // Filter destinations based on search
  const filteredDestinations = destinations.filter(dest => 
    dest.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <AdminSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div 
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left: Back button + Title */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-semibold text-gray-900">Explore Destinations</h1>
              </div>

              {/* Right: Search + Icons */}
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>

                {/* Notification Bell */}
                <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Bell className="w-5 h-5 text-gray-600" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Dark Mode Toggle */}
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Moon className="w-5 h-5 text-gray-600" />
                </button>

                {/* Profile */}
                <button className="flex items-center gap-2 px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="text-teal-600 font-semibold">U</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6">
          {/* Stats Header */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              {filteredDestinations.length} Destinations Found
            </h2>
            <p className="text-sm text-gray-500">
              Discover amazing places to visit and earn rewards
            </p>
          </div>

          {/* Destinations Grid */}
          {loading ? (
            <DestinationSkeletonGrid count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="wait">
                {filteredDestinations.map((destination, index) => (
                  <DestinationCard 
                    key={destination.id} 
                    destination={destination}
                    index={index}
                  />
                ))}
              </AnimatePresence>

              {filteredDestinations.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No destinations found</p>
                </div>
              )}
            </div>
          )}

          {/* Loading Indicator */}
          {isFetching && !loading && (
            <div className="fixed bottom-6 right-6 bg-teal-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Updating...</span>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

// Destination Card Component
const DestinationCard = ({ destination, index }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);

  const getImageUrl = (dest) => {
    if (imageError) return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
    if (dest.primary_image?.url) return dest.primary_image.url;
    if (dest.images?.[0]?.url) return dest.images[0].url;
    return 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800';
  };

  const getPoints = (dest) => dest.checkin_points || dest.points_reward || 50;
  const getVisitors = (dest) => dest.total_checkins || dest.stats?.total_visits || Math.floor(Math.random() * 20000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group cursor-pointer"
      onClick={() => navigate(`/admin/destinations/${destination.id}`)}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getImageUrl(destination)}
          alt={destination.name}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        {/* Points Badge */}
        <div className="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
          +{getPoints(destination)} pts
        </div>
        {/* Category Badge */}
        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-gray-700">
          {destination.category?.name || 'Destination'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
          {destination.name}
        </h3>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-teal-600" />
          <span className="line-clamp-1">
            {destination.municipality || destination.city || 'Location'}, {destination.province || 'Province'}
          </span>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4 text-teal-600" />
            <span>{getVisitors(destination).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-amber-500" />
            <span>{(Math.random() * 10).toFixed(1)}km away</span>
          </div>
        </div>

        {/* Button */}
        <button className="w-full bg-gray-900 text-white py-2.5 rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm">
          Check In
        </button>
      </div>
    </motion.div>
  );
};

export default ModernDestinations;
