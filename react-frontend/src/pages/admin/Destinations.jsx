import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react';
import AdminHeader from '../../components/common/AdminHeader';
import toast from 'react-hot-toast';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import DestinationCard from '../../components/dashboard/DestinationCard';
import Button from '../../components/common/Button';
import { getCurrentAdmin } from '../../utils/adminHelper';
import Modal from '../../components/common/Modal';
import ToastNotification from '../../components/common/ToastNotification';
import SearchFilter from '../../components/common/SearchFilter';
import Pagination from '../../components/common/Pagination';
import FetchingIndicator from '../../components/common/FetchingIndicator';
import { DestinationSkeletonGrid } from '../../components/common/DestinationSkeleton';

// Auto-detect API URL based on hostname for mobile access
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check if using Laragon Apache or artisan serve
    return 'http://localhost/web_system_II/laravel-backend/public/api';
  }
  return `http://${hostname}:8000/api`;
};

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost/web_system_II/laravel-backend/public';
  }
  return `http://${hostname}:8000`;
};

const API_BASE_URL = getApiUrl();
const BASE_URL = getBaseUrl();

// Configure axios defaults for CSRF
axios.defaults.withCredentials = true;

// Helper to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Helper function to get CSRF cookie before state-changing requests
const getCsrfCookie = async () => {
  try {
    console.log('Fetching CSRF cookie from:', `${BASE_URL}/sanctum/csrf-cookie`);
    const response = await axios.get(`${BASE_URL}/sanctum/csrf-cookie`);
    console.log('CSRF cookie fetched successfully');
    console.log('Current cookies:', document.cookie);
    
    // Set the XSRF token in axios defaults
    const token = getCookie('XSRF-TOKEN');
    if (token) {
      axios.defaults.headers.common['X-XSRF-TOKEN'] = decodeURIComponent(token);
      console.log('XSRF-TOKEN set in axios headers');
    }
  } catch (error) {
    console.error('Failed to get CSRF cookie:', error);
  }
};

const Destinations = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: '',
    data: null,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Pagination and filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // 6 destinations per page
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Data states
  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  // Form state for add/edit
  const [formData, setFormData] = useState({
    name: '',
    category: 'hotel',
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

  const handleLogout = () => {
    navigate('/');
  };

  // Fetch categories from API with cache
  useEffect(() => {
    const cached = localStorage.getItem('cached_destination_categories');
    if (cached) {
      try {
        setCategories(JSON.parse(cached));
      } catch (e) {}
    }
    fetchCategories();
  }, []);

  // Check for new destination from map
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    
    if (action === 'add') {
      const coordsStr = sessionStorage.getItem('newDestinationCoords');
      if (coordsStr) {
        const coords = JSON.parse(coordsStr);
        sessionStorage.removeItem('newDestinationCoords');
        
        // Open add modal with pre-filled coordinates
        setTimeout(() => {
          setFormData(prev => ({
            ...prev,
            latitude: coords.latitude,
            longitude: coords.longitude
          }));
          setModalState({ isOpen: true, mode: 'add', data: null });
          toast.success('Coordinates auto-filled from map!');
          // Clean URL
          window.history.replaceState({}, '', '/admin/destinations');
        }, 500);
      } else {
        // No coordinates, just open add modal
        setTimeout(() => {
          setModalState({ isOpen: true, mode: 'add', data: null });
          window.history.replaceState({}, '', '/admin/destinations');
        }, 500);
      }
    }
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/categories`, {
        params: { per_page: 100 }
      });
      const data = response.data.data || [];
      setCategories(data.map(cat => ({
        id: cat.id,
        value: cat.id,
        label: `${cat.icon} ${cat.name}`,
        name: cat.name,
        icon: cat.icon
      })));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Standalone fetch function for manual refresh
  const fetchDestinations = async () => {
    try {
      setIsFetching(true);
      const response = await axios.get(`${API_BASE_URL}/destinations`, {
        params: {
          page: currentPage,
          per_page: itemsPerPage,
          search: searchQuery || undefined,
          category_id: selectedCategory !== 'all' ? selectedCategory : undefined,
        },
      });

      const data = response.data.data || [];
      const meta = response.data.meta || {};

      // Transform API data to match component structure
      const transformedDestinations = data.map(dest => ({
        id: dest.id,
        title: dest.name,
        name: dest.name,
        category: dest.category.name,
        categoryColor: 'bg-teal-100 text-teal-700',
        categoryIcon: dest.category.icon,
        description: dest.description || '',
        points: dest.points_reward,
        city: dest.address?.city || dest.city || '',
        province: dest.address?.province || dest.province || '',
        street: dest.address?.street || dest.street_address || '',
        barangay: dest.address?.barangay || dest.barangay || '',
        location: `${dest.address?.city || dest.city || ''}, ${dest.address?.province || dest.province || ''}`,
        rating: dest.stats?.average_rating || dest.average_rating || 0,
        latitude: dest.coordinates?.latitude || dest.latitude,
        longitude: dest.coordinates?.longitude || dest.longitude,
        visitors: dest.stats?.total_visits || dest.total_visits || 0,
        image_url: dest.images && dest.images.length > 0 ? dest.images.find(img => img.is_primary)?.image_path || dest.images[0]?.image_path : null,
        // Store full data for editing
        fullData: dest
      }));

      setDestinations(transformedDestinations);
      setTotalDestinations(meta.total || data.length);
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setIsFetching(false);
    }
  };

  // Fetch destinations when pagination/filters change
  useEffect(() => {
    fetchDestinations();
  }, [currentPage, itemsPerPage, searchQuery, selectedCategory]);

  // API handles filtering and pagination
  const totalPages = Math.ceil(totalDestinations / itemsPerPage);
  const paginatedDestinations = destinations;

  // Reset to page 1 when filters change
  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
    setIsFetching(true);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
    setIsFetching(true);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    setIsFetching(true); // Show skeleton immediately
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
    setIsFetching(true);
  };

  const openModal = (mode, data = null) => {
    setActiveSection('basic');
    if (data && mode === 'edit') {
      const fullData = data.fullData || {};
      setFormData({
        name: fullData.name || data.title || '',
        category: fullData.category?.id || '',
        description: fullData.description || data.description || '',
        fullDescription: fullData.full_description || fullData.description || '',
        address: fullData.address?.street || '',
        city: fullData.address?.city || data.city || '',
        province: fullData.address?.province || data.province || '',
        region: fullData.address?.region || '',
        latitude: fullData.coordinates?.latitude?.toString() || '',
        longitude: fullData.coordinates?.longitude?.toString() || '',
        pointsReward: fullData.points_reward || data.points || 50,
        contactNumber: fullData.contact?.phone || '',
        email: fullData.contact?.email || '',
        website: fullData.contact?.website || '',
        status: fullData.status || 'active',
        featured: fullData.is_featured || false,
        qrCode: fullData.qr_code || '',
        qrCodeImageUrl: fullData.qr_code_image_url || '',
        destination_id: fullData.id || data.id || null,
      });
      // Set images if available
      if (fullData.images && Array.isArray(fullData.images)) {
        const primaryIndex = fullData.images.findIndex(img => img.is_primary);
        const actualPrimaryIndex = primaryIndex >= 0 ? primaryIndex : 0;
        
        setImages(fullData.images.map((img, index) => {
          const imagePath = img.url || img.image_path;
          const imageUrl = imagePath.startsWith('http') 
            ? imagePath 
            : `http://localhost:8000/storage/${imagePath.replace(/^\/storage\//, '')}`;
          
          return {
            id: img.id || img.destination_images_id,
            url: imageUrl,
            preview: imageUrl,
            title: img.title,
            file: null,
            isPrimary: index === actualPrimaryIndex,
            isExisting: true
          };
        }));
        setPrimaryImageIndex(actualPrimaryIndex);
      } else {
        setImages([]);
      }
      
      // Set amenities if available
      if (fullData.amenities && Array.isArray(fullData.amenities)) {
        setSelectedAmenities(fullData.amenities.map(amenity => {
          if (typeof amenity === 'object') return amenity;
          // If amenity is a string/number, find matching from availableAmenities
          return availableAmenities.find(a => a.name === amenity || a.id === amenity) || amenity;
        }));
      } else {
        setSelectedAmenities([]);
      }
      
      // Set operating hours if available
      if (fullData.operating_hours && Array.isArray(fullData.operating_hours) && fullData.operating_hours.length > 0) {
        const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const hoursMap = {};
        fullData.operating_hours.forEach(hour => {
          hoursMap[hour.day] = hour;
        });
        setOperatingHours(daysOfWeek.map(day => ({
          day: day,
          opens: hoursMap[day]?.opens || '09:00',
          closes: hoursMap[day]?.closes || '18:00',
          isClosed: hoursMap[day]?.is_closed || false
        })));
      }
    } else if (mode === 'add') {
      // Reset form for new destination
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
        destination_id: null,
      });
      setImages([]);
      setSelectedAmenities([]);
    }
    setModalState({ isOpen: true, mode, data });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, mode: '', data: null });
    setActiveSection('basic');
  };

  const handleView = (destination) => openModal('view', destination);
  const handleEdit = (destination) => openModal('edit', destination);
  const handleDelete = (destination) => openModal('delete', destination);
  const handleAddDestination = () => openModal('add');

  const confirmDelete = async () => {
    if (!modalState.data || deleting) return; // Prevent multiple clicks

    try {
      setDeleting(true);
      closeModal();
      const toastId = toast.loading('Deleting destination...');

      await getCsrfCookie();
      await axios.delete(`${API_BASE_URL}/destinations/${modalState.data.id}`);
      
      toast.dismiss(toastId);
      toast.success('Destination deleted successfully!');
      setTotalDestinations(prev => prev - 1);
      // Refresh data in real-time
      await fetchDestinations();
    } catch (error) {
      console.error('Error deleting destination:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete destination';
      toast.error(errorMessage);
      await fetchDestinations();
    } finally {
      setDeleting(false);
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

      // Get CSRF cookie before making state-changing requests
      await getCsrfCookie();
      
      // Get auth token
      const token = localStorage.getItem('auth_token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      if (modalState.mode === 'edit') {
        // Validate destination ID exists
        const destinationId = modalState.data?.fullData?.id || modalState.data?.id;
        if (!destinationId) {
          toast.error('Invalid destination ID');
          setSaving(false);
          return;
        }
        
        console.log('Updating destination ID:', destinationId);
        console.log('Full destination data:', modalState.data);
        console.log('API URL:', `${API_BASE_URL}/destinations/${destinationId}`);
        const response = await axios.put(`${API_BASE_URL}/destinations/${destinationId}`, destinationData, { headers });
        const updatedDest = response.data.data;
        
        // Upload new images if any
        const uploadedImages = [];
        const newImagesToUpload = images.filter(img => img.file);
        if (newImagesToUpload.length > 0) {
          for (const image of newImagesToUpload) {
            const imageFormData = new FormData();
            imageFormData.append('image', image.file);
            imageFormData.append('destination_id', destinationId);
            imageFormData.append('title', image.caption || image.file.name);
            imageFormData.append('is_primary', image.isPrimary || images.indexOf(image) === primaryImageIndex ? '1' : '0');
            
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
        
        closeModal();
        toast.success('Destination updated successfully!');
        // Refresh data in real-time
        await fetchDestinations();
      } else {
        const response = await axios.post(`${API_BASE_URL}/destinations`, destinationData, { headers });
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
        
        closeModal();
        toast.success('Destination added successfully!');
        setTotalDestinations(prev => prev + 1);
        // Refresh data in real-time
        await fetchDestinations();
      }
    } catch (error) {
      console.error('Error saving destination:', error);
      console.error('Error details:', error.response?.data);
      
      let errorMessage = 'Failed to save destination';
      
      if (error.response?.status === 404) {
        errorMessage = 'Destination not found. Please refresh and try again.';
        await fetchDestinations();
      } else if (error.response?.status === 422) {
        // Validation errors
        if (error.response?.data?.errors) {
          const errors = error.response.data.errors;
          errorMessage = Object.values(errors).flat().join('\n');
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.response?.status === 500) {
        // Server errors - parse SQL errors
        const message = error.response?.data?.message || '';
        if (message.includes('Duplicate entry')) {
          if (message.includes('slug')) {
            errorMessage = 'A destination with this name already exists. Please use a different name.';
          } else if (message.includes('qr_code')) {
            errorMessage = 'QR code already exists. Please generate a new one.';
          } else {
            errorMessage = 'Duplicate entry detected. Please check your input.';
          }
        } else if (message.includes('SQLSTATE')) {
          errorMessage = 'Database error. Please contact administrator.';
        } else {
          errorMessage = error.response.data.message || 'Server error occurred.';
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Generate QR Code based on category, name, and ID
  const generateQRCode = () => {
    const categoryObj = categories.find(c => c.id === parseInt(formData.category));
    const categoryName = categoryObj?.name || 'GENERAL';
    const destinationName = formData.name || 'DEST';
    const destinationId = formData.destination_id || Math.floor(Math.random() * 1000) + 1;
    
    // Format: CATEGORY-DESTNAME(3-5chars)-ID(zero-padded)
    const namePrefix = destinationName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 5)
      .padEnd(3, 'X');
    
    const idSuffix = String(destinationId).padStart(3, '0');
    
    return `${categoryName.toUpperCase()}-${namePrefix}-${idSuffix}`;
  };

  // Convert QR Code SVG to Data URI
  const generateQRCodeDataURI = (qrCodeValue) => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    document.body.appendChild(container);

    // Create QR code SVG element
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '300');
    
    // Use qrcode library to generate QR code
    // For now, we'll create a simple data URI format
    // In production, you'd use a proper QR code generation library
    const qrCodeDataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(qrCodeValue)}`;
    
    // Clean up
    document.body.removeChild(container);
    
    return qrCodeDataUri;
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Auto-fetch postal code when city or province changes
    if (name === 'city' || name === 'province') {
      const updatedFormData = { ...formData, [name]: newValue };
      
      // Only fetch if both city and province are filled
      if (updatedFormData.city && updatedFormData.province) {
        try {
          const response = await axios.post(`${API_BASE_URL}/address/postal-code`, {
            city: updatedFormData.city,
            province: updatedFormData.province
          });
          
          if (response.data.success && response.data.data.postal_code) {
            setFormData(prev => ({
              ...prev,
              postalCode: response.data.data.postal_code
            }));
            toast.success(`Postal code auto-filled: ${response.data.data.postal_code}`);
          }
        } catch (error) {
          console.log('Could not auto-fetch postal code:', error);
          // Silently fail - postal code might not be in our database
        }
      }
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      caption: file.name,
      file: file
    }));
    setImages(prev => [...prev, ...newImages]);
    toast.success(`${files.length} image(s) uploaded successfully`);
  };

  const handleRemoveImage = async (imageIdOrIndex) => {
    const imageToRemove = images.find((img, idx) => img.id === imageIdOrIndex || idx === imageIdOrIndex);
    
    // If it's an existing image from database, delete it via API
    if (imageToRemove && imageToRemove.isExisting && imageToRemove.id) {
      try {
        await getCsrfCookie();
        await axios.delete(`${API_BASE_URL}/destination-images/${imageToRemove.id}`);
        toast.success('Image deleted from server');
      } catch (error) {
        console.error('Error deleting image:', error);
        toast.error('Failed to delete image from server');
        return;
      }
    }
    
    setImages(prev => prev.filter((img, idx) => img.id !== imageIdOrIndex && idx !== imageIdOrIndex));
    if (primaryImageIndex >= images.length - 1) {
      setPrimaryImageIndex(Math.max(0, images.length - 2));
    }
    toast.success('Image removed');
  };

  const handleSetPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
    // Update images array to reflect only one primary
    setImages(prev => prev.map((img, idx) => ({
      ...img,
      isPrimary: idx === index
    })));
    toast.success('Primary image updated');
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities(prev => {
      const exists = prev.some(a => (a.id || a) === (amenity.id || amenity));
      if (exists) {
        return prev.filter(a => (a.id || a) !== (amenity.id || amenity));
      } else {
        return [...prev, amenity];
      }
    });
  };

  const [customAmenity, setCustomAmenity] = useState({ name: '', icon: '✨' });

  const handleAddCustomAmenity = () => {
    if (!customAmenity.name.trim()) {
      toast.error('Please enter amenity name');
      return;
    }
    const newAmenity = {
      id: Date.now(),
      name: customAmenity.name,
      icon: customAmenity.icon
    };
    setSelectedAmenities(prev => [...prev, newAmenity]);
    setCustomAmenity({ name: '', icon: '✨' });
    toast.success('Custom amenity added');
  };

  const handleOperatingHoursChange = (index, field, value) => {
    setOperatingHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleGetCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported by your browser');
      return;
    }

    const toastId = toast.loading('🌍 Getting your location...');
    
    // Try high accuracy first, then fallback to fast/low accuracy
    const tryGetLocation = (useHighAccuracy) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: useHighAccuracy,
            timeout: useHighAccuracy ? 15000 : 30000, // Longer timeout for laptops
            maximumAge: useHighAccuracy ? 0 : 300000 // Cache for 5 minutes on low accuracy
          }
        );
      });
    };

    let position;
    try {
      // First attempt: High accuracy
      position = await tryGetLocation(true);
    } catch (highAccError) {
      console.log('High accuracy failed, trying fast mode...');
      toast.loading('⚡ Trying faster location...', { id: toastId });
      try {
        // Second attempt: Fast/approximate location
        position = await tryGetLocation(false);
      } catch (fastError) {
        toast.dismiss(toastId);
        
        let errorMessage = '❌ Could not get location';
        let duration = 5000;
        
        switch(fastError.code) {
          case 1:
            errorMessage = '🔒 Location Permission Denied\n\nMobile: Settings → Browser → Allow Location\nDesktop: Click lock icon in address bar → Allow Location\n\nNote: Some browsers block location on HTTP (non-HTTPS) sites';
            duration = 10000;
            break;
          case 2:
            errorMessage = '📶 Location Unavailable\n\nTry:\n1. Enable GPS/Location Services\n2. Check internet connection\n3. Use Google Maps to find coordinates\n4. Or enter coordinates manually below';
            duration = 8000;
            break;
          case 3:
            errorMessage = '⏱️ Location Timeout\n\nYour device is taking too long\n\nAlternative: Use Google Maps\n→ Right-click location → Copy coordinates\n→ Paste in Latitude/Longitude fields';
            duration = 9000;
            break;
        }
        
        toast.error(errorMessage, { 
          duration,
          style: {
            maxWidth: '500px',
            whiteSpace: 'pre-line'
          }
        });
        console.error('Geolocation error:', fastError);
        console.error('Error details:', {
          code: fastError.code,
          message: fastError.message,
          PERMISSION_DENIED: fastError.code === 1,
          POSITION_UNAVAILABLE: fastError.code === 2,
          TIMEOUT: fastError.code === 3
        });
        return;
      }
    }

    // Successfully got position
    const lat = position.coords.latitude.toFixed(6);
    const lng = position.coords.longitude.toFixed(6);
    const accuracy = position.coords.accuracy;
    
    const accuracyText = accuracy < 100 ? `${Math.round(accuracy)}m` : `${(accuracy/1000).toFixed(1)}km`;
    if (accuracy > 5000) {
      toast(`⚠️ Approximate (±${accuracyText})`, { 
        icon: '⚠️',
        duration: 5000,
        style: { background: '#fef3c7', color: '#92400e' },
        id: toastId
      });
    } else {
      toast.loading(`📍 Found (±${accuracyText})`, { id: toastId });
    }
    
    console.log(`📍 Location: ${lat}, ${lng} (±${accuracyText})`);
    
    // Try backend API for Philippine addresses
    try {
      const response = await axios.post(`${API_BASE_URL}/address/from-gps`, {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng)
      });
      
      if (response.data.success && response.data.data) {
        const addressData = response.data.data;
        
        // Try to get street address from OpenStreetMap
        let streetAddress = '';
        try {
          const osmResponse = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            { headers: { 'User-Agent': 'TravelQuest/1.0' } }
          );
          const osmData = await osmResponse.json();
          if (osmData && osmData.address) {
            const addr = osmData.address;
            const streetParts = [
              addr.house_number,
              addr.road || addr.street || addr.neighbourhood
            ].filter(Boolean);
            streetAddress = streetParts.join(', ');
          }
        } catch (osmError) {
          console.log('Could not fetch street from OSM:', osmError);
        }
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: streetAddress || prev.address,
          barangay: addressData.barangay || prev.barangay,
          city: addressData.city || prev.city,
          province: addressData.province || prev.province,
          region: addressData.region || prev.region,
          postalCode: addressData.postal_code || prev.postalCode
        }));
        
        toast.dismiss(toastId);
        toast.success(`📍 ${addressData.city}, ${addressData.province} (±${accuracyText})`, { duration: 5000 });
        return;
      }
    } catch (backendError) {
      console.log('Backend geocoding not available, trying fallback...', backendError);
    }
    
    // Fallback to OpenStreetMap for international or unmapped locations
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'TravelQuest/1.0'
          }
        }
      );
      const data = await response.json();
      
      if (data && data.address) {
        const addr = data.address;
        // Build detailed street address
        const streetParts = [
          addr.house_number,
          addr.road || addr.street,
          addr.suburb || addr.neighbourhood || addr.village || addr.hamlet
        ].filter(Boolean);
        
        const city = addr.city || addr.town || addr.municipality || '';
        const province = addr.province || addr.state || '';
        const barangay = addr.suburb || addr.village || addr.hamlet || '';
        
        // Try to get postal code from our backend based on city/province
        let postalCode = addr.postcode || '';
        if (city && province && !postalCode) {
          try {
            const postalResponse = await axios.post(`${API_BASE_URL}/address/postal-code`, {
              city: city,
              province: province
            });
            if (postalResponse.data.success) {
              postalCode = postalResponse.data.data.postal_code;
            }
          } catch (postalError) {
            console.log('Could not fetch postal code:', postalError);
          }
        }
        
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng,
          address: streetParts.join(', ') || addr.display_name?.split(',')[0] || '',
          barangay: barangay,
          city: city,
          province: province,
          region: addr.region || prev.region,
          postalCode: postalCode
        }));
        
        toast.dismiss(toastId);
        toast.success(`📍 ${city || 'Unknown'}, ${province || 'Unknown'} (±${accuracyText})`, { duration: 5000 });
      } else {
        // Fallback if geocoding fails
        setFormData(prev => ({
          ...prev,
          latitude: lat,
          longitude: lng
        }));
        toast.dismiss(toastId);
        toast(`📍 Coordinates captured (±${accuracyText}). Please enter address manually.`, { 
          icon: '⚠️',
          duration: 5000 
        });
      }
    } catch (geocodingError) {
      console.error('Geocoding error:', geocodingError);
      // Final fallback: coordinates only
      setFormData(prev => ({
        ...prev,
        latitude: lat,
        longitude: lng
      }));
      toast.dismiss(toastId);
      toast.info(`📍 ${lat}, ${lng} (±${accuracyText})`, { duration: 4000 });
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'images', label: 'Images', icon: '📷' },
    { id: 'amenities', label: 'Amenities', icon: '✨' },
    { id: 'hours', label: 'Hours', icon: '🕐' },
    { id: 'qrcode', label: 'QR Code', icon: '📱' },
    { id: 'contact', label: 'Contact', icon: '📞' },
  ];

  const renderModalContent = () => {
    const { mode, data } = modalState;

    if (mode === 'view' && data) {
      const fullData = data.fullData || {};
      const primaryImage = fullData.images?.find(img => img.is_primary) || fullData.images?.[0];
      const imageUrl = primaryImage 
        ? (primaryImage.url || primaryImage.image_path || '').startsWith('http') 
          ? (primaryImage.url || primaryImage.image_path)
          : `http://localhost:8000/storage/${(primaryImage.url || primaryImage.image_path || '').replace(/^\/storage\//, '')}`
        : data.image_url;
      
      return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 scrollbar-hide">
          {/* Featured Image */}
          {imageUrl && (
            <div className="relative -mx-6 -mt-6 mb-6">
              <img
                src={imageUrl}
                alt={data.title}
                className="w-full h-56 object-contain bg-slate-100"
              />
              <div className="absolute top-4 right-4 bg-teal-500 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg">
                +{data.points} pts
              </div>
              <div className="absolute bottom-4 left-4">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${data.categoryColor} shadow-lg`}>
                  <span>{data.categoryIcon}</span>
                  <span>{data.category}</span>
                </span>
              </div>
            </div>
          )}
          
          {/* Header */}
          <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg">
              {data.categoryIcon}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">{data.title}</h2>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${data.categoryColor} mt-2`}>
                <span>{data.categoryIcon}</span>
                <span>{data.category}</span>
              </span>
            </div>
          </div>

          {/* Basic Info Section */}
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-5 border border-slate-200">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <span className="text-2xl">📝</span>
              <span>Basic Information</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Destination Name</label>
                <p className="text-sm font-medium text-slate-900">{data.title}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Status</label>
                <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${fullData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {fullData.status || 'active'}
                </span>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Description</label>
                <p className="text-sm text-slate-900">{data.description}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Points Reward</label>
                <p className="text-lg font-bold text-teal-600">{data.points} pts</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Rating</label>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500 text-xl">⭐</span>
                  <span className="text-lg font-bold text-slate-900">{data.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-5 border border-teal-200">
            <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
              <span className="text-2xl">📍</span>
              <span>Location Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">Street Address</label>
                <p className="text-sm text-slate-900">{fullData.address?.street || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">City</label>
                <p className="text-sm text-slate-900">{data.city}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Province</label>
                <p className="text-sm text-slate-900">{data.province}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Region</label>
                <p className="text-sm text-slate-900">{fullData.address?.region || 'N/A'}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">GPS Coordinates</label>
                <p className="text-sm text-slate-900">{fullData.coordinates?.latitude || 'N/A'}, {fullData.coordinates?.longitude || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Contact Information Section */}
          {(fullData.contact?.phone || fullData.contact?.email || fullData.contact?.website) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <span className="text-2xl">📞</span>
                <span>Contact Information</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {fullData.contact?.phone && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Phone Number</label>
                    <p className="text-sm text-slate-900">{fullData.contact.phone}</p>
                  </div>
                )}
                {fullData.contact?.email && (
                  <div>
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
                    <p className="text-sm text-slate-900">{fullData.contact.email}</p>
                  </div>
                )}
                {fullData.contact?.website && (
                  <div className="md:col-span-2">
                    <label className="text-xs font-medium text-slate-600 mb-1 block">Website</label>
                    <a href={fullData.contact.website} target="_blank" rel="noopener noreferrer" className="text-sm text-teal-600 hover:underline">{fullData.contact.website}</a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Amenities Section */}
          {fullData.amenities && fullData.amenities.length > 0 && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-5 border border-purple-200">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <span className="text-2xl">✨</span>
                <span>Amenities</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {fullData.amenities.map((amenity, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-lg text-sm font-medium text-slate-700 border border-slate-200">
                    <span>{amenity.icon}</span>
                    <span>{amenity.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Operating Hours Section */}
          {fullData.operating_hours && fullData.operating_hours.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-200">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-slate-900 mb-4">
                <span className="text-2xl">🕐</span>
                <span>Operating Hours</span>
              </h3>
              <div className="space-y-2">
                {fullData.operating_hours.map((hour, index) => (
                  <div key={index} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                    <span className="text-sm font-medium text-slate-900">{hour.day}</span>
                    <span className="text-sm text-slate-600">
                      {hour.is_closed ? (
                        <span className="text-red-600 font-medium">Closed</span>
                      ) : (
                        `${hour.opens} - ${hour.closes}`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (mode === 'delete' && data) {
      return (
        <div className="text-center py-6">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-br from-teal-100 to-teal-200 mb-6 animate-pulse">
            <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xs font-medium text-slate-900 mb-3">Delete Destination?</h3>
          <p className="text-slate-600 mb-2 text-lg">You're about to delete</p>
          <p className="text-xs font-medium text-red-600 mb-4">"{data.title}"</p>
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
            <p className="text-sm text-red-800">⚠️ This action cannot be undone. All data associated with this destination will be permanently removed.</p>
          </div>
        </div>
      );
    }

    if (mode === 'add' || mode === 'edit') {
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
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
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
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="grid grid-cols-3 gap-x-3 gap-y-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Street</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Purok 3"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
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
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Region <span className="text-red-500">*</span></label>
                <select
                  name="region"
                  value={formData.region}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Select Region</option>
                  <option value="Region IV-A">Region IV-A</option>
                  <option value="Region IV-B">Region IV-B</option>
                  <option value="NCR">NCR</option>
                  <option value="CAR">CAR</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Postal</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="5211"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Latitude <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="12.74255"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Longitude <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="121.48996"
                  className="w-full px-2 py-1 text-sm bg-white text-slate-900 border border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                />
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
                        <div className="absolute top-1 left-1 bg-teal-500 text-white px-1.5 py-0.5 rounded text-xs font-bold shadow-md">
                          1st
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-1 rounded">
                        {index !== primaryImageIndex && (
                          <button
                            onClick={() => handleSetPrimaryImage(index)}
                            className="bg-white text-slate-900 px-1.5 py-0.5 rounded text-xs opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity shadow-md font-medium"
                          >
                            1st
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
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Amenities & Features</h3>
              <div className="grid grid-cols-3 gap-2">
                {availableAmenities.map((amenity) => {
                  const isSelected = selectedAmenities.some(a => 
                    (typeof a === 'object' ? a.id : a) === amenity.id || 
                    (typeof a === 'object' ? a.name : a) === amenity.name
                  );
                  return (
                    <button
                      key={amenity.id}
                      onClick={() => handleAmenityToggle(amenity)}
                      className={`flex items-center gap-1.5 px-2 py-1.5 rounded border transition-all ${
                        isSelected
                          ? 'border-teal-500 bg-teal-50 text-teal-900'
                          : 'border-slate-200 bg-white hover:border-slate-300 text-slate-900'
                      }`}
                    >
                      <span className="text-base">{amenity.icon}</span>
                      <span className="text-xs font-medium">{amenity.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Amenity Input */}
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
            <div className="space-y-3">
              <h3 className="font-medium text-slate-900">Operating Hours</h3>
              <div className="grid grid-cols-3 gap-2">
                {operatingHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex flex-col gap-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900 text-xs">{schedule.day}</span>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={schedule.isClosed}
                          onChange={(e) => handleOperatingHoursChange(index, 'isClosed', e.target.checked)}
                          className="w-3 h-3 text-teal-500 rounded"
                        />
                        <span className="text-xs text-slate-600">Closed</span>
                      </label>
                    </div>
                    {!schedule.isClosed && (
                      <div className="flex items-center gap-1">
                        <input
                          type="time"
                          value={schedule.opens}
                          onChange={(e) => handleOperatingHoursChange(index, 'opens', e.target.value)}
                          className="flex-1 px-1.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                        />
                        <span className="text-slate-400 text-xs">-</span>
                        <input
                          type="time"
                          value={schedule.closes}
                          onChange={(e) => handleOperatingHoursChange(index, 'closes', e.target.value)}
                          className="flex-1 px-1.5 py-1 bg-white border border-slate-200 rounded text-xs text-slate-900"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* QR Code Section */}
          {activeSection === 'qrcode' && (
            <div className="space-y-3">
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
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ Info:</strong> QR codes are automatically generated based on the destination's category, name, and ID. 
                  Users will scan this QR code when they visit the destination to earn points and leave a review.
                </p>
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
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 relative pb-20 sm:pb-0">
      
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
      {/* Main Content */}
      <main 
        className={`
          relative z-10
          ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'} 
          max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10 md:pb-12
        `}
      >
        {/* Page Header with Add Button */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Destinations</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your travel destinations</p>
            </div>
            <Button
              variant="primary"
              onClick={handleAddDestination}
              icon={<Plus className="w-5 h-5" />}
              className="bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700"
            >
              Add Destination
            </Button>
          </div>
        </div>

        {destinations.length === 0 && isFetching ? (
          <div className="space-y-6">
            <div className="mb-4">
              <div className="h-8 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded-lg w-64 animate-pulse"></div>
            </div>
            <DestinationSkeletonGrid count={6} />
          </div>
        ) : destinations.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <p className="text-slate-600 text-lg">No destinations found</p>
              <Button 
                variant="primary" 
                onClick={handleAddDestination}
                icon={<Plus className="w-5 h-5" />}
                className="bg-gradient-to-r from-teal-500 to-cyan-600"
              >
                Add First Destination
              </Button>
            </div>
          </div>
        ) : (
          <>
        {/* Results Count - Clean Typography */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {totalDestinations} Destinations Found
          </h2>
        </div>

        {/* Cards Grid */}
        {paginatedDestinations.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-6 relative">
              {paginatedDestinations.map((destination) => (
                <div key={destination.id}>
                  <DestinationCard
                    title={destination.title}
                    category={destination.category}
                    categoryColor={destination.categoryColor}
                    categoryIcon={destination.categoryIcon}
                    description={destination.description}
                    points={destination.points}
                    location={destination.location}
                    street={destination.street}
                    barangay={destination.barangay}
                    rating={destination.rating}
                    image_url={destination.image_url}
                    latitude={destination.latitude}
                    longitude={destination.longitude}
                    visitors={destination.visitors}
                    onView={() => handleView(destination)}
                    onEdit={() => handleEdit(destination)}
                    onDelete={() => handleDelete(destination)}
                  />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalDestinations > itemsPerPage && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalDestinations}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            )}
          </>
        ) : (
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xs font-medium text-slate-900 mb-2">No destinations found</h3>
              <p className="text-slate-600 mb-4">Try adjusting your search or filter criteria</p>
              <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          </div>
        )}
        </>
        )}
      </main>
      <Modal 
        isOpen={modalState.isOpen} 
        onClose={closeModal}
        titleIcon={
          modalState.mode === 'view' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          ) : modalState.mode === 'edit' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          ) : modalState.mode === 'delete' ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          )
        }
        title={
          modalState.mode === 'view' ? 'View Destination' : 
          modalState.mode === 'edit' ? 'Edit Destination' : 
          modalState.mode === 'delete' ? 'Confirm Delete' : 
          'Add New Destination'
        } 
        footer={
          modalState.mode === 'view' ? (
            <Button 
              variant="outline" 
              onClick={closeModal}
              icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
            >
              View
            </Button>
          ) : modalState.mode === 'delete' ? (
            <>
              <Button variant="outline" onClick={closeModal} disabled={deleting}>Cancel</Button>
              <Button 
                variant="danger" 
                onClick={confirmDelete}
                disabled={deleting}
                icon={deleting ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                )}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
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
                      
                      return modalState.mode === 'add' ? 
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> :
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
                    })()
                  )
                }
              >
                {saving ? 'Saving...' : (() => {
                  const currentIndex = sections.findIndex(s => s.id === activeSection);
                  const isLastSection = currentIndex === sections.length - 1;
                  
                  if (!isLastSection) return 'Next';
                  return modalState.mode === 'add' ? 'Add Destination' : 'Update Destination';
                })()}
              </Button>
            </>
          )
        } 
        size={modalState.mode === 'view' ? 'xl' : modalState.mode === 'delete' ? 'sm' : '2xl'}
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default Destinations;


