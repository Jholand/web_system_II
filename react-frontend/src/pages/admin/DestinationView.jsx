import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { slideInFromRight, fadeIn } from '../../utils/animations';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';
import ToastNotification from '../../components/common/ToastNotification';

const DestinationView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Destination data state
  const [destination, setDestination] = useState(null);

  // Active tab for sections
  const [activeSection, setActiveSection] = useState('basic');

  useEffect(() => {
    fetchDestinationDetails();
  }, [id]);

  const fetchDestinationDetails = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData = {
        id: id,
        name: 'Grand Hotel Resort',
        category: 'hotel',
        description: 'Luxury resort with excellent facilities and top-notch service',
        fullDescription: 'Experience luxury at its finest with our world-class amenities, spacious rooms, and breathtaking views. Our resort offers everything you need for a perfect getaway, from fine dining to relaxing spa treatments. Whether you\'re here for business or pleasure, we ensure your stay is memorable.',
        address: '123 Main Street, Barangay Centro',
        city: 'Manila',
        province: 'Metro Manila',
        region: 'NCR - National Capital Region',
        latitude: '14.5995',
        longitude: '120.9842',
        pointsReward: 50,
        contactNumber: '+63 912 345 6789',
        email: 'info@grandhotel.com',
        website: 'https://grandhotel.com',
        status: 'active',
        featured: true,
        rating: 4.8,
        totalReviews: 1245,
        totalVisits: 5680,
        images: [
          { id: 1, url: 'https://via.placeholder.com/800x600/3B82F6/FFFFFF?text=Main+Building', caption: 'Main Building', isPrimary: true },
          { id: 2, url: 'https://via.placeholder.com/800x600/10B981/FFFFFF?text=Swimming+Pool', caption: 'Swimming Pool', isPrimary: false },
          { id: 3, url: 'https://via.placeholder.com/800x600/F59E0B/FFFFFF?text=Restaurant', caption: 'Restaurant', isPrimary: false },
          { id: 4, url: 'https://via.placeholder.com/800x600/8B5CF6/FFFFFF?text=Spa', caption: 'Spa & Wellness Center', isPrimary: false },
        ],
        amenities: [
          { id: 1, name: 'Free WiFi', icon: '📶' },
          { id: 2, name: 'Parking', icon: '🅿️' },
          { id: 3, name: 'Swimming Pool', icon: '🏊' },
          { id: 4, name: 'Restaurant', icon: '🍽️' },
          { id: 6, name: 'Spa Services', icon: '💆' },
          { id: 7, name: 'Air Conditioning', icon: '❄️' },
          { id: 9, name: 'Bar/Lounge', icon: '🍸' },
          { id: 10, name: 'Free Breakfast', icon: '🥐' },
          { id: 11, name: '24/7 Service', icon: '🕐' },
        ],
        operatingHours: [
          { day: 'Monday', opens: '09:00', closes: '18:00', isClosed: false },
          { day: 'Tuesday', opens: '09:00', closes: '18:00', isClosed: false },
          { day: 'Wednesday', opens: '09:00', closes: '18:00', isClosed: false },
          { day: 'Thursday', opens: '09:00', closes: '18:00', isClosed: false },
          { day: 'Friday', opens: '09:00', closes: '20:00', isClosed: false },
          { day: 'Saturday', opens: '10:00', closes: '20:00', isClosed: false },
          { day: 'Sunday', opens: '10:00', closes: '16:00', isClosed: false },
        ],
        qrCode: 'QR_CODE_DATA_HERE',
      };
      
      setDestination(mockData);
    } catch (error) {
      toast.error('Failed to load destination details');
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

  const getCategoryDisplay = (category) => {
    const categories = {
      hotel: { icon: '🏨', label: 'Hotel', color: 'bg-teal-100 text-teal-700' },
      'agri farm': { icon: '🌾', label: 'Agricultural Farm', color: 'bg-teal-100 text-teal-700' },
      'tourist spot': { icon: '⛰️', label: 'Tourist Spot', color: 'bg-cyan-100 text-cyan-700' },
      restaurant: { icon: '🍽️', label: 'Restaurant', color: 'bg-teal-100 text-teal-700' },
      attraction: { icon: '🎡', label: 'Attraction', color: 'bg-cyan-100 text-cyan-700' },
    };
    return categories[category] || categories.hotel;
  };

  const getStatusDisplay = (status) => {
    const statuses = {
      active: { label: 'Active', color: 'bg-green-100 text-green-700 border-green-200' },
      inactive: { label: 'Inactive', color: 'bg-gray-100 text-gray-700 border-gray-200' },
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    };
    return statuses[status] || statuses.active;
  };

  if (!destination) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const categoryDisplay = getCategoryDisplay(destination.category);
  const statusDisplay = getStatusDisplay(destination.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50 relative">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-72 h-72 bg-teal-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-cyan-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
      </div>
      
      <ToastNotification />
      
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/admin/destinations')}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{destination.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${categoryDisplay.color}`}>
                  <span>{categoryDisplay.icon}</span>
                  <span>{categoryDisplay.label}</span>
                </span>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${statusDisplay.color}`}>
                  {statusDisplay.label}
                </span>
                {destination.featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                    <span>⭐</span>
                    <span>Featured</span>
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="md" onClick={() => navigate(`/admin/destinations/${destination.id}/edit`)}>
              Edit
            </Button>
          </div>
        </div>
      </header>

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
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
        >
          {/* Basic Info Section */}
          {activeSection === 'basic' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Basic Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Destination Name */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Destination Name
                  </label>
                  <p className="text-sm font-normal text-slate-900">{destination.name}</p>
                </div>

                {/* Category */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Category
                  </label>
                  <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${categoryDisplay.color}`}>
                    <span className="text-xl">{categoryDisplay.icon}</span>
                    <span className="font-semibold">{categoryDisplay.label}</span>
                  </div>
                </div>

                {/* Points Reward */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Points Reward
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    <span className="text-xs font-medium text-teal-600">{destination.pointsReward}</span>
                    <span className="text-slate-600">points</span>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Statistics
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-slate-900">{destination.rating}</span>
                      <span className="text-sm text-slate-600">({destination.totalReviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>👥</span>
                      <span className="font-semibold text-slate-900">{destination.totalVisits.toLocaleString()}</span>
                      <span className="text-sm text-slate-600">total visits</span>
                    </div>
                  </div>
                </div>

                {/* Short Description */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Short Description
                  </label>
                  <p className="text-slate-800">{destination.description}</p>
                </div>

                {/* Full Description */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Full Description
                  </label>
                  <p className="text-slate-800 leading-relaxed">{destination.fullDescription}</p>
                </div>
              </div>
            </div>
          )}

          {/* Location Section */}
          {activeSection === 'location' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Location Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Address */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Full Address
                  </label>
                  <p className="text-lg text-slate-900 font-medium">
                    {destination.address}
                    <br />
                    {destination.city}, {destination.province}
                    <br />
                    {destination.region}
                  </p>
                </div>

                {/* City */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    City
                  </label>
                  <p className="text-sm font-normal text-slate-900">{destination.city}</p>
                </div>

                {/* Province */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Province
                  </label>
                  <p className="text-sm font-normal text-slate-900">{destination.province}</p>
                </div>

                {/* Region */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <label className="block text-sm font-semibold text-slate-600 mb-2">
                    Region
                  </label>
                  <p className="text-sm font-normal text-slate-900">{destination.region}</p>
                </div>

                {/* GPS Coordinates */}
                <div className="md:col-span-2 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl p-6 border-2 border-teal-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-normal text-slate-900">GPS Coordinates</h3>
                      <p className="text-sm text-slate-600">Exact location on map</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Latitude
                      </label>
                      <p className="text-xl font-mono font-bold text-teal-600">{destination.latitude}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Longitude
                      </label>
                      <p className="text-xl font-mono font-bold text-teal-600">{destination.longitude}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Images Section */}
          {activeSection === 'images' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-medium text-slate-900">Images & Photos</h2>
                <span className="text-sm text-slate-600">
                  {destination.images.length} {destination.images.length === 1 ? 'image' : 'images'}
                </span>
              </div>

              {/* Primary Image */}
              {destination.images.find(img => img.isPrimary) && (
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-slate-600 mb-3">
                    Primary Image
                  </label>
                  <div className="relative rounded-2xl overflow-hidden border-4 border-teal-500 shadow-xl">
                    <img
                      src={destination.images.find(img => img.isPrimary).url}
                      alt={destination.images.find(img => img.isPrimary).caption}
                      className="w-full h-96 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      ⭐ Primary Photo
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <p className="text-white text-sm font-normal">
                        {destination.images.find(img => img.isPrimary).caption}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Other Images */}
              <div>
                <label className="block text-sm font-semibold text-slate-600 mb-3">
                  Gallery
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {destination.images.filter(img => !img.isPrimary).map((image) => (
                    <div key={image.id} className="relative group">
                      <div className="relative rounded-xl overflow-hidden border-2 border-slate-200 hover:border-teal-400 transition-all shadow-lg">
                        <img
                          src={image.url}
                          alt={image.caption}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                          <p className="text-white text-xs font-medium">{image.caption}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Amenities Section */}
          {activeSection === 'amenities' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-medium text-slate-900">Amenities & Features</h2>
                <span className="text-sm text-slate-600">
                  {destination.amenities.length} {destination.amenities.length === 1 ? 'amenity' : 'amenities'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {destination.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-3 p-4 rounded-xl border-2 border-teal-200 bg-teal-50"
                  >
                    <span className="text-2xl">{amenity.icon}</span>
                    <span className="text-sm font-semibold text-teal-900">{amenity.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Operating Hours Section */}
          {activeSection === 'hours' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Operating Hours</h2>
              
              <div className="space-y-3">
                {destination.operatingHours.map((schedule, index) => (
                  <div 
                    key={schedule.day} 
                    className={`flex items-center justify-between p-5 rounded-xl border-2 transition-all ${
                      schedule.isClosed 
                        ? 'bg-slate-50 border-slate-200' 
                        : 'bg-teal-50 border-teal-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                        schedule.isClosed 
                          ? 'bg-slate-200 text-slate-600' 
                          : 'bg-teal-500 text-white'
                      }`}>
                        {schedule.day.substring(0, 3)}
                      </div>
                      <span className="font-semibold text-slate-900 text-lg">{schedule.day}</span>
                    </div>
                    
                    {schedule.isClosed ? (
                      <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg font-semibold">
                        <span>🔒</span>
                        <span>Closed</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-normal text-teal-700">{schedule.opens}</span>
                        <span className="text-slate-400">—</span>
                        <span className="text-sm font-normal text-teal-700">{schedule.closes}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Info Section */}
          {activeSection === 'contact' && (
            <div className="space-y-6">
              <h2 className="text-xs font-medium text-slate-900 mb-6">Contact Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <label className="text-sm font-semibold text-slate-600">
                      Phone Number
                    </label>
                  </div>
                  <p className="text-sm font-normal text-slate-900 ml-13">{destination.contactNumber}</p>
                </div>

                {/* Email */}
                <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <label className="text-sm font-semibold text-slate-600">
                      Email Address
                    </label>
                  </div>
                  <p className="text-sm font-normal text-slate-900 ml-13">{destination.email}</p>
                </div>

                {/* Website */}
                <div className="md:col-span-2 bg-slate-50 rounded-xl p-5 border border-slate-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <label className="text-sm font-semibold text-slate-600">
                      Website
                    </label>
                  </div>
                  <a 
                    href={destination.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-normal text-teal-600 hover:text-teal-700 ml-13 hover:underline"
                  >
                    {destination.website}
                  </a>
                </div>

                {/* QR Code */}
                <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-32 bg-white rounded-xl shadow-lg flex items-center justify-center border-2 border-purple-300">
                      <div className="text-center">
                        <span className="text-5xl">📱</span>
                        <p className="text-xs text-slate-600 mt-2 font-semibold">QR Code</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xs font-medium text-slate-900 mb-2">Check-in QR Code</h3>
                      <p className="text-sm text-slate-600 mb-3">
                        Users can scan this QR code to check in at this destination and earn {destination.pointsReward} points.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        }>
                          Download
                        </Button>
                        <Button variant="outline" size="sm" icon={
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                        }>
                          Print
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default DestinationView;
