import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import MapView from '../../components/map/MapView';
import FilterSidebar from '../../components/map/FilterSidebar';
import SavedLocations from '../../components/map/SavedLocations';
import { useLocation } from '../../contexts/LocationContext';
import { useAuth } from '../../contexts/AuthContext';
import { staggerContainer, slideInFromBottom, slideInFromRight } from '../../utils/animations';
import api from '../../services/api';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import DestinationDetail from '../../components/map/DestinationDetail';
import QRScanner from '../../components/qr/QRScanner';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';

const MapExplorer = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userLocation, getNearbyDestinations, calculateDistance } = useLocation();
  const [destinations, setDestinations] = useState([]);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [viewMode, setViewMode] = useState('map'); // 'map' or 'list'
  const [activeFilter, setActiveFilter] = useState('all');
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [arrivedDestination, setArrivedDestination] = useState(null);

  useEffect(() => {
    fetchDestinations();
  }, []);

  useEffect(() => {
    if (userLocation && destinations.length > 0) {
      const nearby = getNearbyDestinations(destinations, 50); // 50km radius
      setNearbyDestinations(nearby);
    }
  }, [userLocation, destinations]);

  // Track distance to navigation destination
  useEffect(() => {
    if (isNavigating && navigationDestination && userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        navigationDestination.latitude,
        navigationDestination.longitude
      );
      setDistanceToDestination(distance);

      // Check if arrived (within 50 meters)
      if (distance < 0.05) {
        handleArrival(navigationDestination);
      }
    }
  }, [userLocation, isNavigating, navigationDestination]);

  const fetchDestinations = async () => {
    try {
      // Load from localStorage (added by admin)
      const savedDests = JSON.parse(localStorage.getItem('travelquest_destinations') || '[]');
      
      // Mock data matching the design
      const mockDestinations = [
        {
          id: 1,
          name: 'Grand Hotel Resort',
          category: 'hotel',
          description: 'Luxury resort with excellent amenities and service',
          latitude: 14.5995,
          longitude: 120.9842,
          points: 50,
          rating: 4.8,
          reviewCount: 142,
          rewards: [
            { id: 1, name: 'Hotel Branded Mug', description: 'Exclusive ceramic mug', points: 30 },
            { id: 2, name: 'Luxury Spa Kit', description: 'Premium spa products', points: 40 }
          ]
        },
        {
          id: 2,
          name: 'Organic Farm Experience',
          category: 'agri farm',
          description: 'Fresh organic produce and farm tours',
          latitude: 14.6095,
          longitude: 120.9942,
          points: 30,
          rating: 4.5,
          reviewCount: 89,
          rewards: []
        },
        {
          id: 3,
          name: 'Mountain Peak Viewpoint',
          category: 'tourist spot',
          description: 'Breathtaking mountain views and hiking trails',
          latitude: 14.5895,
          longitude: 120.9742,
          points: 100,
          rating: 4.9,
          reviewCount: 256,
          rewards: []
        },
        {
          id: 4,
          name: 'City Plaza Hotel',
          category: 'hotel',
          description: 'Modern hotel in the heart of the city',
          latitude: 14.6195,
          longitude: 121.0042,
          points: 50,
          rating: 4.6,
          reviewCount: 178,
          rewards: []
        },
        {
          id: 5,
          name: 'Heritage Farm',
          category: 'agri farm',
          description: 'Traditional farming methods and local produce',
          latitude: 14.5795,
          longitude: 120.9642,
          points: 30,
          rating: 4.4,
          reviewCount: 92,
          rewards: []
        }
      ];
      
      // Merge saved destinations with mock data
      const allDestinations = [...mockDestinations, ...savedDests];
      setDestinations(allDestinations);
      setSavedLocations([allDestinations[2], allDestinations[1]]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNavigation = (destination) => {
    setIsNavigating(true);
    setNavigationDestination(destination);
    setSelectedDestination(null);
    toast.success(`Navigation started to ${destination.name}`);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setNavigationDestination(null);
    setDistanceToDestination(null);
  };

  const handleArrival = (destination) => {
    setIsNavigating(false);
    setNavigationDestination(null);
    setArrivedDestination(destination);
    setShowQRModal(true);
    toast.success(`You've arrived at ${destination.name}! Scan QR to claim points.`);
  };

  const handleQRScan = (qrCode) => {
    if (arrivedDestination && qrCode === arrivedDestination.qrCode) {
      // Award points
      const currentPoints = parseInt(localStorage.getItem('travelquest_points') || '0');
      const newPoints = currentPoints + arrivedDestination.points;
      localStorage.setItem('travelquest_points', newPoints.toString());
      
      // Add to visit history
      const visits = JSON.parse(localStorage.getItem('travelquest_visits') || '[]');
      visits.push({
        destination: arrivedDestination,
        date: new Date().toISOString(),
        points: arrivedDestination.points
      });
      localStorage.setItem('travelquest_visits', JSON.stringify(visits));
      
      toast.success(`+${arrivedDestination.points} points! Total: ${newPoints} points`);
      setShowQRModal(false);
      setArrivedDestination(null);
    } else {
      toast.error('Invalid QR code');
    }
  };

  const handleScanSuccess = async (qrCode) => {
    try {
      handleQRScan(qrCode);
    } catch (error) {
      toast.error(error.message || 'Check-in failed');
    }
  };

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const getFilteredDestinations = () => {
    if (activeFilter === 'all') return nearbyDestinations;
    return nearbyDestinations.filter(dest => dest.category === activeFilter);
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'hotel': return '🏨';
      case 'agri farm': return '🌾';
      case 'tourist spot': return '⛰️';
      default: return '📍';
    }
  };

  const filteredDestinations = getFilteredDestinations();

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      <UserHeader user={user} onLogout={handleLogout} />

      <UserDashboardTabs />

      {/* Main Content */}
      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-6 pt-24 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">
        {/* Page Title */}
        <motion.h2 
          className="text-3xl font-bold text-slate-900 mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Your Adventure
        </motion.h2>

        {/* Navigation Tracker */}
        {isNavigating && navigationDestination && (
          <motion.div 
            className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-6 border-2 border-teal-600 mb-6 shadow-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div>
                  <p className="text-white/80 text-sm mb-1">Navigating to</p>
                  <h3 className="text-2xl font-bold">{navigationDestination.name}</h3>
                  <p className="text-white/90 text-lg mt-1">
                    📍 {distanceToDestination !== null ? `${distanceToDestination.toFixed(2)} km away` : 'Calculating...'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleStopNavigation}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all border-2 border-white/50"
              >
                Stop Navigation
              </button>
            </div>
            {distanceToDestination !== null && distanceToDestination < 0.5 && (
              <div className="mt-4 bg-white/20 rounded-lg p-3 border border-white/30">
                <p className="text-white text-sm font-semibold">🎉 Almost there! Get ready to scan the QR code when you arrive.</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Explore Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 border mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-2">Explore & Navigate</h3>
          <p className="text-slate-600 mb-6">Discover nearby destinations, save favorites, and navigate to new adventures</p>

          {/* View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'map'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Map
            </button>
            
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </button>

            <div className="ml-auto flex items-center gap-2 text-slate-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
              <span className="text-sm">14x</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </motion.div>

        {/* Map and Sidebar Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          {/* Map View */}
          <motion.div 
            className="lg:col-span-2"
            variants={slideInFromBottom}
          >
            <div className="bg-white rounded-2xl p-6 border">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-900">Interactive Map View</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">Zoom: 14x | Tap locations for details & souvenirs</p>

              {/* Map Container with proper height */}
              <div className="h-[500px] bg-blue-50 rounded-lg relative overflow-hidden border border-gray-200">
                {userLocation ? (
                  <MapView 
                    destinations={filteredDestinations}
                    onDestinationClick={setSelectedDestination}
                    selectedDestination={selectedDestination}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                      <p className="text-slate-600">Loading map...</p>
                      <p className="text-xs text-slate-500 mt-2">Please allow location access</p>
                    </div>
                  </div>
                )}
                
                {/* Location Count Overlay */}
                {userLocation && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border">
                    <p className="text-sm font-medium text-slate-900">{filteredDestinations.length} locations visible</p>
                    <p className="text-xs text-slate-600">Click on markers to see souvenirs</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-6"
            variants={slideInFromRight}
          >
            {/* Filter Locations */}
            <FilterSidebar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              destinations={nearbyDestinations}
            />

            {/* Selected Destination Details */}
            {selectedDestination && (
              <DestinationDetail
                destination={selectedDestination}
                userLocation={userLocation}
                onClose={() => setSelectedDestination(null)}
                onScanQR={() => setShowScanModal(true)}
                onNavigate={handleStartNavigation}
              />
            )}

            {/* Saved Locations */}
            <SavedLocations
              locations={savedLocations}
              calculateDistance={calculateDistance}
              userLocation={userLocation}
              onLocationClick={setSelectedDestination}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* QR Scanner Modal */}
      {showScanModal && (
        <Modal 
          isOpen={showScanModal} 
          onClose={() => setShowScanModal(false)}
          title="Scan QR Code"
        >
          <QRScanner onScanSuccess={handleScanSuccess} />
        </Modal>
      )}

      {/* Arrival QR Modal */}
      {showQRModal && arrivedDestination && (
        <Modal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setArrivedDestination(null);
          }}
          title="🎉 You've Arrived!"
          titleIcon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        >
          <div className="text-center space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-5xl">{getCategoryIcon(arrivedDestination.category)}</span>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{arrivedDestination.name}</h3>
              <p className="text-slate-600">{arrivedDestination.description}</p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
              <p className="text-sm text-orange-800 font-medium mb-2">Scan QR Code to Claim Points</p>
              <p className="text-4xl font-bold text-orange-600">+{arrivedDestination.points} pts</p>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600 mb-3">Find and scan the QR code at this location</p>
              <button
                onClick={() => {
                  setShowQRModal(false);
                  setShowScanModal(true);
                }}
                className="w-full px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-all"
              >
                Open QR Scanner
              </button>
            </div>

            <p className="text-xs text-slate-500">
              QR Code: {arrivedDestination.qrCode || `${arrivedDestination.category.toUpperCase().replace(' ', '-')}-${arrivedDestination.name.substring(0, 3).toUpperCase()}-${String(arrivedDestination.id).padStart(3, '0')}`}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MapExplorer;
