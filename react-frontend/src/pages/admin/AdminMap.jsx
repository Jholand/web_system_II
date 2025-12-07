import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronDown, User, X } from 'lucide-react';
import AnimatedPage from '../../components/common/AnimatedPage';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import QRGenerator from '../../components/qr/QRGenerator';
import { getCurrentAdmin } from '../../utils/adminHelper';
import ToastNotification from '../../components/common/ToastNotification';
import toast from 'react-hot-toast';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
// Helper functions for icon handling
const isImagePath = (icon) => {
  if (!icon) return false;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const iconStr = String(icon).toLowerCase();
  return imageExtensions.some(ext => iconStr.includes(ext));
};

const getIconUrl = (icon) => {
  if (isImagePath(icon)) {
    const path = icon.startsWith('http') ? icon : icon.replace(/^\/storage\//, '');
    return `http://localhost:8000/storage/${path}`;
  }
  return null;
};

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
  const [nearbyDestinations, setNearbyDestinations] = useState([]);
  const [savedDestinations, setSavedDestinations] = useState([]);
  const [viewMode, setViewMode] = useState('all'); // 'all', 'nearby', 'saved'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, destination: null });

  // Consolidated modal state
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '', // 'add', 'edit', 'view', 'qr', 'delete'
    data: null,
  });

  const [selectedDestination, setSelectedDestination] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const [isPinMode, setIsPinMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [adminLocation, setAdminLocation] = useState(null);
  const [watchId, setWatchId] = useState(null);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const categoryDropdownRef = useRef(null);
  const [owners, setOwners] = useState([]);
  const [ownerDropdownOpen, setOwnerDropdownOpen] = useState(false);
  const ownerDropdownRef = useRef(null);

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
  const BASE_URL = getApiUrl().replace('/api', '');

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
      return `${BASE_URL}/storage/${icon}`;
    }
    return icon; // Return emoji as is
  };

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
          // Cache is good for 2 minutes for destinations
          if (cacheAge < 120000) shouldFetchDest = false;
        }
      } catch (e) {}
    }
    
    if (cachedCat) {
      try {
        const parsed = JSON.parse(cachedCat);
        const cacheAge = Date.now() - (parsed.timestamp || 0);
        if (parsed.data) {
          setCategories(parsed.data);
          // Cache is good for 5 minutes for categories
          if (cacheAge < 300000) shouldFetchCat = false;
        }
      } catch (e) {}
    }
    
    if (shouldFetchDest) fetchDestinations();
    if (shouldFetchCat) fetchCategories();
    fetchOwners();
    
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

  const fetchOwners = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/users`, {
        params: { role: 'owner', per_page: 1000 }
      });
      const data = response.data.data || [];
      setOwners(data.map(owner => ({
        id: owner.id,
        value: owner.id,
        label: `${owner.first_name} ${owner.last_name}`,
        email: owner.email,
        username: owner.username
      })));
    } catch (error) {
      console.error('Error fetching owners:', error);
      toast.error('Failed to load owners');
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
        categoryIcon: isImagePath(dest.category?.icon) ? '🖼️' : dest.category?.icon || '📍',
        categoryIconUrl: isImagePath(dest.category?.icon) ? getIconUrl(dest.category?.icon) : null,
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

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Update nearby destinations when admin location changes
  useEffect(() => {
    if (adminLocation && destinations.length > 0) {
      const nearby = destinations
        .map(dest => ({
          ...dest,
          distance: calculateDistance(
            adminLocation.latitude,
            adminLocation.longitude,
            dest.latitude,
            dest.longitude
          )
        }))
        .filter(dest => dest.distance <= 50) // Within 50km
        .sort((a, b) => a.distance - b.distance);
      
      setNearbyDestinations(nearby);
    }
  }, [adminLocation, destinations]);

  // Load saved destinations from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('admin_saved_destinations') || '[]');
      setSavedDestinations(saved);
    } catch (e) {
      console.error('Error loading saved destinations:', e);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setCategoryDropdownOpen(false);
      }
      if (ownerDropdownRef.current && !ownerDropdownRef.current.contains(event.target)) {
        setOwnerDropdownOpen(false);
      }
      // Close category filter dropdown
      const dropdown = document.getElementById('category-dropdown-admin');
      const button = event.target.closest('.category-filter-button-admin');
      if (dropdown && !button && dropdown.style.display !== 'none') {
        dropdown.style.display = 'none';
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Save a destination
  const handleSaveDestination = (dest) => {
    const saved = [...savedDestinations];
    const index = saved.findIndex(d => d.id === dest.id);
    
    if (index === -1) {
      saved.push(dest);
      setSavedDestinations(saved);
      localStorage.setItem('admin_saved_destinations', JSON.stringify(saved));
      toast.success(`Saved ${dest.name}`);
    } else {
      saved.splice(index, 1);
      setSavedDestinations(saved);
      localStorage.setItem('admin_saved_destinations', JSON.stringify(saved));
      toast.success(`Removed ${dest.name} from saved`);
    }
  };

  const isSaved = (destId) => {
    return savedDestinations.some(d => d.id === destId);
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
    setActiveSection('basic');
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

  const openModal = (mode, destinationData = null) => {
    setModalState({ isOpen: true, mode, data: destinationData });
    if (mode === 'edit' && destinationData) {
      // Populate form data for editing
      setFormData({
        name: destinationData.name || '',
        category: destinationData.categoryId || destinationData.category_id || '',
        description: destinationData.description || '',
        fullDescription: destinationData.full_description || '',
        address: destinationData.street_address || '',
        barangay: destinationData.barangay || '',
        city: destinationData.city || '',
        province: destinationData.province || '',
        region: destinationData.region || '',
        postalCode: destinationData.postal_code || '',
        latitude: destinationData.coordinates?.latitude?.toString() || destinationData.latitude?.toString() || '',
        longitude: destinationData.coordinates?.longitude?.toString() || destinationData.longitude?.toString() || '',
        pointsReward: destinationData.points_reward || destinationData.points || 50,
        contactNumber: destinationData.contact?.phone || '',
        email: destinationData.contact?.email || '',
        website: destinationData.contact?.website || '',
        status: destinationData.status || 'active',
        featured: destinationData.featured || false,
        qrCode: destinationData.qr_code || '',
        qrCodeImageUrl: destinationData.qr_code_image_url || '',
      });
      setActiveSection('basic');
    } else if (mode === 'add') {
      resetForm();
      setActiveSection('basic');
    } else if (mode === 'view' || mode === 'qr') {
      // Just display data, no form needed
    }
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    resetForm();
    setActiveSection('basic');
  };

  const resetForm = () => {
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
  };

  const handleEditDestination = (destination) => {
    openModal('edit', destination);
  };

  const handleViewDestination = (destination) => {
    openModal('view', destination);
  };

  const handleShowQR = (destination) => {
    openModal('qr', destination);
  };

  const handleUpdateDestination = async () => {
    if (!formData.name || !formData.latitude || !formData.longitude) {
      toast.error('Please fill in name and coordinates');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Invalid coordinates');
      return;
    }

    setSaving(true);
    try {
      // Get CSRF token first
      await axios.get(`${BASE_URL}/sanctum/csrf-cookie`);
      
      const response = await axios.put(`${API_BASE_URL}/destinations/${modalState.data.id}`, {
        name: formData.name,
        category_id: parseInt(formData.category),
        description: formData.description || '',
        full_description: formData.fullDescription || '',
        street_address: formData.address || '',
        barangay: formData.barangay || '',
        city: formData.city || '',
        province: formData.province || '',
        region: formData.region || '',
        postal_code: formData.postalCode || '',
        latitude: lat,
        longitude: lng,
        points_reward: parseInt(formData.pointsReward) || 50,
        contact_number: formData.contactNumber || null,
        email: formData.email || null,
        website: formData.website || null,
        status: formData.status || 'active',
        featured: formData.featured ? 1 : 0,
      });

      toast.success(`${formData.name} updated successfully!`);
      await fetchDestinations();
      closeModal();
    } catch (error) {
      console.error('Error updating destination:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to update destination';
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.keys(errors).forEach(key => {
          toast.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEditDestination_OLD = (destination) => {
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

  const handleUpdateDestination_OLD = () => {
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
    setDeleteConfirm({ isOpen: true, destination });
  };

  const confirmDeleteDestination = async () => {
    const destination = deleteConfirm.destination;
    if (!destination) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/destinations/${destination.id}`);
      
      const updatedDestinations = destinations.filter(dest => dest.id !== destination.id);
      setDestinations(updatedDestinations);
      
      setDeleteConfirm({ isOpen: false, destination: null });
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
          {/* Section Navigation - EXACT COPY from Destinations */}
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
            <div className="grid grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Destination name"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded hover:border-teal-400 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {formData.category ? (
                      <>
                        {(() => {
                          const selectedCat = categories.find(c => c.id == formData.category);
                          if (!selectedCat) return <span className="text-slate-400">Select</span>;
                          const isImg = isImagePath(selectedCat.icon);
                          return (
                            <>
                              {isImg ? (
                                <img src={getIconUrl(selectedCat.icon)} alt="" className="w-4 h-4 rounded object-cover" />
                              ) : (
                                <span>{selectedCat.icon}</span>
                              )}
                              <span>{selectedCat.name}</span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <span className="text-slate-400">Select</span>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {categoryDropdownOpen && (
                  <div 
                    className="absolute z-[60] w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-[320px] overflow-y-auto"
                    style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {categories.map((cat) => {
                      const isImg = isImagePath(cat.icon);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: cat.id }));
                            setCategoryDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-2 text-sm ${formData.category == cat.id ? 'bg-teal-100' : ''}`}
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
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Points</label>
                <input
                  type="number"
                  name="pointsReward"
                  value={formData.pointsReward}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              {modalState.mode === 'edit' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              )}
              <div className="relative" ref={ownerDropdownRef}>
                <label className="block text-xs font-medium text-slate-700 mb-1">Owner</label>
                <div
                  onClick={() => setOwnerDropdownOpen(!ownerDropdownOpen)}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded hover:border-teal-400 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {formData.owner ? (
                      <>
                        {(() => {
                          const selectedOwner = owners.find(o => o.id == formData.owner);
                          if (!selectedOwner) return <span className="text-slate-400">None</span>;
                          return (
                            <>
                              <User size={14} className="text-teal-600" />
                              <span>{selectedOwner.label}</span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <span className="text-slate-400">None</span>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${ownerDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {ownerDropdownOpen && (
                  <div 
                    className="absolute z-[60] w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-80 overflow-y-auto"
                    style={{scrollbarWidth: 'thin', scrollbarColor: '#94a3b8 #f1f5f9'}}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    <div
                      onClick={() => {
                        setFormData(prev => ({ ...prev, owner: null }));
                        setOwnerDropdownOpen(false);
                      }}
                      className={`px-2 py-1.5 hover:bg-slate-50 cursor-pointer transition-colors flex items-center gap-2 text-sm ${!formData.owner ? 'bg-slate-100' : ''}`}
                    >
                      <X size={14} className="text-slate-400" />
                      <span className="text-slate-500">No owner</span>
                    </div>
                    {owners.map((owner) => (
                      <div
                        key={owner.id}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, owner: owner.id }));
                          setOwnerDropdownOpen(false);
                        }}
                        className={`px-2 py-1.5 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-2 text-sm ${formData.owner == owner.id ? 'bg-teal-100' : ''}`}
                      >
                        <User size={14} className="text-teal-600" />
                        <div className="flex flex-col">
                          <span className="font-medium">{owner.label}</span>
                          <span className="text-xs text-slate-500">{owner.email}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  placeholder="Brief description"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-800">Location Details</h3>
              
              {/* GPS Coordinates - Featured */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-slate-900">📍 GPS Coordinates</label>
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

              {/* Address Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Street</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Purok 3"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Barangay</label>
                  <input
                    type="text"
                    name="barangay"
                    value={formData.barangay}
                    onChange={handleInputChange}
                    placeholder="Ipil"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">City <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Bongabong"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Province <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Oriental Mindoro"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Region</label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Region IV-B"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    placeholder="5211"
                    className="w-full px-3 py-2 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Info Section */}
          {activeSection === 'contact' && (
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Contact Information</h3>
              <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+63 912 345 6789"
                    className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@destination.com"
                    className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Website</label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeSection === 'images' && (
            <div className="space-y-3">
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
                <div className="text-center py-6 border-2 border-dashed border-slate-300 rounded-lg">
                  <p className="text-xs text-slate-600">No images uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {images.map((image, index) => (
                    <div key={image.id || index} className="relative group">
                      <img
                        src={image.preview || image.url}
                        alt={image.title || image.caption || 'Destination image'}
                        loading="lazy"
                        className="w-full h-24 object-cover rounded border border-slate-200"
                      />
                      {index === primaryImageIndex && (
                        <div className="absolute top-1 left-1 bg-teal-500 text-white px-2 py-0.5 rounded text-xs font-bold shadow-md">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-1 rounded">
                        {index !== primaryImageIndex && (
                          <button
                            onClick={() => handleSetPrimaryImage(index)}
                            className="bg-white text-slate-900 px-2 py-1 rounded text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md font-medium"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id || index)}
                          className="bg-red-500 text-white px-1.5 py-0.5 rounded text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md font-medium"
                        >
                          ✕
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
            <div className="space-y-2">
              <h3 className="text-base font-bold text-slate-900">Amenities & Features</h3>
              <p className="text-xs text-slate-700 mb-2">Select amenities available at this destination</p>
              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6 gap-2">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.some(a => 
                    (typeof a === 'object' ? a.id : a) === amenity.id || 
                    (typeof a === 'object' ? a.name : a) === amenity.name
                  );
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg border-2 transition-all duration-200 min-h-[70px] ${
                        isSelected
                          ? 'border-teal-500 bg-gradient-to-br from-teal-50 to-cyan-50 text-teal-900 shadow-lg'
                          : 'border-slate-300 bg-white hover:border-teal-400 hover:shadow-md text-slate-900'
                      }`}
                    >
                      <span className="text-xl">{amenity.icon}</span>
                      <span className="text-[10px] font-semibold text-center leading-tight">{amenity.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amenity Input */}
              <div className="border-t-2 border-slate-300 pt-2 mt-2">
                <h4 className="text-xs font-bold text-slate-900 mb-2">Add Custom Amenity</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customAmenity.icon}
                    onChange={(e) => setCustomAmenity(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="✨"
                    className="w-14 px-2 py-1.5 bg-white text-slate-900 border-2 border-slate-300 rounded-lg text-center text-sm font-medium focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                    maxLength="2"
                  />
                  <input
                    type="text"
                    value={customAmenity.name}
                    onChange={(e) => setCustomAmenity(prev => ({ ...prev, name: e.target.value }))}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCustomAmenity()}
                    placeholder="Enter amenity name"
                    className="flex-1 px-3 py-1.5 bg-white text-slate-900 border-2 border-slate-300 rounded-lg text-xs focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                  />
                  <button
                    onClick={handleAddCustomAmenity}
                    className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 font-semibold shadow-md hover:shadow-lg transition-all text-xs"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Selected Amenities */}
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-2 border-2 border-teal-300 shadow-md">
                <p className="text-xs text-teal-900 font-bold mb-1.5">
                  <strong className="text-sm">{selectedAmenities.length}</strong> amenities selected
                </p>
                {selectedAmenities.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedAmenities.map((amenity, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md text-[10px] font-semibold text-slate-800 border border-teal-300 shadow-sm"
                      >
                        <span className="text-sm">{typeof amenity === 'object' ? amenity.icon : '✨'}</span>
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
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-800">Operating Hours</h3>
              <p className="text-xs text-slate-600 mb-2">Click on a day card to toggle open/closed status</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {operatingHours.map((schedule, index) => (
                  <div 
                    key={schedule.day}
                    onClick={() => handleOperatingHoursChange(index, 'isClosed', !schedule.isClosed)}
                    className={`
                      relative p-2 rounded-lg border-2 cursor-pointer transition-all duration-200
                      ${schedule.isClosed 
                        ? 'bg-slate-100 border-slate-300 hover:border-slate-400 shadow-sm' 
                        : 'bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-300 hover:border-teal-400 hover:shadow-lg shadow-md'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-900 text-xs">{schedule.day}</span>
                      <div className={`
                        px-2 py-0.5 rounded-full text-[10px] font-semibold
                        ${schedule.isClosed 
                          ? 'bg-slate-300 text-slate-700' 
                          : 'bg-teal-500 text-white'
                        }
                      `}>
                        {schedule.isClosed ? 'Closed' : 'Open'}
                      </div>
                    </div>
                    {!schedule.isClosed && (
                      <div className="space-y-1.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-medium text-slate-600 w-10">Opens:</label>
                          <input
                            type="time"
                            value={schedule.opens}
                            onChange={(e) => handleOperatingHoursChange(index, 'opens', e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-medium text-slate-600 w-10">Closes:</label>
                          <input
                            type="time"
                            value={schedule.closes}
                            onChange={(e) => handleOperatingHoursChange(index, 'closes', e.target.value)}
                            className="flex-1 px-2 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500/20"
                          />
                        </div>
                      </div>
                    )}
                    {schedule.isClosed && (
                      <div className="mt-2 text-center text-sm text-slate-500 italic">
                        Click to mark as open
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Section */}
          {activeSection === 'qrcode' && (
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-800">QR Code for Check-in</h3>
              
              <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-3 border-2 border-teal-300 shadow-lg">
                <div className="flex flex-col items-center space-y-2">
                  {formData.qrCode ? (
                    <>
                      <div className="bg-white p-2 rounded-lg shadow-md">
                        <QRCodeSVG 
                          value={formData.qrCode}
                          size={140}
                          level="H"
                          includeMargin={true}
                        />
                      </div>
                      
                      <div className="w-full max-w-md space-y-1">
                        <p className="text-xs font-semibold text-center text-slate-700">QR Code Value:</p>
                        <div className="bg-white px-3 py-1.5 rounded-lg border-2 border-teal-300 shadow-sm">
                          <code className="block text-center text-teal-600 font-mono text-xs font-medium">{formData.qrCode}</code>
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
                        className="px-4 py-1.5 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-md font-semibold text-xs"
                      >
                        Regenerate QR Code
                      </button>
                    </>
                  ) : (
                    <div className="py-4">
                      <p className="text-slate-600 mb-3 text-center text-sm">No QR code generated yet</p>
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
                        className="px-5 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg hover:from-teal-600 hover:to-cyan-600 transition-all shadow-lg font-semibold text-sm"
                      >
                        Generate QR Code
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-2 shadow-sm">
                <p className="text-xs text-blue-800">
                  <strong>ℹ️ Info:</strong> QR codes are automatically generated based on the destination's category, name, and ID. 
                  Users will scan this QR code when they visit the destination to earn points and leave a review.
                </p>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'edit') {
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

          {/* Use same sections as add mode */}
          {activeSection === 'basic' && (
            <div className="grid grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Destination name"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="relative" ref={categoryDropdownRef}>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <div
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded hover:border-teal-400 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    {formData.category ? (
                      <>
                        {(() => {
                          const selectedCat = categories.find(c => c.id == formData.category);
                          if (!selectedCat) return <span className="text-slate-400">Select</span>;
                          const isImg = isImagePath(selectedCat.icon);
                          return (
                            <>
                              {isImg ? (
                                <img src={getIconUrl(selectedCat.icon)} alt="" className="w-4 h-4 rounded object-cover" />
                              ) : (
                                <span>{selectedCat.icon}</span>
                              )}
                              <span>{selectedCat.name}</span>
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <span className="text-slate-400">Select</span>
                    )}
                  </div>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {categoryDropdownOpen && (
                  <div 
                    className="absolute z-50 w-full mt-1 bg-white border border-slate-300 rounded shadow-lg max-h-48 overflow-y-auto"
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                  >
                    {categories.map((cat) => {
                      const isImg = isImagePath(cat.icon);
                      return (
                        <div
                          key={cat.id}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, category: cat.id }));
                            setCategoryDropdownOpen(false);
                          }}
                          className={`px-2 py-1.5 hover:bg-teal-50 cursor-pointer transition-colors flex items-center gap-2 text-sm ${formData.category == cat.id ? 'bg-teal-100' : ''}`}
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
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Points</label>
                <input
                  type="number"
                  name="pointsReward"
                  value={formData.pointsReward}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="col-span-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="2"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}

          {/* Other sections same as add mode - location, images, etc */}
          {activeSection === 'location' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Province</label>
                <input
                  type="text"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Latitude *</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Longitude *</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'view' && modalState.data) {
      const data = modalState.data;
      const fullData = data.fullData || {};
      const primaryImage = fullData.images?.find(img => img.is_primary) || fullData.images?.[0];
      const imageUrl = primaryImage 
        ? (primaryImage.url || primaryImage.image_path || '').startsWith('http') 
          ? (primaryImage.url || primaryImage.image_path)
          : `http://localhost:8000/storage/${(primaryImage.url || primaryImage.image_path || '').replace(/^\/storage\//, '')}`
        : data.image_url;
      
      return (
        <div className="space-y-6 pr-1 max-w-7xl mx-auto">
          <div className="grid xl:grid-cols-[1.8fr_1fr] gap-5 items-start">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {imageUrl && (
                <div className="relative h-64 bg-slate-100">
                  <img
                    src={imageUrl}
                    alt={data.title || data.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg">
                    +{data.points} pts
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold ${data.categoryColor} shadow-lg`}>
                      {data.categoryIconUrl ? (
                        <img src={data.categoryIconUrl} alt={data.category || data.categoryName} className="w-5 h-5 rounded object-cover" />
                      ) : (
                        <span>{data.categoryIcon}</span>
                      )}
                      <span>{data.category || data.categoryName}</span>
                    </span>
                  </div>
                </div>
              )}

              <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                    {data.categoryIconUrl ? (
                      <img src={data.categoryIconUrl} alt={data.category || data.categoryName} className="w-10 h-10 rounded-xl object-cover" />
                    ) : (
                      <span className="text-3xl text-white">{data.categoryIcon}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-900 leading-snug">{data.title || data.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${data.categoryColor}`}>
                        {data.categoryIconUrl ? (
                          <img src={data.categoryIconUrl} alt={data.category || data.categoryName} className="w-4 h-4 rounded object-cover" />
                        ) : (
                          <span>{data.categoryIcon}</span>
                        )}
                        <span>{data.category || data.categoryName}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                        <span className="text-sm">●</span> {fullData.status || 'active'}
                      </span>
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700 border border-yellow-200">
                        ⭐ {data.rating || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {fullData.qr_code && (
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-200 shadow-lg w-full">
                <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-3">
                  <span className="text-xl">📱</span>
                  <span>QR Code</span>
                </h3>
                <div className="flex flex-col items-center space-y-3">
                  <div id={`view-qr-code-container-${data.id}`} className="bg-white p-4 rounded-lg shadow-md">
                    <QRCodeSVG 
                      value={fullData.qr_code}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="w-full">
                    <p className="text-xs font-semibold text-center text-slate-700 mb-1">QR Code Value:</p>
                    <div className="bg-white px-3 py-2 rounded-lg border-2 border-purple-300 shadow-sm">
                      <code className="block text-center text-purple-600 font-mono text-xs font-medium break-all">{fullData.qr_code}</code>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        const qrContainer = document.getElementById(`view-qr-code-container-${data.id}`);
                        const svg = qrContainer?.querySelector('svg');
                        if (!svg) {
                          toast.error('QR Code not found');
                          return;
                        }

                        const canvas = document.createElement('canvas');
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const img = new Image();
                        const destinationName = data.title || data.name || 'destination';
                        const qrCodeValue = fullData.qr_code || 'code';

                        img.onload = () => {
                          const padding = 12;
                          const textArea = 64;
                          canvas.width = img.width + padding * 2;
                          canvas.height = img.height + textArea + padding * 2;
                          const ctx = canvas.getContext('2d');

                          ctx.fillStyle = '#ffffff';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, padding, padding);

                          ctx.fillStyle = '#0f172a';
                          ctx.font = '600 16px "Inter", system-ui, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText(destinationName, canvas.width / 2, img.height + padding + 24);
                          ctx.font = '500 14px "Inter", system-ui, sans-serif';
                          ctx.fillStyle = '#475569';
                          ctx.fillText(`QR: ${qrCodeValue}`, canvas.width / 2, img.height + padding + 46);

                          const safeName = destinationName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                          const safeCode = String(qrCodeValue).replace(/[^a-z0-9]/gi, '-').toLowerCase();
                          const link = document.createElement('a');
                          link.download = `${safeName}-${safeCode}-qr.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                          toast.success('QR Code downloaded!');
                        };

                        img.onerror = () => {
                          toast.error('Failed to download QR Code');
                        };

                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                      } catch (error) {
                        console.error('QR download error:', error);
                        toast.error('Failed to download QR Code');
                      }
                    }}
                    className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-md font-semibold text-sm"
                  >
                    📥 Download QR Code
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Basic Info Section */}
          <div className="bg-gradient-to-br from-teal-50/30 to-cyan-50/30 rounded-xl p-4 border-2 border-teal-200 shadow-lg">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-3">
              <span className="text-xl">📝</span>
              <span>Basic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Destination Name</label>
                <p className="text-sm font-medium text-slate-900">{data.title || data.name}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Status</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${fullData.status === 'active' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-gray-100 text-gray-700 border border-gray-300'}`}>
                  {fullData.status || 'active'}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Description</label>
                <p className="text-sm text-slate-900 leading-relaxed">{data.description}</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Points Reward</label>
                <p className="text-base font-bold text-teal-600">{data.points} pts</p>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 mb-1 block">Visits</label>
                <p className="text-base font-bold text-slate-900">👣 {data.visits || 0}</p>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-4 border-2 border-teal-200 shadow-lg">
            <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 mb-3">
              <span className="text-xl">📍</span>
              <span>Location Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Address</label>
                <p className="text-sm text-slate-900">{data.address || fullData.address?.street || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Latitude</label>
                <p className="text-sm text-slate-900">{data.latitude || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Longitude</label>
                <p className="text-sm text-slate-900">{data.longitude || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (mode === 'qr' && modalState.data) {
      const dest = modalState.data;
      const qrContainerId = `qr-code-container-${dest.id}`;
      return (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{dest.name}</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                {dest.categoryIconUrl ? (
                  <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-5 h-5 rounded object-cover" />
                ) : (
                  <span>{dest.categoryIcon}</span>
                )}
                <span>{dest.categoryName}</span>
              </div>
              
              {dest.qrCode ? (
                <>
                  <div id={qrContainerId} className="bg-white p-6 rounded-2xl shadow-lg">
                    <QRCodeSVG value={dest.qrCode} size={256} />
                  </div>
                  <p className="text-sm text-slate-600 mt-4 font-mono bg-slate-100 px-4 py-2 rounded-lg">{dest.qrCode}</p>
                  <button
                    onClick={() => {
                      try {
                        const qrContainer = document.getElementById(qrContainerId);
                        const svg = qrContainer?.querySelector('svg');
                        
                        if (!svg) {
                          toast.error('QR Code not found');
                          return;
                        }
                        
                        const canvas = document.createElement('canvas');
                        const svgData = new XMLSerializer().serializeToString(svg);
                        const img = new Image();
                        const destinationName = dest.name || 'destination';
                        const qrCodeValue = dest.qrCode || 'code';
                        
                        img.onload = () => {
                          const padding = 12;
                          const textArea = 64;
                          canvas.width = img.width + padding * 2;
                          canvas.height = img.height + textArea + padding * 2;
                          const ctx = canvas.getContext('2d');
                          ctx.fillStyle = '#ffffff';
                          ctx.fillRect(0, 0, canvas.width, canvas.height);
                          ctx.drawImage(img, padding, padding);

                          ctx.fillStyle = '#0f172a';
                          ctx.font = '600 16px "Inter", system-ui, sans-serif';
                          ctx.textAlign = 'center';
                          ctx.fillText(destinationName, canvas.width / 2, img.height + padding + 24);
                          ctx.font = '500 14px "Inter", system-ui, sans-serif';
                          ctx.fillStyle = '#475569';
                          ctx.fillText(`QR: ${qrCodeValue}`, canvas.width / 2, img.height + padding + 46);
                          
                          const safeName = destinationName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
                          const safeCode = String(qrCodeValue).replace(/[^a-z0-9]/gi, '-').toLowerCase();
                          const link = document.createElement('a');
                          link.download = `${safeName}-${safeCode}-qr.png`;
                          link.href = canvas.toDataURL('image/png');
                          link.click();
                          toast.success('QR Code downloaded!');
                        };
                        
                        img.onerror = () => {
                          toast.error('Failed to download QR Code');
                        };
                        
                        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
                      } catch (error) {
                        console.error('QR download error:', error);
                        toast.error('Failed to download QR Code');
                      }
                    }}
                    className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    Download QR Code
                  </button>
                </>
              ) : (
                <p className="text-slate-500">No QR code available for this destination</p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white relative pb-20 sm:pb-0">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />

      <DashboardTabs onCollapseChange={setSidebarCollapsed} />

      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Page Header - match dashboard style */}
        <header className="bg-gradient-to-r from-teal-500 to-cyan-600 shadow-lg sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Interactive Map</h1>
                <p className="text-sm text-teal-50 mt-1">Pin and manage destinations directly on the map</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto mt-6 pb-32 sm:pb-20 md:pb-8">

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
              
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 relative z-0" style={{ height: '800px', minHeight: '600px', zIndex: 0 }}>
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
                  
                  {(() => {
                    // Get base list based on view mode
                    let displayList = viewMode === 'all' ? destinations : viewMode === 'nearby' ? nearbyDestinations : savedDestinations;
                    
                    // Apply category filter
                    if (selectedCategory && selectedCategory !== 'all') {
                      displayList = displayList.filter(dest => 
                        dest.categoryName === selectedCategory || 
                        dest.category === selectedCategory ||
                        dest.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
                        dest.category?.toLowerCase() === selectedCategory.toLowerCase()
                      );
                    }
                    
                    // Apply search filter
                    if (searchQuery.trim()) {
                      const query = searchQuery.toLowerCase();
                      displayList = displayList.filter(dest => 
                        dest.name?.toLowerCase().includes(query) ||
                        dest.category?.toLowerCase().includes(query) ||
                        dest.categoryName?.toLowerCase().includes(query) ||
                        dest.description?.toLowerCase().includes(query) ||
                        dest.address?.toLowerCase().includes(query) ||
                        dest.barangay?.toLowerCase().includes(query) ||
                        dest.city?.toLowerCase().includes(query)
                      );
                    }
                    
                    return displayList;
                  })().map((dest) => (
                    <Marker
                      key={dest.id}
                      position={[dest.latitude, dest.longitude]}
                    >
                      <Tooltip direction="top" offset={[0, -20]} opacity={0.95} permanent={false}>
                        <div className="text-center min-w-[150px]">
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {dest.categoryIconUrl ? (
                              <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-5 h-5 rounded object-cover" />
                            ) : (
                              <span className="text-lg">{dest.categoryIcon}</span>
                            )}
                            <p className="font-bold text-xs text-slate-900">{dest.name}</p>
                          </div>
                          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-600 mb-1">
                            {dest.categoryIconUrl ? (
                              <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-4 h-4 rounded object-cover" />
                            ) : (
                              <span>{dest.categoryIcon}</span>
                            )}
                            <span>{dest.categoryName}</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span>👣 {dest.visits}</span>
                            <span>⭐ {dest.reviews}</span>
                          </div>
                        </div>
                      </Tooltip>
                      <Popup>
                        <div className="p-2 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-2">
                            {dest.categoryIconUrl ? (
                              <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-7 h-7 rounded object-cover" />
                            ) : (
                              <span className="text-2xl">{dest.categoryIcon}</span>
                            )}
                            <h4 className="font-bold text-slate-900">{dest.name}</h4>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-2">
                            {dest.categoryIconUrl ? (
                              <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-4 h-4 rounded object-cover" />
                            ) : (
                              <span>{dest.categoryIcon}</span>
                            )}
                            <span>{dest.categoryName}</span>
                          </div>
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
                  ))}
                  
                  {(() => {
                    // Get base list based on view mode
                    let displayList = viewMode === 'all' ? destinations : viewMode === 'nearby' ? nearbyDestinations : savedDestinations;
                    
                    // Apply category filter
                    if (selectedCategory && selectedCategory !== 'all') {
                      displayList = displayList.filter(dest => 
                        dest.categoryName === selectedCategory || 
                        dest.category === selectedCategory ||
                        dest.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
                        dest.category?.toLowerCase() === selectedCategory.toLowerCase()
                      );
                    }
                    
                    // Apply search filter
                    if (searchQuery.trim()) {
                      const query = searchQuery.toLowerCase();
                      displayList = displayList.filter(dest => 
                        dest.name?.toLowerCase().includes(query) ||
                        dest.category?.toLowerCase().includes(query) ||
                        dest.categoryName?.toLowerCase().includes(query) ||
                        dest.description?.toLowerCase().includes(query) ||
                        dest.address?.toLowerCase().includes(query) ||
                        dest.barangay?.toLowerCase().includes(query) ||
                        dest.city?.toLowerCase().includes(query)
                      );
                    }
                    
                    return displayList.length === 0 && destinations.length === 0;
                  })() && (
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
                  <span className="text-lg font-bold text-teal-600">{destinations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Nearby (50km)</span>
                  <span className="text-lg font-bold text-blue-600">{nearbyDestinations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Saved</span>
                  <span className="text-lg font-bold text-purple-600">{savedDestinations.length}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-teal-200">
                  <span className="text-sm text-slate-700">Digital Footprints</span>
                  <span className="text-lg font-bold text-orange-600">
                    {destinations.reduce((sum, d) => sum + d.visits, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode Tabs */}
            <div className="bg-white rounded-xl border p-4">
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
                    const dropdown = document.getElementById('category-dropdown-admin');
                    if (dropdown) {
                      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                    }
                  }}
                  className="category-filter-button-admin w-full px-4 py-2 text-sm border border-teal-200 rounded-lg bg-white cursor-pointer flex items-center justify-between hover:border-teal-400 transition-colors"
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
                  id="category-dropdown-admin"
                  style={{ display: 'none' }}
                  className="absolute w-full mt-1 bg-white border border-teal-200 rounded-lg shadow-lg max-h-64 overflow-y-auto z-[60]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    onClick={() => {
                      setSelectedCategory('all');
                      document.getElementById('category-dropdown-admin').style.display = 'none';
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
                          document.getElementById('category-dropdown-admin').style.display = 'none';
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
                  onClick={() => setViewMode('all')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'all'
                      ? 'bg-teal-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({destinations.length})
                </button>
                <button
                  onClick={() => setViewMode('nearby')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'nearby'
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  📍 Nearby ({nearbyDestinations.length})
                </button>
                <button
                  onClick={() => setViewMode('saved')}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    viewMode === 'saved'
                      ? 'bg-purple-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  ⭐ Saved ({savedDestinations.length})
                </button>
              </div>

              {/* Locations List */}
              <h3 className="font-semibold text-slate-900 mb-3">
                {viewMode === 'all' ? 'All Locations' : viewMode === 'nearby' ? 'Nearby Locations' : 'Saved Locations'}
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
                {(() => {
                  let displayList = viewMode === 'all' ? destinations : viewMode === 'nearby' ? nearbyDestinations : savedDestinations;
                  
                  // Apply category filter
                  if (selectedCategory && selectedCategory !== 'all') {
                    displayList = displayList.filter(dest => 
                      dest.categoryName === selectedCategory || 
                      dest.category === selectedCategory ||
                      dest.categoryName?.toLowerCase() === selectedCategory.toLowerCase() ||
                      dest.category?.toLowerCase() === selectedCategory.toLowerCase()
                    );
                  }
                  
                  // Apply search filter
                  if (searchQuery.trim()) {
                    const query = searchQuery.toLowerCase();
                    displayList = displayList.filter(dest => 
                      dest.name?.toLowerCase().includes(query) ||
                      dest.category?.toLowerCase().includes(query) ||
                      dest.categoryName?.toLowerCase().includes(query) ||
                      dest.description?.toLowerCase().includes(query) ||
                      dest.address?.toLowerCase().includes(query) ||
                      dest.barangay?.toLowerCase().includes(query) ||
                      dest.city?.toLowerCase().includes(query)
                    );
                  }

                  if (displayList.length === 0) {
                    return (
                      <div className="text-center py-8 text-slate-500">
                        <div className="text-4xl mb-2">
                          {searchQuery ? '🔍' : viewMode === 'nearby' ? '📍' : viewMode === 'saved' ? '⭐' : '🗺️'}
                        </div>
                        <p className="text-sm">
                          {searchQuery 
                            ? 'No destinations found matching your search' 
                            : viewMode === 'nearby' 
                            ? 'No destinations nearby. Move around to discover more!' 
                            : viewMode === 'saved' 
                            ? 'No saved destinations yet. Click ⭐ to save!' 
                            : 'No destinations found'}
                        </p>
                      </div>
                    );
                  }

                  return displayList.map((dest) => (
                  <div
                    key={dest.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${getCategoryColor(dest.category)} rounded-lg flex items-center justify-center ${dest.categoryIconUrl ? 'bg-white' : 'text-white text-xl'} flex-shrink-0`}>
                        {dest.categoryIconUrl ? (
                          <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-7 h-7 rounded object-cover" />
                        ) : (
                          <span className="text-xl">{dest.categoryIcon}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-semibold text-slate-900 truncate">{dest.name}</h4>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveDestination(dest);
                            }}
                            className={`ml-2 p-1.5 rounded-lg transition-colors ${
                              isSaved(dest.id)
                                ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100'
                                : 'text-slate-400 hover:text-yellow-500 hover:bg-slate-100'
                            }`}
                            title={isSaved(dest.id) ? 'Remove from saved' : 'Save destination'}
                          >
                            <svg className="w-4 h-4" fill={isSaved(dest.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                          {dest.categoryIconUrl ? (
                            <img src={dest.categoryIconUrl} alt={dest.categoryName} className="w-4 h-4 rounded object-cover" />
                          ) : (
                            <span>{dest.categoryIcon}</span>
                          )}
                          <span>{dest.categoryName}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-600 mb-2">
                          <span>👣 {dest.visits}</span>
                          <span>⭐ {dest.reviews}</span>
                          {viewMode === 'nearby' && dest.distance && (
                            <span className="text-blue-600 font-semibold">📍 {dest.distance.toFixed(1)}km</span>
                          )}
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
                  ));
                })()}
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
        size={modalState.mode === 'view' ? 'full' : modalState.mode === 'edit' ? 'xl' : 'lg'}
        scrollable={modalState.mode === 'view'}
        title={
          modalState.mode === 'view' ? 'View Destination' : 
          modalState.mode === 'edit' ? 'Edit Destination' : 
          modalState.mode === 'qr' ? 'QR Code' : 
          'Add New Destination'
        }
        footer={
          modalState.mode === 'view' || modalState.mode === 'qr' ? (
            <Button 
              variant="outline" 
              onClick={() => setModalState({ isOpen: false, mode: '', data: null })}
            >
              Close
            </Button>
          ) : modalState.mode === 'edit' ? (
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
                onClick={handleUpdateDestination}
                disabled={saving}
                icon={
                  saving ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )
                }
              >
                {saving ? 'Updating...' : 'Update Destination'}
              </Button>
            </>
          ) : modalState.mode === 'add' && (
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
              {selectedDestination.categoryIconUrl ? (
                <img src={selectedDestination.categoryIconUrl} alt={selectedDestination.categoryName} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <span className="text-5xl">{getCategoryIcon(selectedDestination.category)}</span>
              )}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, destination: null })}
        onConfirm={confirmDeleteDestination}
        type="delete"
        title="Delete Destination"
        message={`Are you sure you want to delete "${deleteConfirm.destination?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        cancelText="Cancel"
      />
    </div>
    </div>
  );
});

AdminMap.displayName = 'AdminMap';

export default AdminMap;
