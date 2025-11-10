import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideInFromRight, fadeIn } from '../../utils/animations';
import AnimatedPage from '../../components/common/AnimatedPage';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';

const DestinationDetails = () => {
  const { id } = useParams(); // Get destination ID from URL
  const navigate = useNavigate();
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

  const handleGenerateQRCode = () => {
    toast.success('QR Code generated successfully');
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

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="md:ml-64 max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              {isEditMode ? `Edit Destination - ${formData.name}` : 'Add New Destination'}
            </h1>
            <p className="text-sm text-slate-600">
              {isEditMode ? 'Update destination information' : 'Create a new destination'}
            </p>
          </div>
        </div>
      </header>

      <DashboardTabs />

      {/* Main Content */}
      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">

        {/* Section Navigation */}
        <motion.div
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 mb-6 overflow-x-auto"
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Basic Information</h2>
              
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Location Details</h2>
              
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
                    <h3 className="text-lg font-semibold text-slate-900">GPS Coordinates</h3>
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
                <h2 className="text-2xl font-bold text-slate-900">Images & Photos</h2>
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
                            className="bg-white text-slate-900 px-3 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all text-sm"
                          >
                            Set Primary
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveImage(image.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded-lg font-medium opacity-0 group-hover:opacity-100 transition-all text-sm"
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
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Amenities & Features</h2>
              
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
                    <span className="text-sm font-medium">{amenity.name}</span>
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
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Operating Hours</h2>
              
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
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Information</h2>
              
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
                <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">QR Code for Check-ins</h3>
                      <p className="text-sm text-slate-600">Generate a unique QR code for this destination</p>
                    </div>
                    <Button variant="primary" size="md" onClick={handleGenerateQRCode}>
                      Generate QR Code
                    </Button>
                  </div>
                  {isEditMode && (
                    <div className="bg-white rounded-xl p-4 flex items-center gap-4">
                      <div className="w-32 h-32 bg-slate-200 rounded-lg flex items-center justify-center">
                        <span className="text-4xl">QR</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900 mb-2">Current QR Code</p>
                        <p className="text-xs text-slate-600 mb-3">Last generated: 2 days ago</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Download</Button>
                          <Button variant="outline" size="sm">Print</Button>
                        </div>
                      </div>
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
    </AnimatedPage>
  );
};

export default DestinationDetails;
