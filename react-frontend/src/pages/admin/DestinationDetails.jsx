import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { slideInFromRight, fadeIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';
import { getCurrentAdmin } from '../../utils/adminHelper';
import QRCode from 'qrcode';

const DestinationDetails = () => {
  const { id } = useParams(); // Get destination ID from URL
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const isEditMode = id && id !== 'new'; // Check if ID exists AND is not 'new'

  console.log('DestinationDetails - ID:', id, 'isEditMode:', isEditMode);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'hotel',
    description: '',
    fullDescription: '',
    address: '',
    city: '',
    province: '',
    region: '',
    latitude: '',
    longitude: '',
    pointsReward: 50,
    contactNumber: '',
    email: '',
    website: '',
    status: 'active',
    featured: false,
  });

  // Images state
  const [images, setImages] = useState([]);
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Active tab for sections
  const [activeSection, setActiveSection] = useState('basic');

  // QR Code state
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const qrCanvasRef = useRef(null);

  useEffect(() => {
    if (isEditMode && id) {
      fetchDestinationDetails();
    }
  }, [id, isEditMode]);

  const fetchDestinationDetails = async () => {
    try {
      // TODO: Replace with actual API call - For now using mock data based on ID
      
      // Mock database of destinations
      const mockDestinations = {
        '1': {
          name: 'Grand Hotel Resort',
          category: 'hotel',
          description: 'Luxury resort with excellent amenities',
          fullDescription: 'Experience luxury at its finest with our world-class amenities, spacious rooms, and breathtaking views.',
          address: '123 Main Street, Barangay Centro',
          city: 'Manila',
          province: 'Metro Manila',
          region: 'NCR',
          latitude: '14.5995',
          longitude: '120.9842',
          pointsReward: 50,
          contactNumber: '+63 912 345 6789',
          email: 'info@grandhotel.com',
          website: 'https://grandhotel.com',
          status: 'active',
          featured: true,
          images: [
            { id: 1, url: 'https://via.placeholder.com/400x300/3B82F6/FFFFFF?text=Hotel+Main', caption: 'Main Building' },
            { id: 2, url: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Pool', caption: 'Swimming Pool' },
            { id: 3, url: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Restaurant', caption: 'Restaurant' },
          ],
          amenities: [1, 2, 3, 4, 6, 7],
        },
        '2': {
          name: 'Organic Farm Experience',
          category: 'agri farm',
          description: 'Farm tours and organic produce',
          fullDescription: 'Discover sustainable farming practices and enjoy fresh organic vegetables straight from our farm.',
          address: 'Km 45 National Highway',
          city: 'Tagaytay',
          province: 'Cavite',
          region: 'Region IV-A',
          latitude: '14.1165',
          longitude: '120.9602',
          pointsReward: 30,
          contactNumber: '+63 917 222 3333',
          email: 'contact@organicfarm.ph',
          website: 'https://organicfarm.ph',
          status: 'active',
          featured: false,
          images: [
            { id: 1, url: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Farm+View', caption: 'Farm Landscape' },
            { id: 2, url: 'https://via.placeholder.com/400x300/84CC16/FFFFFF?text=Vegetables', caption: 'Fresh Produce' },
          ],
          amenities: [2, 8, 11],
        },
        '3': {
          name: 'Mountain Peak Viewpoint',
          category: 'tourist spot',
          description: 'Scenic mountain views and hiking trails',
          fullDescription: 'Breathtaking panoramic views await you at the summit. Perfect for nature lovers and adventure seekers.',
          address: 'Barangay Mountainside',
          city: 'Baguio',
          province: 'Benguet',
          region: 'CAR',
          latitude: '16.4023',
          longitude: '120.5960',
          pointsReward: 100,
          contactNumber: '+63 920 444 5555',
          email: 'info@mountainpeak.ph',
          website: 'https://mountainpeak.ph',
          status: 'active',
          featured: true,
          images: [
            { id: 1, url: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Mountain+View', caption: 'Summit View' },
            { id: 2, url: 'https://via.placeholder.com/400x300/6366F1/FFFFFF?text=Trail', caption: 'Hiking Trail' },
            { id: 3, url: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Sunrise', caption: 'Sunrise at Peak' },
          ],
          amenities: [2, 11],
        },
      };

      // Get the specific destination data based on ID
      const destinationData = mockDestinations[id];
      
      if (destinationData) {
        setFormData({
          name: destinationData.name,
          category: destinationData.category,
          description: destinationData.description,
          fullDescription: destinationData.fullDescription,
          address: destinationData.address,
          city: destinationData.city,
          province: destinationData.province,
          region: destinationData.region,
          latitude: destinationData.latitude,
          longitude: destinationData.longitude,
          pointsReward: destinationData.pointsReward,
          contactNumber: destinationData.contactNumber,
          email: destinationData.email,
          website: destinationData.website,
          status: destinationData.status,
          featured: destinationData.featured,
        });

        // Set images
        setImages(destinationData.images || []);
        
        // Set amenities
        setSelectedAmenities(destinationData.amenities || []);
      } else {
        toast.error(`Destination with ID ${id} not found`);
      }
    } catch (error) {
      toast.error('Failed to load destination details');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadingImage(true);

    // Simulate upload
    setTimeout(() => {
      const newImages = files.map((file, index) => ({
        id: Date.now() + index,
        url: URL.createObjectURL(file),
        caption: file.name,
        file: file
      }));
      setImages(prev => [...prev, ...newImages]);
      setUploadingImage(false);
      toast.success(`${files.length} image(s) uploaded successfully`);
    }, 1000);
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
    toast.success('Image removed');
  };

  const handleSetPrimaryImage = (index) => {
    setPrimaryImageIndex(index);
    toast.success('Primary image updated');
  };

  const handleAmenityToggle = (amenityId) => {
    setSelectedAmenities(prev => {
      if (prev.includes(amenityId)) {
        return prev.filter(id => id !== amenityId);
      } else {
        return [...prev, amenityId];
      }
    });
  };

  const handleOperatingHoursChange = (index, field, value) => {
    setOperatingHours(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      toast.loading('Getting your location...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
          toast.dismiss();
          toast.success('Location captured!');
        },
        (error) => {
          toast.dismiss();
          toast.error('Failed to get location');
        }
      );
    } else {
      toast.error('Geolocation not supported');
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      console.log('Generating QR code...');
      // Generate QR code data with destination info
      const qrData = JSON.stringify({
        type: 'destination',
        id: id || 'new',
        name: formData.name,
        category: formData.category,
        timestamp: new Date().toISOString()
      });
      console.log('QR Data:', qrData);

      // Generate QR code as data URL
      const qrDataUrl = await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0F172A',
          light: '#FFFFFF'
        }
      });

      console.log('QR Code generated:', qrDataUrl.substring(0, 50) + '...');
      setQrCodeUrl(qrDataUrl);
      toast.success('QR Code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;
    
    const link = document.createElement('a');
    link.download = `${formData.name || 'destination'}-qrcode.png`;
    link.href = qrCodeUrl;
    link.click();
    toast.success('QR Code downloaded');
  };

  const handleSave = async () => {
    try {
      // Validation
      if (!formData.name || !formData.category) {
        toast.error('Please fill in required fields');
        return;
      }

      const destinationData = {
        ...formData,
        images,
        primaryImageIndex,
        amenities: selectedAmenities,
        operatingHours: operatingHours.filter(h => !h.isClosed),
      };

      if (isEditMode) {
        // TODO: API call to UPDATE existing destination
        console.log('Updating destination ID:', id, destinationData);
        toast.success('Destination updated successfully!');
      } else {
        // TODO: API call to CREATE new destination
        console.log('Creating new destination:', destinationData);
        toast.success('Destination created successfully!');
      }
      
      setTimeout(() => navigate('/admin/destinations'), 1500);
    } catch (error) {
      toast.error('Failed to save destination');
    }
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'location', label: 'Location', icon: '📍' },
    { id: 'images', label: 'Images', icon: '📷' },
    { id: 'amenities', label: 'Amenities', icon: '✨' },
    { id: 'hours', label: 'Operating Hours', icon: '🕐' },
    { id: 'contact', label: 'Contact Info', icon: '📞' },
  ];

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative overflow-y-auto scrollbar-hide">
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
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-cyan-700 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xs font-medium text-slate-900">
                {isEditMode ? 'Edit Destination' : 'Add New Destination'}
              </h2>
              <p className="text-slate-600 text-xs">
                {isEditMode 
                  ? `Update information for ${formData.name || 'this destination'}` 
                  : 'Create a new destination for travelers to explore'}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section Navigation */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-2 min-w-max">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-teal-500 text-white shadow-md'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{section.icon}</span>
                <span className="whitespace-nowrap">{section.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Content Sections */}
        <motion.div
          variants={slideInFromRight}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-8"
        >
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-8">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Destination Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Destination Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter destination name"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="hotel">🏨 Hotel</option>
                    <option value="agri farm">🌾 Agricultural Farm</option>
                    <option value="tourist spot">⛰️ Tourist Spot</option>
                    <option value="restaurant">🍽️ Restaurant</option>
                    <option value="attraction">🎡 Attraction</option>
                  </select>
                </div>

                {/* Points Reward */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Points Reward
                  </label>
                  <input
                    type="number"
                    name="pointsReward"
                    value={formData.pointsReward}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  />
                </div>

                {/* Short Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Short Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Brief description (shown in cards)"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Full Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Full Description
                  </label>
                  <textarea
                    name="fullDescription"
                    value={formData.fullDescription}
                    onChange={handleInputChange}
                    rows="6"
                    placeholder="Detailed description"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>

                {/* Featured */}
                <div className="flex items-center">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="featured"
                      checked={formData.featured}
                      onChange={handleInputChange}
                      className="w-5 h-5 text-teal-500 border-2 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-slate-700">Featured Destination</span>
                      <p className="text-xs text-slate-500">Show on homepage</p>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-8">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Manila"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Province */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Province
                  </label>
                  <input
                    type="text"
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="Metro Manila"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Region */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Region
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all"
                  >
                    <option value="">Select Region</option>
                    <option value="NCR">NCR - National Capital Region</option>
                    <option value="CAR">CAR - Cordillera Administrative Region</option>
                    <option value="Region I">Region I - Ilocos Region</option>
                    <option value="Region II">Region II - Cagayan Valley</option>
                    <option value="Region III">Region III - Central Luzon</option>
                    <option value="Region IV-A">Region IV-A - CALABARZON</option>
                    <option value="Region IV-B">Region IV-B - MIMAROPA</option>
                    <option value="Region V">Region V - Bicol Region</option>
                  </select>
                </div>

                {/* Coordinates */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-6 border-2 border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-medium text-slate-900">GPS Coordinates</h3>
                    <Button variant="outline" size="sm" onClick={handleGetCurrentLocation} icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }>
                      Use My Location
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Latitude
                      </label>
                      <input
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="14.5995"
                        className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        Longitude
                      </label>
                      <input
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="120.9842"
                        className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                      />
                    </div>
                  </div>
                  {formData.latitude && formData.longitude && (
                    <p className="text-sm text-slate-600 mt-4">
                      📍 Preview map at: {formData.latitude}, {formData.longitude}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeSection === 'images' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-medium text-slate-900">Images & Photos</h2>
                <label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button variant="primary" size="md" as="span" icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  }>
                    Upload Images
                  </Button>
                </label>
              </div>

              {uploadingImage && (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
                  <p className="text-slate-600 mt-2">Uploading...</p>
                </div>
              )}

              {images.length === 0 && !uploadingImage && (
                <div className="text-center py-12 border-2 border-dashed border-slate-300 rounded-xl">
                  <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-slate-600 font-medium mb-2">No images uploaded yet</p>
                  <p className="text-sm text-slate-500">Click "Upload Images" to add photos</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-teal-500 transition-all">
                      <img
                        src={image.url}
                        alt={image.caption}
                        className="w-full h-48 object-cover"
                      />
                      {index === primaryImageIndex && (
                        <div className="absolute top-2 left-2 bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                          Primary
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2">
                        {index !== primaryImageIndex && (
                          <button
                            onClick={() => handleSetPrimaryImage(index)}
                            className="bg-white text-slate-900 px-3 py-2 rounded-lg font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all text-sm"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={image.caption}
                      onChange={(e) => {
                        const updated = [...images];
                        updated[index].caption = e.target.value;
                        setImages(updated);
                      }}
                      placeholder="Image caption"
                      className="w-full mt-3 px-4 py-3 text-sm bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 placeholder-slate-400"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Amenities Section */}
          {activeSection === 'amenities' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-4">Amenities & Features</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {availableAmenities.map((amenity) => (
                  <button
                    key={amenity.id}
                    onClick={() => handleAmenityToggle(amenity.id)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      selectedAmenities.includes(amenity.id)
                        ? 'border-teal-500 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{amenity.icon}</span>
                    <span className="text-xs font-medium">{amenity.name}</span>
                    {selectedAmenities.includes(amenity.id) && (
                      <svg className="w-5 h-5 ml-auto text-teal-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                <p className="text-sm text-teal-800">
                  <strong>{selectedAmenities.length}</strong> amenities selected
                </p>
              </div>
            </div>
          )}

          {/* Operating Hours Section */}
          {activeSection === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-4">Operating Hours</h2>
              
              <div className="space-y-4">
                {operatingHours.map((schedule, index) => (
                  <div key={schedule.day} className="flex items-center gap-4 p-5 bg-slate-50 rounded-xl border-2 border-slate-200">
                    <div className="w-32">
                      <span className="font-semibold text-slate-900">{schedule.day}</span>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={schedule.isClosed}
                        onChange={(e) => handleOperatingHoursChange(index, 'isClosed', e.target.checked)}
                        className="w-5 h-5 text-teal-500 border-slate-300 rounded focus:ring-2 focus:ring-teal-500"
                      />
                      <span className="text-sm text-slate-600">Closed</span>
                    </label>

                    {!schedule.isClosed && (
                      <>
                        <div className="flex items-center gap-3">
                          <input
                            type="time"
                            value={schedule.opens}
                            onChange={(e) => handleOperatingHoursChange(index, 'opens', e.target.value)}
                            className="px-4 py-3 bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                          <span className="text-slate-600">to</span>
                          <input
                            type="time"
                            value={schedule.closes}
                            onChange={(e) => handleOperatingHoursChange(index, 'closes', e.target.value)}
                            className="px-4 py-3 bg-white text-slate-900 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info Section */}
          {activeSection === 'contact' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">📞 Contact Information & QR Code</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleInputChange}
                    placeholder="+63 912 345 6789"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="info@destination.com"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* Website */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-3">
                    Website
                  </label>
                  <input
                    type="url"
                    name="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="w-full px-5 py-4 bg-white text-slate-900 border-2 border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all placeholder-slate-400"
                  />
                </div>

                {/* QR Code Section */}
                <div className="md:col-span-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8 border-4 border-purple-400 shadow-xl">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-2xl font-bold text-purple-900 mb-2">🎯 QR Code Generator</h3>
                      <p className="text-lg text-purple-700">Generate a unique QR code for this destination check-ins</p>
                    </div>
                    <Button 
                      variant="primary" 
                      size="lg" 
                      onClick={handleGenerateQRCode}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg font-bold rounded-xl shadow-lg"
                    >
                      {qrCodeUrl ? '🔄 Regenerate QR' : '✨ Generate QR Code'}
                    </Button>
                  </div>
                  {qrCodeUrl ? (
                    <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-purple-200">
                      <div className="flex flex-col md:flex-row items-center gap-6">
                        <div 
                          className="w-48 h-48 bg-white border-4 border-purple-300 rounded-2xl flex items-center justify-center cursor-pointer hover:border-purple-600 transition-all hover:shadow-2xl hover:scale-105 group relative"
                          onClick={() => setShowQRModal(true)}
                        >
                          <img 
                            src={qrCodeUrl} 
                            alt="QR Code" 
                            className="w-full h-full object-contain p-3"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all flex items-center justify-center">
                            <span className="text-white opacity-0 group-hover:opacity-100 text-lg font-bold bg-purple-600 px-4 py-2 rounded-lg">
                              🔍 Click to Enlarge
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-xl font-bold text-green-600 mb-2">✅ QR Code Generated Successfully!</p>
                          <p className="text-base text-slate-700 mb-4">Click the QR code image or buttons below to view larger version</p>
                          <div className="flex flex-wrap gap-3">
                            <Button 
                              variant="outline" 
                              size="lg" 
                              onClick={handleDownloadQR}
                              className="bg-green-50 hover:bg-green-100 border-2 border-green-400 text-green-700 font-bold"
                            >
                              📥 Download QR
                            </Button>
                            <Button 
                              variant="primary" 
                              size="lg" 
                              onClick={() => setShowQRModal(true)}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-6"
                            >
                              🔍 View Large
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 text-center">
                      <p className="text-lg text-yellow-800 font-semibold">
                        👆 Click the "Generate QR Code" button above to create your QR code
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* Bottom Action Buttons */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mt-6 flex justify-end gap-4"
        >
          <Button variant="outline" size="lg" onClick={() => navigate('/admin/destinations')}>
            Cancel
          </Button>
          <Button variant="primary" size="lg" onClick={handleSave}>
            {isEditMode ? 'Save Changes' : 'Create Destination'}
          </Button>
        </motion.div>
      </main>

      {/* QR Code Enlargement Modal */}
      <AnimatePresence>
        {showQRModal && qrCodeUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowQRModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.2 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">QR Code</h3>
                  <p className="text-sm text-slate-600">{formData.name || 'Destination'}</p>
                </div>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl text-slate-600">×</span>
                </button>
              </div>

              {/* QR Code Display */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 mb-4">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code Large" 
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                <p className="text-sm font-semibold text-blue-900 mb-2">📱 How to Test:</p>
                <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                  <li>Open QR Scanner in the mobile app</li>
                  <li>Take a photo of this QR code on your screen</li>
                  <li>Upload the photo to scan</li>
                  <li>System will verify the destination code</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowQRModal(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="primary" 
                  className="flex-1"
                  onClick={handleDownloadQR}
                >
                  📥 Download QR
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DestinationDetails;
