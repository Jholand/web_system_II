import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import CheckInReview from '../../components/user/CheckInReview';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import UserHeader from '../../components/common/UserHeader';
import UserDashboardTabs from '../../components/user/UserDashboardTabs';
import axios from 'axios';

const MapExplorer = React.memo(() => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { userLocation, getNearbyDestinations, calculateDistance } = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showScanModal, setShowScanModal] = useState(false);
  const [locationViewMode, setLocationViewMode] = useState('all'); // 'all', 'nearby', 'saved'
  const [mapViewMode, setMapViewMode] = useState('map'); // 'map' or 'list'
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [savedLocations, setSavedLocations] = useState([]);
  const [savedDestinationIds, setSavedDestinationIds] = useState(new Set());
  const [loading, setLoading] = useState(false); // ⚡ START FALSE - instant!
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationDestination, setNavigationDestination] = useState(null);
  const [distanceToDestination, setDistanceToDestination] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [arrivedDestination, setArrivedDestination] = useState(null);
  const [navigationRoute, setNavigationRoute] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(null);
  const [categories, setCategories] = useState([]);
  const [scannedQRCode, setScannedQRCode] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [checkInDestination, setCheckInDestination] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Helper function to check if icon is an image path
  const isImagePath = (icon) => {
    if (!icon) return false;
    return icon.includes('/') || icon.includes('\\') || 
           icon.endsWith('.jpg') || icon.endsWith('.jpeg') || 
           icon.endsWith('.png') || icon.endsWith('.gif') || 
           icon.endsWith('.webp');
  };

  // Helper function to get full image URL
  const getIconUrl = (icon) => {
    if (isImagePath(icon)) {
      const BASE_URL = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`;
      return `${BASE_URL}/storage/${icon}`;
    }
    return icon; // Return emoji as is
  };

  // Use network IP for mobile testing, or localhost for desktop
  // Check if using Laragon Apache or artisan serve
  const API_BASE_URL = useMemo(() => 
    window.location.hostname === 'localhost' 
      ? 'http://localhost:8000/api'
      : `http://${window.location.hostname}:8000/api`,
    []
  );

  useEffect(() => {
    if (!dataFetched) {
      fetchDestinations();
      fetchCategories();
      fetchSavedDestinations();
      setDataFetched(true);
    }
  }, [dataFetched]);

  // Close category dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.getElementById('category-dropdown-user');
      const button = event.target.closest('.category-filter-button');
      if (dropdown && !button && dropdown.style.display !== 'none') {
        dropdown.style.display = 'none';
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  useEffect(() => {
    if (destinations.length > 0) {
      if (userLocation) {
        const nearby = getNearbyDestinations(destinations, 500); // 500km radius to cover entire province
        
        // Add distance to each destination
        const nearbyWithDistance = nearby.map(dest => ({
          ...dest,
          distance: calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            dest.latitude,
            dest.longitude
          )
        }));
        
        // Sort by distance
        nearbyWithDistance.sort((a, b) => a.distance - b.distance);
        
        setNearbyDestinations(nearbyWithDistance);
      } else {
        // If no user location yet, show all destinations without distance
        const allWithPlaceholderDistance = destinations.map(dest => ({
          ...dest,
          distance: null
        }));
        setNearbyDestinations(allWithPlaceholderDistance);
      }
    }
  }, [userLocation, destinations]);

  // Track distance to navigation destination in real-time
  useEffect(() => {
    if (isNavigating && navigationDestination && userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        navigationDestination.latitude,
        navigationDestination.longitude
      );
      setDistanceToDestination(distance);

      // Calculate estimated time (assuming average speed of 40 km/h)
      const timeInMinutes = (distance / 40) * 60;
      setEstimatedTime(timeInMinutes);

      // Check if arrived (within 50 meters)
      if (distance < 0.05) {
        handleArrival(navigationDestination);
      }
    }
  }, [userLocation, isNavigating, navigationDestination]);

  const fetchCategories = useCallback(async () => {
    try {
      // ULTRA-FAST: Check cache first (10min TTL)
      const cacheKey = 'cached_destination_categories';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // ⚡ EXTREME: Use cache if less than 2 HOURS old!
          if (age < 7200000 && data && data.length > 0) {
            setCategories(data);
            return; // ⚡ INSTANT - Skip API call!
          }
        } catch (e) {
          console.error('Cache parse error:', e);
        }
      }
      
      // Fetch from API if cache miss/expired
      const response = await axios.get(`${API_BASE_URL}/categories`);
      const data = response.data.data || [];
      setCategories(data);
      
      // Save to cache
      try {
        localStorage.setItem(cacheKey, JSON.stringify({
          data,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.error('Cache save error:', e);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [API_BASE_URL]);

  const fetchDestinations = useCallback(async () => {
    try {
      // ULTRA-FAST: Check cache first (5min TTL for destinations)
      const cacheKey = 'cached_map_destinations';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // ⚡ EXTREME: Use cache if less than 1 HOUR old!
          if (age < 3600000 && data && data.length > 0) {
            setDestinations(data);
            setLoading(false); // ⚡ INSTANT - 0ms!
            // Background refresh only if older than 30 minutes
            if (age > 1800000) {
              // Silent background refresh
              fetchDestinationsFromAPI();
            }
            return; // ⚡ Skip API call - INSTANT LOAD!
          }
        } catch (e) {
          // Silent cache error
        }
      }
      
      // Fetch from API if cache miss/expired
      await fetchDestinationsFromAPI();
    } catch (error) {
      console.error('Error in fetchDestinations:', error);
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchDestinationsFromAPI = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`);
      const data = response.data.data || [];
      
      const transformedDestinations = data.map(dest => ({
        id: dest.id,
        name: dest.name,
        title: dest.name,
        category: dest.category?.name?.toLowerCase() || 'hotel',
        categoryId: dest.category?.id || '',
        categoryIcon: dest.category?.icon || '📍',
        categoryName: dest.category?.name || 'Uncategorized',
        description: dest.description || 'No description available',
        address: `${dest.address?.street || ''} ${dest.address?.barangay || ''}, ${dest.address?.city || ''}, ${dest.address?.province || ''}`.trim(),
        latitude: parseFloat(dest.coordinates?.latitude) || 0,
        longitude: parseFloat(dest.coordinates?.longitude) || 0,
        points: dest.points_reward || 50,
        rating: dest.stats?.average_rating || 0,
        reviewCount: dest.stats?.total_reviews || 0,
        qrCode: dest.qr_code || `${dest.category?.name?.toUpperCase()?.replace(' ', '-')}-${dest.name?.substring(0, 3)?.toUpperCase()}-${String(dest.id).padStart(3, '0')}`,
        visitRadius: dest.visit_radius || 100,
        rewards: dest.rewards || [],
        images: dest.images || [],
        operatingHours: dest.operating_hours || []
      }));

      setDestinations(transformedDestinations);
      setLoading(false);
      
      // Save to cache
      try {
        localStorage.setItem('cached_map_destinations', JSON.stringify({
          data: transformedDestinations,
          timestamp: Date.now()
        }));
      } catch (e) {
        // Silent cache error
      }
    } catch (error) {
      console.error('Error fetching from API:', error);
      setLoading(false);
    }
  };

  const fetchSavedDestinations = useCallback(async () => {
    try {
      // INSTANT LOAD from cache
      const cacheKey = 'cached_saved_destinations';
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const { data, timestamp } = JSON.parse(cached);
          const age = Date.now() - timestamp;
          // Use cache immediately (even if old)
          const saved = data || [];
          setSavedLocations(saved);
          setSavedDestinationIds(new Set(saved.map(d => d.id)));
          
          // Only fetch if cache is older than 30 seconds
          if (age < 30000) {
            return; // Skip API call
          }
        } catch (e) {
          // Silent error, continue to fetch
        }
      }
      
      // Background fetch from API
      const response = await api.request('/user/saved-destinations');
      if (response.success) {
        const saved = response.data || [];
        setSavedLocations(saved);
        setSavedDestinationIds(new Set(saved.map(d => d.id)));
        
        // Save to cache
        try {
          localStorage.setItem(cacheKey, JSON.stringify({
            data: saved,
            timestamp: Date.now()
          }));
        } catch (e) {
          // Ignore cache save errors
        }
      }
    } catch (error) {
      console.error('Failed to fetch saved destinations:', error);
    }
  }, []);

  const toggleSaveDestination = useCallback(async (destinationId, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    // OPTIMISTIC UPDATE - Update UI immediately!
    const wasAlreadySaved = savedDestinationIds.has(destinationId);
    const willBeSaved = !wasAlreadySaved;
    
    // Update UI instantly (optimistic)
    setSavedDestinationIds(prev => {
      const newSet = new Set(prev);
      if (willBeSaved) {
        newSet.add(destinationId);
      } else {
        newSet.delete(destinationId);
      }
      return newSet;
    });
    
    // Show instant toast
    toast.success(willBeSaved ? '❤️ Saved!' : 'Removed', { duration: 1500 });
    
    // Update saved locations list optimistically
    if (willBeSaved) {
      const destination = nearbyDestinations.find(d => d.id === destinationId);
      if (destination) {
        setSavedLocations(prev => {
          const newList = [...prev, destination];
          // Update cache immediately
          try {
            localStorage.setItem('cached_saved_destinations', JSON.stringify({
              data: newList,
              timestamp: Date.now()
            }));
          } catch (e) {}
          return newList;
        });
      }
    } else {
      setSavedLocations(prev => {
        const newList = prev.filter(d => d.id !== destinationId);
        // Update cache immediately
        try {
          localStorage.setItem('cached_saved_destinations', JSON.stringify({
            data: newList,
            timestamp: Date.now()
          }));
        } catch (e) {}
        return newList;
      });
    }
    
    // API call in background (fire and forget)
    try {
      const response = await api.request('/user/saved-destinations/toggle', {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destinationId
        })
      });
      
      // Force update to ensure sync
      if (response.success) {
        // Double-check state is correct
        setSavedDestinationIds(prev => {
          const newSet = new Set(prev);
          if (response.is_saved) {
            newSet.add(destinationId);
          } else {
            newSet.delete(destinationId);
          }
          return newSet;
        });
      }
    } catch (error) {
      // Rollback on error
      setSavedDestinationIds(prev => {
        const newSet = new Set(prev);
        if (wasAlreadySaved) {
          newSet.add(destinationId);
        } else {
          newSet.delete(destinationId);
        }
        return newSet;
      });
      setSavedLocations(prev => {
        if (wasAlreadySaved) {
          const destination = nearbyDestinations.find(d => d.id === destinationId);
          if (destination) return [...prev, destination];
        } else {
          return prev.filter(d => d.id !== destinationId);
        }
        return prev;
      });
      toast.error('Failed to update');
      console.error('Toggle save error:', error);
    }
  }, [fetchSavedDestinations, nearbyDestinations, savedDestinationIds]);

  const handleStartNavigation = useCallback((destination) => {
    if (!userLocation) {
      toast.error('Please enable location services to start navigation');
      return;
    }
    
    setIsNavigating(true);
    setNavigationDestination(destination);
    setNavigationRoute({
      start: [userLocation.latitude, userLocation.longitude],
      end: [destination.latitude, destination.longitude]
    });
    setSelectedDestination(null);
    toast.success(`🧭 Navigation started to ${destination.name}`, { duration: 3000 });
  }, [userLocation]);

  const handleStopNavigation = useCallback(() => {
    setIsNavigating(false);
    setNavigationDestination(null);
    setNavigationRoute(null);
    setDistanceToDestination(null);
    setEstimatedTime(null);
    toast('Navigation stopped', { icon: '⏹️' });
  }, []);

  const handleArrival = useCallback((destination) => {
    setIsNavigating(false);
    setNavigationDestination(null);
    setNavigationRoute(null);
    setArrivedDestination(destination);
    setShowQRModal(true);
    toast.success(`🎉 You've arrived at ${destination.name}! Scan QR to claim points.`, { duration: 5000 });
  }, []);

  const handleScanSuccess = useCallback((qrCode) => {
    console.log('=== QR SCAN DEBUG ===');
    console.log('QR Code scanned:', qrCode);
    console.log('Selected destination:', selectedDestination);
    console.log('Arrived destination:', arrivedDestination);
    
    // Check if scanning for arrived destination or selected destination
    let targetDestination = arrivedDestination || selectedDestination;
    
    // If no destination is selected, show error - user must select a destination first
    if (!targetDestination) {
      console.error('No destination selected before scanning!');
      toast.error(
        <div className="space-y-2">
          <p className="font-bold">❌ No Destination Selected</p>
          <p className="text-sm">Please select a destination from the map first, then scan its QR code.</p>
          <p className="text-xs mt-2">📍 Tip: Click on a destination marker on the map to view details.</p>
        </div>,
        { 
          duration: 6000,
          style: { maxWidth: '400px' }
        }
      );
      setShowScanModal(false);
      return;
    }
    
    console.log('Target destination:', targetDestination);

    console.log('Target destination details:', {
      id: targetDestination.id,
      name: targetDestination.name,
      qrCode: targetDestination.qrCode
    });
    console.log('Expected QR code:', targetDestination.qrCode);
    console.log('Scanned QR code:', qrCode);

    // Check if user is within allowed radius (with GPS inaccuracy consideration)
    if (userLocation) {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        targetDestination.latitude,
        targetDestination.longitude
      );
      
      const distanceInMeters = distance * 1000;
      const allowedRadius = targetDestination.visitRadius || 100;
      // Add extra 200m buffer for laptop GPS inaccuracy (WiFi-based location)
      const effectiveRadius = allowedRadius + 200;
      
      console.log('GPS Check:', {
        distance: distanceInMeters.toFixed(0) + 'm',
        allowedRadius: allowedRadius + 'm',
        effectiveRadius: effectiveRadius + 'm (with GPS buffer)',
        userLocation,
        destinationLocation: { lat: targetDestination.latitude, lng: targetDestination.longitude }
      });
      
      if (distanceInMeters > effectiveRadius) {
        toast.error(
          <div className="space-y-2">
            <p className="font-bold">📍 Location Check Failed</p>
            <p className="text-sm">Distance: {distanceInMeters.toFixed(0)}m away</p>
            <p className="text-sm">Required: Within {allowedRadius}m</p>
            <p className="text-xs mt-2 opacity-80">💡 Tip: If you're at the location but getting this error, your device's GPS might be inaccurate. Try scanning the QR code anyway - the code verification is the primary check.</p>
          </div>,
          { 
            duration: 8000,
            style: { maxWidth: '400px' }
          }
        );
        // Don't return - allow QR code verification to proceed
        // Distance check is advisory for laptops with poor GPS
        console.warn('Distance check failed but allowing QR verification to proceed');
      } else {
        console.log('✓ Within check-in radius');
      }
    } else {
      console.warn('No user location available, skipping distance check');
      toast(
        '📍 Location unavailable. Proceeding with QR code verification only.',
        { icon: '⚠️', duration: 3000 }
      );
    }

    // Verify QR code matches ONLY the selected destination (strict validation)
    const expectedQRCode = targetDestination.qrCode;
    
    console.log('Comparing QR codes:', { expected: expectedQRCode?.trim(), scanned: qrCode?.trim() });
    
    // Case-insensitive comparison - MUST match the selected destination
    if (qrCode.trim().toLowerCase() === expectedQRCode.trim().toLowerCase()) {
      // QR code verified, now show review form
      setScannedQRCode(qrCode);
      setCheckInDestination(targetDestination);
      setShowScanModal(false);
      setShowQRModal(false);
      setShowReviewModal(true);
      toast.success(`✅ QR Code verified for ${targetDestination.name}! Please leave a review.`, {
        duration: 4000,
        style: {
          background: '#10b981',
          color: '#fff',
          fontWeight: '600',
        }
      });
      console.log('QR Code verified successfully!');
    } else {
      console.error('QR Code mismatch!', { expected: expectedQRCode, got: qrCode });
      toast.error(
        <div className="space-y-2">
          <p className="font-bold">❌ Invalid QR Code</p>
          <p className="text-sm">This QR code does not match <strong>{targetDestination.name}</strong></p>
          <div className="text-xs mt-2 bg-red-100 p-2 rounded">
            <p>Expected: <span className="font-mono font-bold">{expectedQRCode}</span></p>
            <p>Scanned: <span className="font-mono font-bold">{qrCode}</span></p>
          </div>
          <p className="text-xs mt-2">💡 Make sure you're scanning the QR code at <strong>{targetDestination.name}</strong></p>
        </div>,
        {
          duration: 7000,
          style: {
            maxWidth: '400px'
          }
        }
      );
      setShowScanModal(false);
    }
  }, [destinations, nearbyDestinations, selectedDestination, arrivedDestination]);

  const handleReviewSubmit = useCallback(async (reviewData) => {
    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        toast.error('Please log in to check in');
        navigate('/login');
        return;
      }

      console.log('Submitting check-in review:', {
        destination_id: reviewData.destinationId,
        qr_code: reviewData.qrCode,
        rating: reviewData.rating,
        hasToken: !!token
      });

      // Get CSRF cookie first (for Sanctum)
      const BASE_URL = API_BASE_URL.replace('/api', '');
      try {
        await axios.get(`${BASE_URL}/sanctum/csrf-cookie`, {
          withCredentials: true
        });
      } catch (csrfError) {
        console.warn('CSRF cookie fetch failed, continuing...', csrfError);
      }

      // Submit check-in with review (requires authentication)
      const response = await axios.post(`${API_BASE_URL}/checkins`, {
        destination_id: reviewData.destinationId,
        qr_code: reviewData.qrCode,
        rating: reviewData.rating,
        review_text: reviewData.review
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });

      console.log('Check-in response:', response.data);

      if (response.data.success) {
        const pointsEarned = response.data.data.points || checkInDestination.points;
        const totalPoints = response.data.data.total_points;
        
        toast.success(
          <div className="space-y-1">
            <p className="font-bold text-lg">✅ Check-in Successful!</p>
            <p className="text-sm">+{pointsEarned} points earned</p>
            <p className="text-xs opacity-90">Total Points: {totalPoints}</p>
          </div>,
          { 
            duration: 6000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px'
            }
          }
        );

        // Reset states
        setShowReviewModal(false);
        setCheckInDestination(null);
        setScannedQRCode(null);
        setArrivedDestination(null);
        setSelectedDestination(null);

        // Refresh user data to update points
        if (user) {
          // You might want to refresh user data here
        }
      } else {
        toast.error(response.data.message || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      console.error('Error details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data,
        url: error.config?.url
      });
      
      if (error.response?.status === 404) {
        toast.error(
          <div>
            <p className="font-bold">API Route Not Found</p>
            <p className="text-sm mt-1">The check-in endpoint is not accessible.</p>
            <p className="text-xs mt-1">URL: {error.config?.url}</p>
            <p className="text-xs">Please ensure the Laravel server is running.</p>
          </div>,
          { duration: 6000 }
        );
      } else if (error.response?.status === 401) {
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else if (error.response?.status === 422 || error.response?.status === 400) {
        // Validation error or already checked in
        const message = error.response?.data?.message || error.response?.data?.error;
        toast.error(
          <div className="space-y-2">
            <p className="font-bold">❌ Check-in Failed</p>
            <p className="text-sm">{message}</p>
            {message.includes('already checked in') && (
              <p className="text-xs mt-2">💡 You can check in once per day per destination. Come back tomorrow!</p>
            )}
          </div>,
          { 
            duration: 6000,
            style: { maxWidth: '400px' }
          }
        );
      } else if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to submit check-in. Please try again.');
      }
    }
  }, [user, API_BASE_URL, navigate]);

  const handleLogout = useCallback(() => {
    if (logout) logout();
    navigate('/');
  }, [logout, navigate]);

  // ✅ PERFORMANCE: Memoize sidebar collapse handler
  const handleSidebarCollapse = useCallback((collapsed) => {
    setSidebarCollapsed(collapsed);
  }, []);

  const displayedDestinations = useMemo(() => {
    let destinations = [];
    if (locationViewMode === 'all') destinations = nearbyDestinations;
    else if (locationViewMode === 'nearby') destinations = nearbyDestinations.filter(dest => dest.distance && dest.distance <= 50);
    else if (locationViewMode === 'saved') destinations = savedLocations;
    else destinations = nearbyDestinations;

    // Apply category filter
    if (selectedCategory && selectedCategory !== 'all') {
      destinations = destinations.filter(dest => 
        dest.categoryName === selectedCategory || 
        dest.category === selectedCategory ||
        dest.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
        dest.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      destinations = destinations.filter(dest => 
        dest.name?.toLowerCase().includes(query) ||
        dest.category?.toLowerCase().includes(query) ||
        dest.categoryName?.toLowerCase().includes(query) ||
        dest.description?.toLowerCase().includes(query) ||
        dest.address?.toLowerCase().includes(query)
      );
    }

    return destinations;
  }, [locationViewMode, nearbyDestinations, savedLocations, searchQuery, selectedCategory]);

  // Map shows the same filtered destinations as the list
  const filteredDestinations = displayedDestinations;

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'hotel': return '🏨';
      case 'agri farm': return '🌾';
      case 'tourist spot': return '⛰️';
      default: return '📍';
    }
  };

  const getCategoryColor = (category) => {
    const lowerCategory = category?.toLowerCase() || '';
    switch (lowerCategory) {
      case 'hotel':
        return 'bg-blue-500';
      case 'agri farm':
        return 'bg-teal-500';
      case 'tourist spot':
        return 'bg-purple-500';
      default:
        return 'bg-cyan-500';
    }
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        {/* Dot Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      </div>

      <ToastNotification />
      
      {/* Main Content Container - Will be blurred when modal is open */}
      <div className={`transition-all duration-300 ${(showReviewModal || showScanModal || showQRModal || selectedDestination) ? 'blur-sm' : ''}`}>
        
        <UserDashboardTabs 
          onCollapseChange={handleSidebarCollapse}
          onScannerClick={() => setShowScanModal(true)}
        />

      {/* Main Content */}
      <div className={`transition-all duration-300 pb-16 md:pb-0 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Page Header */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg mt-14 md:mt-16 lg:mt-0 md:sticky md:top-16 lg:sticky lg:top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <svg className="w-7 h-7 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Explore Map</h1>
                <p className="text-sm text-teal-50 mt-1">Discover destinations and navigate your adventure</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6">

            {/* Navigation Tracker */}
        {isNavigating && navigationDestination && (
          <motion.div 
            className="bg-gradient-to-r from-teal-500 to-blue-500 rounded-2xl p-6 border border-teal-600 mb-6 shadow-xl relative z-50 pointer-events-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100 }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-white gap-4">
              <div className="flex items-start gap-4 flex-1">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-8 h-8 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">🧭 Navigating to</p>
                  <h3 className="text-2xl font-bold mb-2">{navigationDestination.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <p className="text-white/90 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {distanceToDestination !== null ? `${distanceToDestination.toFixed(2)} km away` : 'Calculating...'}
                    </p>
                    {estimatedTime !== null && (
                      <p className="text-white/90 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        ~{Math.ceil(estimatedTime)} min
                      </p>
                    )}
                    <p className="text-white/90 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      +{navigationDestination.points} pts
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleStopNavigation}
                className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-xl font-semibold transition-all border-2 border-white/50 flex items-center gap-2 pointer-events-auto relative z-10"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Stop
              </button>
            </div>
            {distanceToDestination !== null && distanceToDestination < 0.5 && (
              <motion.div 
                className="mt-4 bg-white/20 rounded-lg p-4 border border-white/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-white text-sm font-semibold flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  🎉 Almost there! Get ready to scan the QR code when you arrive.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Explore Section */}
        <motion.div 
          className="bg-white rounded-2xl p-6 border border-teal-200 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h3 className="text-xl font-bold text-slate-900 mb-2">Explore & Navigate</h3>
          <p className="text-slate-600 mb-6">Discover nearby destinations, save favorites, and navigate to new adventures</p>

          {/* View Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setMapViewMode('map')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mapViewMode === 'map'
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
              onClick={() => setMapViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                mapViewMode === 'list'
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
            <div className="bg-white rounded-2xl p-6 border border-teal-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-bold text-slate-900">Interactive Map View</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">Zoom: 14x | Tap locations for details & souvenirs</p>

              {/* Map Container with proper height */}
              <div className="h-[700px] bg-blue-50 rounded-lg relative overflow-hidden border border-teal-200 shadow-sm" style={{ zIndex: 0 }}>
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                      <p className="text-slate-600">Loading destinations...</p>
                      <p className="text-xs text-slate-500 mt-2">Fetching from server</p>
                    </div>
                  </div>
                ) : !userLocation ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                    <div className="text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mb-4"></div>
                      <p className="text-slate-600">Loading map...</p>
                      <p className="text-xs text-slate-500 mt-2">Please allow location access</p>
                    </div>
                  </div>
                ) : (
                  <MapView 
                    destinations={filteredDestinations}
                    onDestinationClick={setSelectedDestination}
                    selectedDestination={selectedDestination}
                    navigationRoute={navigationRoute}
                    isNavigating={isNavigating}
                    navigationDestination={navigationDestination}
                  />
                )}
                
                {/* Location Count Overlay */}
                {userLocation && !isNavigating && (
                  <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 border border-slate-200">
                    <p className="text-sm font-medium text-slate-900">{filteredDestinations.length} locations visible</p>
                    <p className="text-xs text-slate-600">Click on markers to see details & navigate</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            className="space-y-4"
            variants={slideInFromRight}
          >
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 shadow-sm p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Map Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Locations</span>
                  <span className="text-lg font-bold text-teal-600">{nearbyDestinations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Nearby (50km)</span>
                  <span className="text-lg font-bold text-blue-600">{nearbyDestinations.filter(d => d.distance && d.distance <= 50).length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Saved</span>
                  <span className="text-lg font-bold text-purple-600">{savedLocations.length}</span>
                </div>
              </div>
            </div>

            {/* View Mode Tabs & Location List */}
            <div className="bg-white rounded-xl border border-teal-200 shadow-sm p-4 relative z-10">
              {/* Search Bar */}
              <div className="mb-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 text-sm border border-teal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {/* Category Filter - Custom Dropdown */}
              <div className="mb-4 relative z-50 pointer-events-auto">
                <div
                  onClick={() => {
                    const dropdown = document.getElementById('category-dropdown-user');
                    if (dropdown) {
                      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="category-filter-button w-full px-4 py-2 text-sm border border-teal-200 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-teal-400 transition-colors"
                  style={{ pointerEvents: 'auto' }}
                >
                  <div className="flex items-center gap-2">
                    {selectedCategory === 'all' ? (
                      <span>All Categories</span>
                    ) : (
                      <>
                        {(() => {
                          const cat = categories.find(c => c.name === selectedCategory);
                          if (!cat) return <span>All Categories</span>;
                          const isImg = isImagePath(cat.icon);
                          return (
                            <>
                              {isImg ? (
                                <img src={getIconUrl(cat.icon)} alt={cat.name} className="w-5 h-5 rounded object-cover" />
                              ) : (
                                <span>{cat.icon}</span>
                              )}
                              <span>{cat.name}</span>
                            </>
                          );
                        })()}
                      </>
                    )}
                  </div>
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                
                {/* Dropdown Menu */}
                <div
                  id="category-dropdown-user"
                  style={{ display: 'none' }}
                  className="absolute w-full mt-1 bg-white border border-teal-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => {
                      setSelectedCategory('all');
                      document.getElementById('category-dropdown-user').style.display = 'none';
                    }}
                    className={`px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors text-sm ${selectedCategory === 'all' ? 'bg-teal-100' : ''}`}
                  >
                    All Categories
                  </div>
                  {categories.map((cat) => {
                    const isImg = isImagePath(cat.icon);
                    return (
                      <div
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.name);
                          document.getElementById('category-dropdown-user').style.display = 'none';
                        }}
                        className={`px-4 py-2 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-2 text-sm ${selectedCategory === cat.name ? 'bg-teal-100' : ''}`}
                      >
                        {isImg ? (
                          <img src={getIconUrl(cat.icon)} alt={cat.name} className="w-5 h-5 rounded object-cover flex-shrink-0" />
                        ) : (
                          <span className="flex-shrink-0">{cat.icon}</span>
                        )}
                        <span>{cat.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setLocationViewMode('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    locationViewMode === 'all'
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm'
                  }`}
                >
                  All ({nearbyDestinations.length})
                </button>
                <button
                  onClick={() => setLocationViewMode('nearby')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    locationViewMode === 'nearby'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm'
                  }`}
                >
                  📍 Nearby ({nearbyDestinations.filter(d => d.distance && d.distance <= 50).length})
                </button>
                <button
                  onClick={() => setLocationViewMode('saved')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    locationViewMode === 'saved'
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:shadow-sm'
                  }`}
                >
                  ❤️ Saved ({savedLocations.length})
                </button>
              </div>

              {/* Locations List */}
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">
                {locationViewMode === 'all' ? 'All Locations' : locationViewMode === 'nearby' ? 'Nearby Locations' : 'Saved Locations'}
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {displayedDestinations.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <div className="text-4xl mb-2">
                      {locationViewMode === 'nearby' ? '📍' : locationViewMode === 'saved' ? '❤️' : '🗺️'}
                    </div>
                    <p className="text-sm">
                      {locationViewMode === 'nearby' 
                        ? 'No destinations nearby. Move around to discover more!' 
                        : locationViewMode === 'saved' 
                        ? 'No saved destinations yet. Click ❤️ to save!' 
                        : 'No destinations found'}
                    </p>
                  </div>
                ) : (
                  displayedDestinations.map((dest) => (
                    <div
                      key={dest.id}
                      onClick={() => setSelectedDestination(dest)}
                      className="p-4 border border-teal-200 rounded-lg hover:bg-teal-50 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group bg-white shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 ${getCategoryColor(dest.category)} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          {getCategoryIcon(dest.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-slate-900 text-sm truncate group-hover:text-teal-600 transition-colors">{dest.name}</h4>
                            <button
                              onClick={(e) => toggleSaveDestination(dest.id, e)}
                              className="ml-2 p-1 rounded-lg transition-colors flex-shrink-0"
                            >
                              <svg
                                className={`w-4 h-4 transition-colors ${
                                  savedDestinationIds.has(dest.id)
                                    ? 'fill-red-500 text-red-500'
                                    : 'fill-none text-slate-400 hover:text-red-500'
                                }`}
                                stroke="currentColor"
                                strokeWidth={2}
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                            <span>{getCategoryIcon(dest.category)}</span>
                            <span>{dest.categoryName || dest.category}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs">
                            <span className="text-teal-600 font-semibold">🪙 {dest.points} pts</span>
                            {dest.distance && (
                              <span className="text-blue-600 font-semibold">📍 {dest.distance.toFixed(1)} km</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
        </main>
      </div>
      </div>
      {/* End of blurred content container */}

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
            <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto">
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

      {/* Selected Destination Details Modal */}
      {selectedDestination && (
        <DestinationDetail
          destination={selectedDestination}
          userLocation={userLocation}
          onClose={() => setSelectedDestination(null)}
          onCheckIn={() => !isNavigating && setShowScanModal(true)}
          onNavigate={(dest) => !isNavigating && handleStartNavigation(dest)}
          isNavigating={isNavigating}
          isSaved={savedDestinationIds.has(selectedDestination.id)}
          onToggleSave={(id) => toggleSaveDestination(id)}
        />
      )}

      {/* Check-in Review Modal */}
      {showReviewModal && checkInDestination && (
        <Modal
          isOpen={showReviewModal}
          onClose={() => {
            setShowReviewModal(false);
            setCheckInDestination(null);
            setScannedQRCode(null);
          }}
          title="Check-in & Review"
          titleIcon="✍️"
          size="md"
        >
          <CheckInReview
            destination={checkInDestination}
            scannedQRCode={scannedQRCode}
            onSubmit={handleReviewSubmit}
            onCancel={() => {
              setShowReviewModal(false);
              setCheckInDestination(null);
              setScannedQRCode(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
});

MapExplorer.displayName = 'MapExplorer';

export default MapExplorer;
