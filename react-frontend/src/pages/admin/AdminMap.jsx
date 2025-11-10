import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import AdminHeader from '../../components/common/AdminHeader';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import DashboardTabs from '../../components/dashboard/DashboardTabs';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import QRGenerator from '../../components/qr/QRGenerator';
import ToastNotification from '../../components/common/ToastNotification';
import toast from 'react-hot-toast';
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

const AdminMap = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState([
    {
      id: 1,
      name: 'Grand Hotel Resort',
      category: 'hotel',
      address: 'Roxas Boulevard, Pasay, Manila, Philippines',
      latitude: 14.5995,
      longitude: 120.9842,
      qrCode: 'HOTEL-GHR-001',
      visits: 145,
      reviews: 23,
    },
    {
      id: 2,
      name: 'Mountain Peak View',
      category: 'tourist spot',
      address: 'Tagaytay City, Cavite, Philippines',
      latitude: 14.6095,
      longitude: 120.9942,
      qrCode: 'SPOT-MPV-002',
      visits: 89,
      reviews: 15,
    },
    {
      id: 3,
      name: 'Organic Valley Farm',
      category: 'agri farm',
      address: 'Tanay, Rizal, Philippines',
      latitude: 14.5895,
      longitude: 120.9742,
      qrCode: 'FARM-OVF-003',
      visits: 67,
      reviews: 12,
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [newLocation, setNewLocation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'hotel',
    description: '',
    address: '',
    points: 50,
    latitude: '',
    longitude: '',
  });

  const handleMapClick = (latlng) => {
    setNewLocation(latlng);
    setFormData({ 
      ...formData, 
      latitude: latlng.lat.toFixed(6),
      longitude: latlng.lng.toFixed(6)
    });
    setShowAddModal(true);
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const handleAddDestination = () => {
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

    const qrCode = `${formData.category.toUpperCase().replace(' ', '-')}-${formData.name.substring(0, 3).toUpperCase()}-${String(destinations.length + 1).padStart(3, '0')}`;

    const newDest = {
      id: destinations.length + 1,
      name: formData.name,
      category: formData.category,
      latitude: lat,
      longitude: lng,
      points: 50,
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

  return (
    <AnimatedPage className="min-h-screen bg-gray-50">
      <ToastNotification />
      
      {/* Header */}
      <AdminHeader
        admin={{ name: 'em', role: 'Administrator' }}
        onLogout={handleLogout}
      />

      <DashboardTabs />

      {/* Main Content */}
      <main className="md:ml-64 sm:ml-20 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-32 sm:pb-20 md:pb-8 transition-all duration-300">
        {/* Page Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Interactive Map</h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">Pin and manage destinations on the map</p>
            </div>
          </div>
        </motion.div>

        {/* Map Content */}


        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-blue-900 mb-1">How to add locations</h3>
              <p className="text-xs sm:text-sm text-blue-800">Click anywhere on the map to pin a new location. A form will appear to add details. Each location gets a unique QR code for user check-ins and digital footprints.</p>
            </div>
          </div>
        </div>

        {/* Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border p-4 sm:p-6 h-full">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4">Location Map</h3>
              <p className="text-xs sm:text-sm text-slate-600 mb-4">Click on the map to add new destinations</p>
              
              <div className="rounded-xl overflow-hidden border-2 border-slate-200 relative z-0" style={{ height: '600px', minHeight: '500px' }}>
                <MapContainer
                  center={[13.0, 121.0]}
                  zoom={9}
                  style={{ height: '100%', width: '100%', zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  <LocationMarker onLocationSelect={handleMapClick} />
                  
                  {destinations.map((dest) => (
                    <Marker
                      key={dest.id}
                      position={[dest.latitude, dest.longitude]}
                    >
                      <Popup>
                        <div className="p-2">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{getCategoryIcon(dest.category)}</span>
                            <h4 className="font-bold text-slate-900">{dest.name}</h4>
                          </div>
                          <p className="text-xs text-slate-600 mb-2">{dest.category}</p>
                          <div className="text-xs text-slate-500 mb-3">
                            <p>👣 {dest.visits} footprints</p>
                            <p>⭐ {dest.reviews} reviews</p>
                            <p>🔑 QR: {dest.qrCode}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleShowQR(dest)}
                          >
                            View QR Code
                          </Button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Sidebar - Locations List */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
              <h3 className="font-bold text-slate-900 mb-4">Map Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Locations</span>
                  <span className="text-2xl font-bold text-teal-600">{destinations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Digital Footprints</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {destinations.reduce((sum, d) => sum + d.visits, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Total Reviews</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {destinations.reduce((sum, d) => sum + d.reviews, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Locations List */}
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-bold text-slate-900 mb-4">All Locations</h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {destinations.map((dest) => (
                  <div
                    key={dest.id}
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 ${getCategoryColor(dest.category)} rounded-lg flex items-center justify-center text-white text-xl flex-shrink-0`}>
                        {getCategoryIcon(dest.category)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-slate-900 truncate">{dest.name}</h4>
                        <p className="text-xs text-slate-500 mb-2">{dest.category}</p>
                        <div className="flex items-center gap-3 text-xs text-slate-600">
                          <span>👣 {dest.visits}</span>
                          <span>⭐ {dest.reviews}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2 w-full"
                          onClick={() => handleShowQR(dest)}
                        >
                          Show QR
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

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
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
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
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
              </svg>
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all text-slate-900"
            >
              <option value="hotel">🏨 Hotel</option>
              <option value="agri farm">🌾 Agri Farm</option>
              <option value="tourist spot">⛰️ Tourist Spot</option>
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
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
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
              <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
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
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-2">
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
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{selectedDestination.name}</h3>
              <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedDestination.category)} text-white`}>
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border-2 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">👣</span>
                  <p className="text-xs text-blue-700 font-bold uppercase">Footprints</p>
                </div>
                <p className="text-3xl font-bold text-blue-900">{selectedDestination.visits}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-5 border-2 border-purple-200">
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
    </AnimatedPage>
  );
};

export default AdminMap;
