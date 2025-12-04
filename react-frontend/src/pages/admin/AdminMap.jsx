import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import QRGenerator from '../../components/qr/QRGenerator';
import { getCurrentAdmin } from '../../utils/adminHelper';
import ToastNotification from '../../components/common/ToastNotification';
import toast from 'react-hot-toast';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks for pinpointing
function LocationMarker({ onLocationSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position}>
      <Popup>New location pinned here!</Popup>
    </Marker>
  );
}

const AdminMap = React.memo(() => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const [isPinMode, setIsPinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [adminLocation, setAdminLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  
  // Modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    fullDescription: '',
    address: '',
    barangay: '',
    city: '',
    province: '',
    region: '',
    postalCode: '',
    latitude: '',
    longitude: '',
    pointsReward: 50,
    contactNumber: '',
    email: '',
    website: '',
    status: 'active',
    featured: false,
    qrCode: '',
    qrCodeImageUrl: '',
  });

  // Images state
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  // Amenities state
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [customAmenity, setCustomAmenity] = useState({ icon: '', name: '' });
  const availableAmenities = [
    { id: 1, name: 'Free WiFi', icon: '📶' },
    { id: 2, name: 'Parking', icon: '🅿️' },
    { id: 3, name: 'Swimming Pool', icon: '🏊' },
    { id: 4, name: 'Restaurant', icon: '🍽️' },
    { id: 5, name: 'Fitness Center', icon: '🏋️' },
    { id: 6, name: 'Spa Services', icon: '💆' },
    { id: 7, name: 'Air Conditioning', icon: '❄️' },
    { id: 8, name: 'Pet Friendly', icon: '🐕' },
    { id: 9, name: 'Bar/Lounge', icon: '🍸' },
    { id: 10, name: 'Free Breakfast', icon: '🥐' },
    { id: 11, name: '24/7 Service', icon: '🕐' },
    { id: 12, name: 'Room Service', icon: '🛎️' },
  ];

  // Operating hours state
  const [operatingHours, setOperatingHours] = useState([
    { day: 'Monday', opens: '09:00', closes: '18:00', isClosed: false },
    { day: 'Tuesday', opens: '09:00', closes: '18:00', isClosed: false },
    { day: 'Wednesday', opens: '09:00', closes: '18:00', isClosed: false },
    { day: 'Thursday', opens: '09:00', closes: '18:00', isClosed: false },
    { day: 'Friday', opens: '09:00', closes: '18:00', isClosed: false },
    { day: 'Saturday', opens: '10:00', closes: '16:00', isClosed: false },
    { day: 'Sunday', opens: '10:00', closes: '16:00', isClosed: false },
  ]);

  // Active section for add/edit modal
  const [activeSection, setActiveSection] = useState('basic');

  // Sections definition (matches Destinations order)
  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'images', label: 'Images', icon: '📷' },
    { id: 'amenities', label: 'Amenities', icon: '✨' },
    { id: 'hours', label: 'Hours', icon: '🕐' },
    { id: 'qrcode', label: 'QR Code', icon: '📱' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  // Auto-detect API URL for mobile access
  const getApiUrl = () => {
    const hostname = window.location.hostname;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:8000/api';
    }
    // For mobile access via local IP
    return `http://${hostname}:8000/api`;
  };
  
  const API_BASE_URL = getApiUrl();

  useEffect(() => {
    // Instant cache load
    const cachedDest = localStorage.getItem('cached_map_destinations');
    const cachedCat = localStorage.getItem('cached_map_categories');
    
    let shouldFetchDest = true;
    let shouldFetchCat = true;
    
    if (cachedDest) {
      try {
        const parsed = JSON.parse(cachedDest);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (parsed.data) {
          setDestinations(parsed.data);
          if (cacheAge < 60000) shouldFetchDest = false;
        }
      } catch (e) {}
    }
    
    if (cachedCat) {
      try {
        const parsed = JSON.parse(cachedCat);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (parsed.data) {
          setCategories(parsed.data);
          if (cacheAge < 60000) shouldFetchCat = false;
        }
      } catch (e) {}
    }
    
    if (shouldFetchDest) fetchDestinations();
    if (shouldFetchCat) fetchCategories();
    
    // Track admin's location
    if ('geolocation' in navigator) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          setAdminLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          console.error('Error watching location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        }
      );
      setWatchId(id);
      
      return () => {
        if (id) navigator.geolocation.clearWatch(id);
      };
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`);
      const data = response.data.data || [];
      setCategories(data);
      localStorage.setItem('cached_map_categories', JSON.stringify({
        data: data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/destinations`);
      const data = response.data.data || [];
      
      const transformedDestinations = data.map(dest => ({
        id: dest.id,
        name: dest.name,
        category: dest.category?.name?.toLowerCase() || 'hotel',
        categoryId: dest.category?.id || '',
        categoryIcon: dest.category?.icon || '📍',
        categoryName: dest.category?.name || 'Uncategorized',
        address: `${dest.address?.street || ''} ${dest.address?.barangay || ''}, ${dest.address?.city || ''}, ${dest.address?.province || ''}`.trim(),
        latitude: dest.coordinates?.latitude || 0,
        longitude: dest.coordinates?.longitude || 0,
        qrCode: dest.qr_code || `${dest.category?.name?.toUpperCase()}-${dest.name?.substring(0, 3).toUpperCase()}-${String(dest.id).padStart(3, '0')}`,
        visits: dest.stats?.total_visits || 0,
        reviews: dest.stats?.total_reviews || 0,
        points: dest.points_reward || 50,
        description: dest.description || '',
      }));
      
      setDestinations(transformedDestinations);
      localStorage.setItem('cached_map_destinations', JSON.stringify({
        data: transformedDestinations,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.error('Error fetching destinations:', error);
    }
  };

  const handleMapClick = async (latlng) => {
    if (!isPinMode) return;
    
    const latitude = latlng.lat.toFixed(6);
    const longitude = latlng.lng.toFixed(6);
    
    // Reset form with coordinates first
    setFormData({
      name: '',
      category: '',
      description: '',
      fullDescription: '',
      address: '',
      purok: '',
      barangay: '',
      city: '',
      province: '',
      region: '',
      postalCode: '',
      latitude: latitude,
      longitude: longitude,
      pointsReward: 50,
      contactNumber: '',
      email: '',
      website: '',
      status: 'active',
      featured: false,
      qrCode: '',
      qrCodeImageUrl: '',
    });
    
    setImages([]);
    setSelectedAmenities([]);
    setActiveSection('location');
    setModalState({ isOpen: true, mode: 'add', data: null });
    setIsPinMode(false);
    
    // Fetch complete address from OpenStreetMap
    const toastId = toast.loading('📍 Getting address from map location...');
    
    try {
      // Source 1: Try zoom 18 first (most detailed for street-level)
      let osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
        { headers: { 'User-Agent': 'TravelQuest/1.0' } }
      );
      let osmData = await osmResponse.json();
      
      // Source 2: If no village found, try zoom 14 (better for rural/barangay areas)
      if (osmData && osmData.address && !osmData.address.village) {
        osmResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=14`,
          { headers: { 'User-Agent': 'TravelQuest/1.0' } }
        );
        const osmData14 = await osmResponse.json();
        if (osmData14 && osmData14.address) {
          if (osmData14.address.village) osmData.address.village = osmData14.address.village;
          if (osmData14.address.hamlet) osmData.address.hamlet = osmData14.address.hamlet;
          if (osmData14.address.suburb) osmData.address.suburb = osmData14.address.suburb;
        }
      }
      
      if (osmData && osmData.address) {
        const addr = osmData.address;
        
        // Get street address
        const streetParts = [
          addr.house_number,
          addr.road || addr.street || addr.footway || addr.path || addr.pedestrian
        ].filter(Boolean);
        
        let streetAddress = streetParts.join(', ');
        if (!streetAddress) {
          streetAddress = addr.neighbourhood || addr.suburb || addr.hamlet || addr.quarter || '';
        }
        
        // Get barangay
        const barangay = addr.village || 
                        addr.hamlet || 
                        addr.suburb || 
                        addr.neighbourhood || 
                        addr.quarter || 
                        addr.residential || 
                        '';
        
        // Get city/municipality
        const city = addr.municipality || 
                    addr.town || 
                    addr.city || 
                    addr.county ||
                    addr.city_district || 
                    '';
        
        // Get province
        const province = addr.state || addr.province || addr.region || '';
        
        // Determine region
        let region = '';
        const provinceLC = province.toLowerCase();
        if (provinceLC.includes('oriental mindoro') || provinceLC.includes('occidental mindoro') || 
            provinceLC.includes('marinduque') || provinceLC.includes('romblon') || provinceLC.includes('palawan')) {
          region = 'Region IV-B';
        } else if (provinceLC.includes('cavite') || provinceLC.includes('laguna') || 
                   provinceLC.includes('batangas') || provinceLC.includes('rizal') || provinceLC.includes('quezon')) {
          region = 'Region IV-A';
        } else if (provinceLC.includes('manila') || provinceLC.includes('metro')) {
          region = 'NCR';
        } else if (province) {
          region = 'Region IV-B';
        }
        
        // Fetch postal code from backend
        let postalCode = '';
        try {
          const backendResponse = await axios.post(`${API_BASE_URL}/address/from-gps`, {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude)
          });
          if (backendResponse.data.success && backendResponse.data.data) {
            postalCode = backendResponse.data.data.postal_code || '';
          }
        } catch (backendError) {
          console.log('Could not fetch postal code from backend');
        }
        
        // Get purok/sitio
        const purok = addr.quarter || addr.neighbourhood || '';
        
        // Update form with complete address
        setFormData(prev => ({
          ...prev,
          address: streetAddress,
          purok: purok,
          barangay: barangay,
          city: city,
          province: province,
          region: region,
          postalCode: postalCode
        }));
        
        toast.dismiss(toastId);
        
        // Show success message
        const addressParts = [
          streetAddress && `Street: ${streetAddress}`,
          purok && `Purok: ${purok}`,
          barangay && `Brgy: ${barangay}`,
          city && city,
          province && province,
          postalCode && `${postalCode}`
        ].filter(Boolean);
        
        if (addressParts.length > 0) {
          toast.success(
            <div className="text-left">
              <div className="font-bold mb-1">✅ Address Retrieved!</div>
              {addressParts.slice(0, 3).map((part, i) => (
                <div key={i} className="text-xs">{part}</div>
              ))}
            </div>,
            { duration: 5000, style: { maxWidth: '400px' } }
          );
        } else {
          toast.success('✅ Location pinned. Please fill address manually.');
        }
        
        console.log('Map Click - Complete Address:', {
          streetAddress,
          purok,
          barangay,
          city,
          province,
          region,
          postalCode,
          rawOSM: addr
        });
      } else {
        toast.dismiss(toastId);
        toast.warning('⚠️ Could not fetch address. Please fill manually.');
      }
    } catch (error) {
      console.error('Error fetching address from map:', error);
      toast.dismiss(toastId);
      toast.error('❌ Could not fetch address details');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  const handleAddDestination = () => {
    if (!formData.name || !formData.category_id || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in all required fields (name, category, coordinates)');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates');
      return;
    }

    // Get category details
    const selectedCategory = categories.find(cat => cat.id == formData.category_id);
    if (!selectedCategory) {
      toast.error('Invalid category selected');
      return;
    }

    const qrCode = `${selectedCategory.category_name.toUpperCase().replace(/\s+/g, '-')}-${formData.name.substring(0, 3).toUpperCase()}-${String(destinations.length + 1).padStart(3, '0')}`;

    const newDest = {
      id: destinations.length + 1,
      name: formData.name,
      category_id: formData.category_id,
      categoryName: selectedCategory.category_name,
      categoryIcon: selectedCategory.icon,
      latitude: lat,
      longitude: lng,
      points: formData.points || 50,
      qrCode: qrCode,
      visits: 0,
      reviews: 0,
    };

    setDestinations([...destinations, newDest]);
    
    // Save to localStorage for user map
    const savedDestinations = JSON.parse(localStorage.getItem('travelquest_destinations') || '[]');
    savedDestinations.push(newDest);
    localStorage.setItem('travelquest_destinations', JSON.stringify(savedDestinations));
    
    toast.success(`${formData.name} added successfully!`);
    setShowAddModal(false);
    setNewLocation(null);
    setFormData({ name: '', category: 'hotel', description: '', address: '', points: 50, latitude: '', longitude: '' });
  };

  const handleShowQR = (destination) => {
    setSelectedDestination(destination);
    setShowQRModal(true);
  };

  const handleViewDestination = (destination) => {
    setSelectedDestination(destination);
    setShowViewModal(true);
  };

  const handleEditDestination = (destination) => {
    setSelectedDestination(destination);
    setFormData({
      name: destination.name,
      category_id: destination.categoryId || destination.category_id || '',
      description: destination.description || '',
      address: destination.address || '',
      points: destination.points || 50,
      latitude: destination.latitude.toString(),
      longitude: destination.longitude.toString(),
    });
    setShowEditModal(true);
  };

  const handleUpdateDestination = () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in name and coordinates');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates');
      return;
    }

    const updatedDestinations = destinations.map(dest => 
      dest.id === selectedDestination.id
        ? { ...dest, ...formData, latitude: lat, longitude: lng }
        : dest
    );

    setDestinations(updatedDestinations);
    localStorage.setItem('travelquest_destinations', JSON.stringify(updatedDestinations));
    
    toast.success(`${formData.name} updated successfully!`);
    setShowEditModal(false);
    setSelectedDestination(null);
    setFormData({ name: '', category: 'hotel', description: '', address: '', points: 50, latitude: '', longitude: '' });
  };

  const handleDeleteDestination = async (destination) => {
    if (!confirm(`Are you sure you want to delete "${destination.name}"?`)) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/destinations/${destination.id}`);
      
      const updatedDestinations = destinations.filter(dest => dest.id !== destination.id);
      setDestinations(updatedDestinations);
      
      toast.success(`${destination.name} deleted successfully!`);
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast.error('Failed to delete destination');
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'hotel':
        return '🏨';
      case 'agri farm':
        return '🌾';
      case 'tourist spot':
        return '⛰️';
      default:
        return '📍';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'hotel':
        return 'bg-blue-500';
      case 'agri farm':
        return 'bg-green-500';
      case 'tourist spot':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate map center from destinations
  const getMapCenter = () => {
    if (destinations.length === 0) return [12.8797, 121.7740]; // Oriental Mindoro center
    
    const avgLat = destinations.reduce((sum, dest) => sum + dest.latitude, 0) / destinations.length;
    const avgLng = destinations.reduce((sum, dest) => sum + dest.longitude, 0) / destinations.length;
    return [avgLat, avgLng];
  };

  // Helper functions for modal
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file),
      title: file.name
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    if (primaryImageIndex >= images.length - 1) {
      setPrimaryImageIndex(0);
    }
  };

  const handleSetPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => {
      const exists = prev.some(a => 
        (typeof a === 'object' ? a.id : a) === amenity.id
      );
      if (exists) {
        return prev.filter(a => 
          (typeof a === 'object' ? a.id : a) !== amenity.id
        );
      } else {
        return [...prev, amenity];
      }
    });
  };

  const handleAddCustomAmenity = () => {
    if (!customAmenity.name.trim()) return;
    const newAmenity = {
      id: Date.now(),
      name: customAmenity.name,
      icon: customAmenity.icon || '✨'
    };
    setSelectedAmenities(prev => [...prev, newAmenity]);
    setCustomAmenity({ icon: '', name: '' });
  };

  const handleOperatingHoursChange = (index, field, value) => {
    setOperatingHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const generateQRCode = () => {
    const categoryName = categories.find(c => c.id == formData.category)?.label || 'DEST';
    const destName = formData.name.substring(0, 3).toUpperCase() || 'NEW';
    return `${categoryName.toUpperCase().replace(/\s+/g, '-')}-${destName}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
  };

  const generateQRCodeDataURI = (qrValue) => {
    // This would normally generate a data URI, for now return placeholder
    return `data:image/png;base64,QR_${qrValue}`;
  };

  const handleGetCurrentLocation = () => {
    const toastId = toast.loading('Getting your location...');
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setFormData(prev => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
          
          // Triple-source strategy for complete address data
          try {
            // Source 1: Try zoom 18 first (most detailed for street-level)
            let osmResponse = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=18`,
              { headers: { 'User-Agent': 'TravelQuest/1.0' } }
            );
            let osmData = await osmResponse.json();
            
            // Source 2: If no village found in zoom 18, try zoom 14 (better for rural/barangay areas)
            if (osmData && osmData.address && !osmData.address.village) {
              osmResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=14`,
                { headers: { 'User-Agent': 'TravelQuest/1.0' } }
              );
              const osmData14 = await osmResponse.json();
              // Merge data, preferring zoom 14 for barangay in rural areas
              if (osmData14 && osmData14.address) {
                if (osmData14.address.village) osmData.address.village = osmData14.address.village;
                if (osmData14.address.hamlet) osmData.address.hamlet = osmData14.address.hamlet;
                if (osmData14.address.suburb) osmData.address.suburb = osmData14.address.suburb;
              }
            }
            
            if (osmData && osmData.address) {
              const addr = osmData.address;
              
              // Get street address with more detailed options
              const streetParts = [
                addr.house_number,
                addr.road || addr.street || addr.footway || addr.path || addr.pedestrian
              ].filter(Boolean);
              
              // If no street found, try to use more general location identifiers
              let streetAddress = streetParts.join(', ');
              if (!streetAddress) {
                streetAddress = addr.neighbourhood || addr.suburb || addr.hamlet || addr.quarter || '';
              }
              
              // Get barangay - comprehensive fallback
              const barangay = addr.village || 
                              addr.hamlet || 
                              addr.suburb || 
                              addr.neighbourhood || 
                              addr.quarter || 
                              addr.residential || 
                              '';
              
              // Get city/municipality - PRIORITIZE municipality and town first (most accurate for PH)
              const city = addr.municipality || 
                          addr.town || 
                          addr.city || 
                          addr.county ||
                          addr.city_district || 
                          '';
              
              // Get province (state in OSM for Philippines)
              const province = addr.state || addr.province || addr.region || '';
              
              // Determine region based on province
              let region = '';
              const provinceLC = province.toLowerCase();
              if (provinceLC.includes('oriental mindoro') || provinceLC.includes('occidental mindoro') || 
                  provinceLC.includes('marinduque') || provinceLC.includes('romblon') || provinceLC.includes('palawan')) {
                region = 'Region IV-B';
              } else if (provinceLC.includes('cavite') || provinceLC.includes('laguna') || 
                         provinceLC.includes('batangas') || provinceLC.includes('rizal') || provinceLC.includes('quezon')) {
                region = 'Region IV-A';
              } else if (provinceLC.includes('manila') || provinceLC.includes('metro')) {
                region = 'NCR';
              } else if (province) {
                region = 'Region IV-B'; // Default for other areas
              }
              
              // Source 3: Backend API for postal code (OSM doesn't have this)
              let postalCode = '';
              try {
                const backendResponse = await axios.post(`${API_BASE_URL}/address/from-gps`, {
                  latitude,
                  longitude
                });
                if (backendResponse.data.success && backendResponse.data.data) {
                  postalCode = backendResponse.data.data.postal_code || '';
                }
              } catch (backendError) {
                console.log('Could not fetch postal code from backend');
              }
              
              // Get purok/sitio (if available in OSM)
              const purok = addr.quarter || addr.neighbourhood || '';
              
              // Update ALL form fields with complete address
              setFormData(prev => ({
                ...prev,
                address: streetAddress,
                purok: purok,
                barangay: barangay,
                city: city,
                province: province,
                region: region,
                postalCode: postalCode
              }));
              
              toast.dismiss(toastId);
              
              // Build success message showing all retrieved data
              const addressParts = [
                streetAddress && `Street: ${streetAddress}`,
                purok && `Purok: ${purok}`,
                barangay && `Brgy: ${barangay}`,
                city && city,
                province && province,
                postalCode && `${postalCode}`
              ].filter(Boolean);
              
              if (addressParts.length > 0) {
                toast.success(
                  <div className="text-left">
                    <div className="font-bold mb-1">✅ Address Retrieved!</div>
                    {addressParts.slice(0, 3).map((part, i) => (
                      <div key={i} className="text-xs">{part}</div>
                    ))}
                  </div>,
                  { duration: 5000, style: { maxWidth: '400px' } }
                );
              } else {
                toast.success('✅ GPS coordinates set. Please fill address manually.');
              }
              
              // Log complete address data for debugging
              console.log('Complete Address Retrieved:', {
                streetAddress,
                purok,
                barangay,
                city,
                province,
                region,
                postalCode,
                rawOSM: addr
              });
            }
          } catch (error) {
            console.error('Could not fetch address:', error);
            toast.dismiss(toastId);
            toast.error('Could not fetch address details');
          }
        },
        (error) => {
          toast.dismiss(toastId);
          toast.error('Could not get your location');
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0
        }
      );
    } else {
      toast.dismiss(toastId);
      toast.error('Geolocation not supported');
    }
  };

  const handleSave = async () => {
    if (saving) return; // Prevent multiple clicks
    
    try {
      // Validate required fields based on current section
      if (activeSection === 'basic') {
        if (!formData.name?.trim()) {
          toast.error('Destination name is required');
          return;
        }
        if (!formData.category) {
          toast.error('Category is required');
          return;
        }
      }

      if (activeSection === 'location') {
        if (!formData.city?.trim()) {
          toast.error('City is required');
          return;
        }
        if (!formData.province?.trim()) {
          toast.error('Province is required');
          return;
        }
        if (!formData.region?.trim()) {
          toast.error('Region is required');
          return;
        }
        if (!formData.latitude || !formData.longitude) {
          toast.error('GPS coordinates are required');
          return;
        }
      }

      // Check if we need to move to next section or submit
      const currentSectionIndex = sections.findIndex(s => s.id === activeSection);
      const isLastSection = currentSectionIndex === sections.length - 1;

      if (!isLastSection) {
        // Move to next section
        setActiveSection(sections[currentSectionIndex + 1].id);
        return;
      }

      // Final validation before submit
      if (!formData.name || !formData.category || !formData.city || !formData.province || !formData.region || !formData.latitude || !formData.longitude) {
        toast.error('Please fill in all required fields in Basic Info and Location sections');
        setActiveSection('basic');
        return;
      }

      setSaving(true);

      // Prepare data for API
      const destinationData = {
        name: formData.name,
        category_id: formData.category,
        description: formData.description || null,
        street_address: formData.address || null,
        barangay: formData.barangay || null,
        city: formData.city,
        province: formData.province,
        region: formData.region,
        postal_code: formData.postalCode || null,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        contact_number: formData.contactNumber || null,
        email: formData.email || null,
        website: formData.website || null,
        qr_code: formData.qrCode || null,
        qr_code_image_url: formData.qrCodeImageUrl || null,
        amenities: selectedAmenities.map(a => ({
          name: typeof a === 'object' ? a.name : a,
          icon: typeof a === 'object' ? a.icon : '✨'
        })),
        operating_hours: operatingHours.map(oh => ({
          day: oh.day,
          opens: oh.opens,
          closes: oh.closes,
          is_closed: oh.isClosed
        })),
        points_reward: parseInt(formData.pointsReward) || 50,
        status: formData.status || 'active',
      };

      console.log('Sending data to API:', destinationData);

      const response = await axios.post(`${API_BASE_URL}/destinations`, destinationData);
      const newDestination = response.data.data;
      const newDestinationId = newDestination.id;
      
      // Upload images if any
      const uploadedImages = [];
      if (images.length > 0) {
        for (const [index, image] of images.entries()) {
          if (image.file) {
            const imageFormData = new FormData();
            imageFormData.append('image', image.file);
            imageFormData.append('destination_id', newDestinationId);
            imageFormData.append('title', image.caption || image.file.name);
            imageFormData.append('is_primary', index === primaryImageIndex ? '1' : '0');
            
            try {
              const imgResponse = await axios.post(`${API_BASE_URL}/destination-images`, imageFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
              });
              uploadedImages.push(imgResponse.data.data);
            } catch (imgError) {
              console.error('Error uploading image:', imgError);
              toast.error(`Failed to upload ${image.caption}`);
            }
          }
        }
      }
      
      // Close modal
      setModalState({ isOpen: false, mode: '', data: null });
      setActiveSection('basic');
      
      toast.success('Destination added successfully!');
      
      // Refresh destinations list
      await fetchDestinations();
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        description: '',
        fullDescription: '',
        address: '',
        barangay: '',
        city: '',
        province: '',
        region: '',
        postalCode: '',
        latitude: '',
        longitude: '',
        pointsReward: 50,
        contactNumber: '',
        email: '',
        website: '',
        status: 'active',
        featured: false,
        qrCode: '',
        qrCodeImageUrl: '',
      });
      setImages([]);
      setSelectedAmenities([]);
    } catch (error) {
      console.error('Error saving destination:', error);
      console.error('Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save destination';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Render modal content based on mode
  const renderModalContent = () => {
    const { mode } = modalState;

    if (mode === 'add') {
      return (
        <div className="space-y-4">
          {/* Section Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                  activeSection === section.id
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{section.icon}</span>
                <span className="text-sm">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">
                  Destination Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter destination name"
                  className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
                  >
                    <option value="">Select category</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="py-2 text-sm">
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Points Reward</label>
                  <input
                    type="number"
                    name="pointsReward"
                    value={formData.pointsReward}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">Short Description</label>
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
                <label className="block text-sm font-normal text-slate-700 mb-2">Full Description</label>
                <textarea
                  name="fullDescription"
                  value={formData.fullDescription}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Detailed description"
                  className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-teal-500 rounded focus:ring-2 focus:ring-teal-500"
                  />
                  <span className="text-sm font-normal text-slate-700">Featured</span>
                </label>
              </div>
            </div>
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Purok 3"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Barangay</label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Ipil"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bongabong"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Province <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Oriental Mindoro"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Region IV-B"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-normal text-slate-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="5211"
                    className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="bg-slate-50 rounded-lg p-4 border-2 border-slate-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-slate-900">GPS Coordinates</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        const toastId = toast.loading('Setting Bongabong location...');
                        try {
                          // Source 1: Try zoom 18 first (most detailed for street-level)
                          let osmResponse = await fetch(
                            'https://nominatim.openstreetmap.org/reverse?format=json&lat=12.742554&lon=121.489959&addressdetails=1&zoom=18',
                            { headers: { 'User-Agent': 'TravelQuest/1.0' } }
                          );
                          let osmData = await osmResponse.json();
                          
                          // Source 2: If no village found, try zoom 14 (better for rural areas)
                          if (osmData && osmData.address && !osmData.address.village) {
                            osmResponse = await fetch(
                              'https://nominatim.openstreetmap.org/reverse?format=json&lat=12.742554&lon=121.489959&addressdetails=1&zoom=14',
                              { headers: { 'User-Agent': 'TravelQuest/1.0' } }
                            );
                            const osmData14 = await osmResponse.json();
                            if (osmData14 && osmData14.address) {
                              if (osmData14.address.village) osmData.address.village = osmData14.address.village;
                              if (osmData14.address.hamlet) osmData.address.hamlet = osmData14.address.hamlet;
                              if (osmData14.address.suburb) osmData.address.suburb = osmData14.address.suburb;
                            }
                          }
                          
                          let streetAddress = '';
                          let barangay = 'Ipil';
                          let city = 'Bongabong';
                          let province = 'Oriental Mindoro';
                          
                          if (osmData && osmData.address) {
                            const addr = osmData.address;
                            
                            // Get street address with comprehensive fallbacks
                            const streetParts = [
                              addr.house_number,
                              addr.road || addr.street || addr.footway || addr.path || addr.pedestrian || addr.neighbourhood || addr.suburb || addr.hamlet
                            ].filter(Boolean);
                            streetAddress = streetParts.join(', ') || 'Purok 3';
                            
                            // Get barangay with comprehensive fallbacks
                            barangay = addr.village || 
                                      addr.hamlet || 
                                      addr.suburb || 
                                      addr.neighbourhood || 
                                      addr.quarter || 
                                      addr.residential || 
                                      'Ipil';
                            
                            // Get city with comprehensive fallbacks
                            city = addr.municipality || 
                                  addr.town || 
                                  addr.city || 
                                  addr.city_district ||
                                  addr.county || 
                                  'Bongabong';
                            
                            // Get province
                            province = addr.state || addr.province || addr.region || 'Oriental Mindoro';
                          } else {
                            streetAddress = 'Purok 3';
                          }
                          
                          // Source 3: Backend API - ONLY for postal code
                          let postalCode = '';
                          try {
                            const response = await axios.post(`${API_BASE_URL}/address/from-gps`, {
                              latitude: 12.742554,
                              longitude: 121.489959
                            });
                            if (response.data.success && response.data.data) {
                              postalCode = response.data.data.postal_code || '';
                            }
                          } catch (backendError) {
                            console.log('Could not fetch postal code from backend');
                          }
                          
                          // Use OSM data with fallback to known Bongabong defaults
                          const finalBarangay = barangay || 'Ipil';
                          const finalCity = city || 'Bongabong';
                          
                          setFormData(prev => ({
                            ...prev,
                            address: streetAddress,
                            latitude: '12.742554',
                            longitude: '121.489959',
                            barangay: finalBarangay,
                            city: finalCity,
                            province: province,
                            region: 'Region IV-B',
                            postalCode: postalCode
                          }));
                          
                          toast.dismiss(toastId);
                          toast.success(`✅ ${finalBarangay}, ${finalCity}, ${province}`);
                        } catch (error) {
                          console.error('Could not set location:', error);
                          toast.dismiss(toastId);
                          toast.error('Could not set location');
                        }
                      }}
                      className="text-sm px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      📍 I'm in Oriental Mindoro
                    </button>
                    <button
                      onClick={handleGetCurrentLocation}
                      className="text-sm px-3 py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      📍 Use My GPS
                    </button>
                    <button
                      onClick={async () => {
                        if (formData.latitude && formData.longitude) {
                          const toastId = toast.loading('Looking up address...');
                          try {
                            // Source 1: Try zoom 18 first (most detailed for street-level)
                            let osmResponse = await fetch(
                              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.latitude}&lon=${formData.longitude}&addressdetails=1&zoom=18`,
                              { headers: { 'User-Agent': 'TravelQuest/1.0' } }
                            );
                            let osmData = await osmResponse.json();
                            
                            // Source 2: If no village found, try zoom 14 (better for rural/barangay areas)
                            if (osmData && osmData.address && !osmData.address.village) {
                              osmResponse = await fetch(
                                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${formData.latitude}&lon=${formData.longitude}&addressdetails=1&zoom=14`,
                                { headers: { 'User-Agent': 'TravelQuest/1.0' } }
                              );
                              const osmData14 = await osmResponse.json();
                              if (osmData14 && osmData14.address) {
                                if (osmData14.address.village) osmData.address.village = osmData14.address.village;
                                if (osmData14.address.hamlet) osmData.address.hamlet = osmData14.address.hamlet;
                                if (osmData14.address.suburb) osmData.address.suburb = osmData14.address.suburb;
                              }
                            }
                            
                            if (osmData && osmData.address) {
                              const addr = osmData.address;
                              
                              // Get street address with comprehensive fallbacks
                              const streetParts = [
                                addr.house_number,
                                addr.road || addr.street || addr.footway || addr.path || addr.pedestrian || addr.neighbourhood || addr.suburb || addr.hamlet
                              ].filter(Boolean);
                              const streetAddress = streetParts.join(', ') || '';
                              
                              // Get barangay - comprehensive fallback
                              const barangay = addr.village || 
                                              addr.hamlet || 
                                              addr.suburb || 
                                              addr.neighbourhood || 
                                              addr.quarter || 
                                              addr.residential || 
                                              '';
                              
                              // Get city/municipality - comprehensive fallback
                              const city = addr.municipality || 
                                          addr.town || 
                                          addr.city || 
                                          addr.city_district ||
                                          addr.county || 
                                          '';
                              
                              // Get province
                              const province = addr.state || addr.province || addr.region || '';
                              
                              // Determine region based on province
                              let region = '';
                              const provinceLC = province.toLowerCase();
                              if (provinceLC.includes('oriental mindoro') || provinceLC.includes('occidental mindoro') || 
                                  provinceLC.includes('marinduque') || provinceLC.includes('romblon') || provinceLC.includes('palawan')) {
                                region = 'Region IV-B';
                              } else if (provinceLC.includes('cavite') || provinceLC.includes('laguna') || 
                                         provinceLC.includes('batangas') || provinceLC.includes('rizal') || provinceLC.includes('quezon')) {
                                region = 'Region IV-A';
                              } else {
                                region = 'Region IV-B'; // Default
                              }
                              
                              // Source 3: Backend API - ONLY for postal code (OSM doesn't have this)
                              // Don't use backend for location names, OSM is more accurate for GPS coordinates
                              let postalCode = '';
                              try {
                                const backendResponse = await axios.post(`${API_BASE_URL}/address/from-gps`, {
                                  latitude: parseFloat(formData.latitude),
                                  longitude: parseFloat(formData.longitude)
                                });
                                if (backendResponse.data.success && backendResponse.data.data) {
                                  postalCode = backendResponse.data.data.postal_code || '';
                                }
                              } catch (backendError) {
                                console.log('Could not fetch postal code from backend');
                              }
                              
                              // Use OSM data ONLY (most accurate for GPS coordinates)
                              // Backend can be inaccurate with municipality boundaries
                              const finalBarangay = barangay;
                              const finalCity = city;
                              
                              setFormData(prev => ({
                                ...prev,
                                address: streetAddress,
                                barangay: finalBarangay,
                                city: finalCity,
                                province: province,
                                region: region,
                                postalCode: postalCode
                              }));
                              
                              toast.dismiss(toastId);
                              // Show complete location hierarchy
                              const locationParts = [finalBarangay, finalCity, province].filter(Boolean);
                              if (postalCode) locationParts.push(`(${postalCode})`);
                              if (locationParts.length > 0) {
                                toast.success(`✅ ${locationParts.join(', ')}`);
                              } else {
                                toast.success('✅ Address found');
                              }
                            } else {
                              toast.dismiss(toastId);
                              toast.error('Address not found for these coordinates');
                            }
                          } catch (error) {
                            console.error('Could not lookup address:', error);
                            toast.dismiss(toastId);
                            toast.error('Could not lookup address');
                          }
                        } else {
                          toast.error('Please enter latitude and longitude first');
                        }
                      }}
                      className="text-sm px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      🔍 Lookup Address
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-800">
                    <span className="font-semibold">💡 Tip:</span> For accurate location on laptop, right-click on Google Maps → Copy coordinates → Paste here. Phone GPS is more accurate!
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-normal text-slate-700 mb-2">Latitude <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      placeholder="12.742554"
                      className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-normal text-slate-700 mb-2">Longitude <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      placeholder="121.489959"
                      className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Section */}
          {activeSection === 'contact' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleInputChange}
                  placeholder="+63 912 345 6789"
                  className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@destination.com"
                  className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-normal text-slate-700 mb-2">Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.destination.com"
                  className="w-full px-4 py-3 bg-white text-slate-900 border-2 border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeSection === 'images' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-slate-900">Images & Photos</h3>
                <label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <span className="cursor-pointer px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 text-xs font-medium">
                    Upload Images
                  </span>
                </label>
              </div>

              {images.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-slate-600">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.preview || image.url}
                        alt={image.title || 'Destination image'}
                        className="w-full h-32 object-cover rounded-lg border-2 border-slate-200"
                      />
                      {index === primaryImageIndex && (
                        <div className="absolute top-2 left-2 bg-teal-500 text-white px-2 py-1 rounded text-xs font-bold">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 rounded-lg">
                        {index !== primaryImageIndex && (
                          <button
                            onClick={() => handleSetPrimaryImage(index)}
                            className="bg-white text-slate-900 px-2 py-1 rounded text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id || index)}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Amenities Section */}
          {activeSection === 'amenities' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <h3 className="font-medium text-slate-900">Amenities & Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.some(a => 
                    (typeof a === 'object' ? a.id : a) === amenity.id
                  );
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-900'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                      }`}
                    >
                      <span className="text-xl">{amenity.icon}</span>
                      <span className="text-sm font-medium">{amenity.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amenity */}
              <div className="border-t-2 border-slate-200 pt-4">
                <h4 className="text-sm font-medium text-slate-900 mb-3">Add Custom Amenity</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity.icon}
                    onChange={(e) => setCustomAmenity(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="✨"
                    className="w-16 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg text-center"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={customAmenity.name}
                    onChange={(e) => setCustomAmenity(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
                    placeholder="Enter amenity name"
                    className="flex-1 px-3 py-2 bg-white text-slate-900 border-2 border-slate-200 rounded-lg"
                  />
                  <button
                    onClick={handleAddCustomAmenity}
                    className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Amenities */}
              <div className="bg-teal-50 rounded-lg p-3 border border-teal-200">
                <p className="text-sm text-teal-900 font-medium mb-2">
                  <strong>{selectedAmenities.length}</strong> amenities selected
                </p>
                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAmenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs font-medium text-slate-700 border border-teal-300"
                      >
                        <span>{typeof amenity === 'object' ? amenity.icon : '✨'}</span>
                        <span>{typeof amenity === 'object' ? amenity.name : amenity}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operating Hours Section */}
          {activeSection === 'hours' && (
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <h3 className="font-medium text-slate-900">Operating Hours</h3>
              {operatingHours.map((schedule, index) => (
                <div key={schedule.day} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="w-24">
                    <span className="font-medium text-slate-900 text-sm">{schedule.day}</span>
                  </div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={schedule.isClosed}
                      onChange={(e) => handleOperatingHoursChange(index, 'isClosed', e.target.checked)}
                      className="w-4 h-4 text-teal-500 rounded"
                    />
                    <span className="text-sm text-slate-900 font-medium">Closed</span>
                  </label>
                  {!schedule.isClosed && (
                    <>
                      <input
                        type="time"
                        value={schedule.opens}
                        onChange={(e) => handleOperatingHoursChange(index, 'opens', e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-900 font-medium"
                      />
                      <span className="text-slate-900 text-sm font-medium">to</span>
                      <input
                        type="time"
                        value={schedule.closes}
                        onChange={(e) => handleOperatingHoursChange(index, 'closes', e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded text-sm text-slate-900 font-medium"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* QR Code Section */}
          {activeSection === 'qrcode' && (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 scrollbar-hide">
              <h3 className="font-medium text-slate-900">QR Code for Check-in</h3>
              
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-6 border-2 border-teal-200">
                <div className="text-center space-y-4">
                  {formData.qrCode ? (
                    <>
                      <div className="flex justify-center">
                        <div className="bg-white p-4 rounded-lg shadow-lg">
                          <QRCodeSVG 
                            value={formData.qrCode}
                            size={200}
                            level="H"
                            includeMargin={true}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-slate-700">QR Code Value:</p>
                        <div className="bg-white px-4 py-3 rounded-lg border border-teal-300">
                          <code className="text-teal-600 font-mono text-sm">{formData.qrCode}</code>
                        </div>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => {
                          const newQRCode = generateQRCode();
                          const qrDataUri = generateQRCodeDataURI(newQRCode);
                          setFormData(prev => ({ 
                            ...prev, 
                            qrCode: newQRCode,
                            qrCodeImageUrl: qrDataUri
                          }));
                          toast.success('QR Code regenerated!');
                        }}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                      >
                        Regenerate QR Code
                      </button>
                    </>
                  ) : (
                    <div className="py-8">
                      <p className="text-slate-600 mb-4">No QR code generated yet</p>
                      <button
                        type="button"
                        onClick={() => {
                          const newQRCode = generateQRCode();
                          const qrDataUri = generateQRCodeDataURI(newQRCode);
                          setFormData(prev => ({ 
                            ...prev, 
                            qrCode: newQRCode,
                            qrCodeImageUrl: qrDataUri
                          }));
                          toast.success('QR Code generated!');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />
      
      {/* Header */}
      <AdminHeader
        admin={getCurrentAdmin()}
        onLogout={handleLogout}
      />

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      {/* Main Content */}
      <main 
        className={`
          relative z-10
          transition-all duration-300 ease-in-out
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8
        `}
      >
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Interactive Map</h2>
              <p className="text-sm text-slate-600 mt-1">Pin and manage destinations on the map</p>
            </div>
          </div>
        </motion.div>

        {/* Map Content */}

        {/* Pin Mode Toggle */}
        <div className="mb-6">
          <Button
            variant={isPinMode ? 'primary' : 'outline'}
            onClick={() => setIsPinMode(!isPinMode)}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {isPinMode ? '📍 Pin Mode Active - Click Map to Add' : '📍 Enable Pin Mode'}
          </Button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-xs font-semibold text-blue-900 mb-1">How to add locations</h3>
              <p className="text-xs sm:text-sm text-blue-800">Click anywhere on the map to pin a new location. A form will appear to add details. Each location gets a unique QR code for user check-ins and digital footprints.</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-4 sm:p-6 h-full">
              <h3 className="text-xs font-medium text-slate-900 mb-4">Location Map</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">Click on the map to add new destinations</p>
              
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 relative z-0" style={{ height: '600px', minHeight: '500px' }}>
                <MapContainer
                  center={getMapCenter()}
                  zoom={destinations.length > 0 ? 10 : 9}
                  scrollWheelZoom={true}
                  dragging={true}
                  touchZoom={true}
                  doubleClickZoom={true}
                  zoomControl={true}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  {/* Satellite imagery */}
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                    attribution='&copy; Google'
                    maxZoom={20}
                    minZoom={2}
                  />
                  {/* Road labels overlay */}
                  <TileLayer
                    url="https://mt1.google.com/vt/lyrs=h&x={x}&y={y}&z={z}"
                    attribution='&copy; Google'
                    maxZoom={20}
                    minZoom={2}
                  />
                  
                  <LocationMarker onLocationSelect={handleMapClick} />
                  
                  {/* Admin's Current Location Marker */}
                  {adminLocation && (
                    <Marker
                      position={[adminLocation.latitude, adminLocation.longitude]}
                      icon={L.divIcon({
                        className: 'custom-admin-marker',
                        html: `
                          <div style="position: relative;">
                            <div style="
                              width: 20px;
                              height: 20px;
                              background: #3b82f6;
                              border: 3px solid white;
                              border-radius: 50%;
                              box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
                              animation: pulse 2s infinite;
                            "></div>
                            <div style="
                              position: absolute;
                              top: 50%;
                              left: 50%;
                              transform: translate(-50%, -50%);
                              width: 60px;
                              height: 60px;
                              background: rgba(59, 130, 246, 0.2);
                              border-radius: 50%;
                              animation: ripple 2s infinite;
                            "></div>
                          </div>
                          <style>
                            @keyframes pulse {
                              0%, 100% { transform: scale(1); opacity: 1; }
                              50% { transform: scale(1.1); opacity: 0.8; }
                            }
                            @keyframes ripple {
                              0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
                              100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
                            }
                          </style>
                        `,
                        iconSize: [20, 20],
                        iconAnchor: [10, 10]
                      })}
                    >
                      <Tooltip direction="top" offset={[0, -10]} opacity={0.95} permanent>
                        <div style={{ textAlign: 'center', minWidth: '120px' }}>
                          <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#1e293b', margin: 0 }}>📍 Your Location</p>
                          <p style={{ fontSize: '10px', color: '#64748b', margin: '2px 0 0 0' }}>Accuracy: ±{Math.round(adminLocation.accuracy)}m</p>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div style={{ padding: '8px', minWidth: '200px' }}>
                          <h4 style={{ fontWeight: 'bold', color: '#1e293b', margin: '0 0 8px 0' }}>📍 Your Current Location</h4>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            <p style={{ margin: '4px 0' }}>Lat: {adminLocation.latitude.toFixed(6)}</p>
                            <p style={{ margin: '4px 0' }}>Lng: {adminLocation.longitude.toFixed(6)}</p>
                            <p style={{ margin: '4px 0' }}>Accuracy: ±{Math.round(adminLocation.accuracy)} meters</p>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  
                  {destinations.length > 0 ? destinations.map((dest) => (
                    <Marker
                      key={dest.id}
                      position={[dest.latitude, dest.longitude]}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={0.95} permanent={false}>
                        <div className="text-center min-w-[150px]">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-lg">{dest.categoryIcon}</span>
                            <p className="font-bold text-xs text-slate-900">{dest.name}</p>
                          </div>
                          <p className="text-xs text-slate-600 mb-1">{dest.categoryIcon} {dest.categoryName}</p>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span>👣 {dest.visits}</span>
                            <span>⭐ {dest.reviews}</span>
                          </div>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{dest.categoryIcon}</span>
                            <h4 className="font-bold text-slate-900">{dest.name}</h4>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{dest.categoryIcon} {dest.categoryName}</p>
                          <div className="text-xs text-slate-500 mb-3">
                            <p>👣 {dest.visits} footprints</p>
                            <p>⭐ {dest.reviews} reviews</p>
                            <p>🔑 QR: {dest.qrCode}</p>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              onClick={() => handleViewDestination(dest)}
                              className="px-2 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View
                            </button>
                            <button
                              onClick={() => handleEditDestination(dest)}
                              className="px-2 py-1.5 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleShowQR(dest)}
                              className="px-2 py-1.5 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                              </svg>
                              QR
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  )) : (
                    <Popup position={getMapCenter()}>
                      <div className="p-2 text-center">
                        <p className="text-sm text-slate-600 mb-2">No destinations yet</p>
                        <p className="text-xs text-slate-500">Enable pin mode and click to add</p>
                      </div>
                    </Popup>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar - Locations List */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
              <h3 className="font-semibold text-slate-900 mb-4">Map Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Locations</span>
                  <span className="text-xs font-medium text-teal-600">{destinations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Digital Footprints</span>
                  <span className="text-xs font-medium text-blue-600">
                    {destinations.reduce((sum, d) => sum + d.visits, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Reviews</span>
                  <span className="text-xs font-medium text-purple-600">
                    {destinations.reduce((sum, d) => sum + d.reviews, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Locations List */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-slate-900 mb-4">All Locations</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {destinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${getCategoryColor(dest.category)} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                        {dest.categoryIcon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{dest.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{dest.categoryIcon} {dest.categoryName}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                          <span>👣 {dest.visits}</span>
                          <span>⭐ {dest.reviews}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => handleViewDestination(dest)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors font-medium shadow-sm hover:shadow flex items-center justify-center gap-1"
                            title="View Details"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span className="hidden sm:inline">View</span>
                          </button>
                          <button
                            onClick={() => handleEditDestination(dest)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-lg transition-colors font-medium shadow-sm hover:shadow flex items-center justify-center gap-1"
                            title="Edit Destination"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="hidden sm:inline">Edit</span>
                          </button>
                          <button
                            onClick={() => handleShowQR(dest)}
                            className="flex-1 min-w-[80px] px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white text-xs rounded-lg transition-colors font-medium shadow-sm hover:shadow flex items-center justify-center gap-1"
                            title="Show QR Code"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            <span className="hidden sm:inline">QR</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Full Destination Details Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={() => {
          setModalState({ isOpen: false, mode: '', data: null });
          setActiveSection('basic');
        }}
        title={modalState.mode === 'add' ? 'Add New Destination' : 'Destination Details'}
        footer={
          modalState.mode === 'add' && (
            <>
              <Button 
                variant="outline" 
                onClick={() => {
                  setModalState({ isOpen: false, mode: '', data: null });
                  setActiveSection('basic');
                }} 
                disabled={saving}
              >
                Cancel
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSave}
                disabled={saving}
                icon={
                  saving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    (() => {
                      const currentIndex = sections.findIndex(s => s.id === activeSection);
                      const isLastSection = currentIndex === sections.length - 1;
                      
                      if (!isLastSection) {
                        return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>;
                      }
                      
                      return <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
                    })()
                  )
                }
              >
                {saving ? 'Saving...' : (() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  const isLastSection = currentIndex === sections.length - 1;
                  
                  if (!isLastSection) return 'Next';
                  return 'Add Destination';
                })()}
              </Button>
            </>
          )
        }
        size="md"
      >
        {renderModalContent()}
      </Modal>

      {/* Add Location Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setNewLocation(null);
        }}
        title="Add New Location"
        titleIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Location Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              placeholder="e.g., Grand Hotel Resort"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Category *
            </label>
            {formData.category_id && categories.length > 0 && (
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium">
                <span>{categories.find(cat => cat.id == formData.category_id)?.icon}</span>
                <span>{categories.find(cat => cat.id == formData.category_id)?.category_name}</span>
              </div>
            )}
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900 text-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              size="1"
              style={{ maxHeight: '200px' }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="py-2 text-sm">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-blue-900 mb-1">Coordinates Auto-filled</p>
                <p className="text-sm text-blue-700">The latitude and longitude were automatically captured from the map click.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Latitude *
              </label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono text-slate-900"
                placeholder="14.599512"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Longitude *
              </label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono text-slate-900"
                placeholder="120.984219"
              />
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
              </svg>
              Points Reward
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              placeholder="50"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setShowAddModal(false);
                setNewLocation(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleAddDestination}
              className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Add Location
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Location Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDestination(null);
          setFormData({ name: '', category: 'hotel', description: '', address: '', points: 50, latitude: '', longitude: '' });
        }}
        title="Edit Location"
        titleIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
      >
        <div className="space-y-6">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              Location Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
              placeholder="e.g., Grand Hotel Resort"
            />
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Category *
            </label>
            {formData.category_id && categories.length > 0 && (
              <div className="mb-2 inline-flex items-center gap-2 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium">
                <span>{categories.find(cat => cat.id == formData.category_id)?.icon}</span>
                <span>{categories.find(cat => cat.id == formData.category_id)?.category_name}</span>
              </div>
            )}
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900 text-sm [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              size="1"
              style={{ maxHeight: '200px' }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="py-2 text-sm">
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Latitude *
              </label>
              <input
                type="text"
                value={formData.latitude}
                onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono text-slate-900"
                placeholder="14.599512"
              />
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 mb-2">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                Longitude *
              </label>
              <input
                type="text"
                value={formData.longitude}
                onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono text-slate-900"
                placeholder="120.984219"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => {
                setShowEditModal(false);
                setSelectedDestination(null);
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="lg"
              onClick={handleUpdateDestination}
              className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600"
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Update Location
            </Button>
          </div>
        </div>
      </Modal>

      {/* View Location Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDestination(null);
        }}
        title="Location Details"
        titleIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
      >
        {selectedDestination && (
          <div className="space-y-6">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl">
              <span className="text-5xl">{getCategoryIcon(selectedDestination.category)}</span>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedDestination.name}</h3>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedDestination.category)} text-white`}>
                {selectedDestination.category}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👣</span>
                  <p className="text-xs text-blue-700 font-bold uppercase">Footprints</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{selectedDestination.visits}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⭐</span>
                  <p className="text-xs text-purple-700 font-bold uppercase">Reviews</p>
                </div>
                <p className="text-3xl font-bold text-purple-900">{selectedDestination.reviews}</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Coordinates</p>
              <div className="grid grid-cols-2 gap-2 text-sm font-mono text-slate-900">
                <div>
                  <p className="text-xs text-slate-600">Latitude</p>
                  <p className="font-bold">{selectedDestination.latitude.toFixed(6)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Longitude</p>
                  <p className="font-bold">{selectedDestination.longitude.toFixed(6)}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200">
              <p className="text-xs font-bold text-teal-700 uppercase tracking-wider mb-2">QR Code ID</p>
              <p className="text-lg font-mono font-bold text-teal-900 break-all">{selectedDestination.qrCode}</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditDestination(selectedDestination);
                }}
                className="flex-1"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                }
              >
                Edit
              </Button>
              <Button
                variant="primary"
                size="lg"
                onClick={() => {
                  setShowViewModal(false);
                  handleShowQR(selectedDestination);
                }}
                className="flex-1"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                }
              >
                View QR
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => {
          setShowQRModal(false);
          setSelectedDestination(null);
        }}
        title={selectedDestination?.name}
        titleIcon={
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
        }
      >
        {selectedDestination && (
          <div className="space-y-6">
            <div className="flex items-center justify-center w-20 h-20 mx-auto bg-gradient-to-br from-teal-100 to-blue-100 rounded-2xl">
              <span className="text-5xl">{getCategoryIcon(selectedDestination.category)}</span>
            </div>

            <div className="text-center">
              <h3 className="text-xs font-medium text-slate-900 mb-2">{selectedDestination.name}</h3>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-medium ${getCategoryColor(selectedDestination.category)} text-white`}>
                {selectedDestination.category}
              </span>
            </div>
            
            <div className="flex justify-center bg-gradient-to-br from-slate-50 to-white p-8 rounded-2xl border-2 border-slate-200">
              <QRGenerator value={selectedDestination.qrCode} size={200} />
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-5 border-2 border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">QR Code ID</p>
              <p className="text-lg font-mono font-bold text-slate-900 break-all">{selectedDestination.qrCode}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-5 border-2 border-teal-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👣</span>
                  <p className="text-xs text-blue-700 font-bold uppercase">Footprints</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{selectedDestination.visits}</p>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-xl p-5 border-2 border-cyan-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⭐</span>
                  <p className="text-xs text-purple-700 font-bold uppercase">Reviews</p>
                </div>
                <p className="text-3xl font-bold text-purple-900">{selectedDestination.reviews}</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-900">
                  Users scan this QR code to check-in and leave their digital footprint at this location.
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
});

AdminMap.displayName = 'AdminMap';

export default AdminMap;
