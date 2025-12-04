import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';
import LoginModal from '../../components/auth/LoginModal';
import RegisterModal from '../../components/auth/RegisterModal';
import api from '../../services/api';

const PublicDestinations = React.memo(() => {
  const [destinations, setDestinations] = useState([]);
  const [filteredDestinations, setFilteredDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const categories = [
    { id: 'all', name: 'All Destinations', icon: '🌍' },
    { id: 'beach', name: 'Beaches', icon: '🏖️' },
    { id: 'mountain', name: 'Mountains', icon: '⛰️' },
    { id: 'city', name: 'Cities', icon: '🏙️' },
    { id: 'nature', name: 'Nature', icon: '🌲' },
    { id: 'cultural', name: 'Cultural', icon: '🏛️' },
    { id: 'adventure', name: 'Adventure', icon: '🎒' },
  ];

  // Mock data - replace with API call
  const mockDestinations = [
    {
      id: 1,
      name: 'Boracay White Beach',
      description: 'World-famous white sand beach paradise with crystal clear waters',
      category: 'beach',
      location: 'Boracay, Aklan',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      rating: 4.9,
      visitors: 1250,
      points: 50,
    },
    {
      id: 2,
      name: 'Mount Pulag',
      description: 'Experience the breathtaking sea of clouds at the highest peak in Luzon',
      category: 'mountain',
      location: 'Benguet',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      rating: 4.8,
      visitors: 890,
      points: 75,
    },
    {
      id: 3,
      name: 'Intramuros',
      description: 'Historic walled city with Spanish colonial architecture and rich heritage',
      category: 'cultural',
      location: 'Manila',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      rating: 4.7,
      visitors: 2100,
      points: 40,
    },
    {
      id: 4,
      name: 'Chocolate Hills',
      description: 'Unique geological formations with over 1,000 cone-shaped hills',
      category: 'nature',
      location: 'Bohol',
      image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800',
      rating: 4.9,
      visitors: 1580,
      points: 60,
    },
    {
      id: 5,
      name: 'Banaue Rice Terraces',
      description: '2,000-year-old terraces carved into mountains, UNESCO World Heritage Site',
      category: 'cultural',
      location: 'Ifugao',
      image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
      rating: 5.0,
      visitors: 750,
      points: 80,
    },
    {
      id: 6,
      name: 'El Nido',
      description: 'Stunning lagoons, limestone cliffs, and pristine beaches',
      category: 'beach',
      location: 'Palawan',
      image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
      rating: 4.9,
      visitors: 1920,
      points: 70,
    },
    {
      id: 7,
      name: 'Taal Volcano',
      description: 'Active volcano on an island within a lake on an island',
      category: 'nature',
      location: 'Batangas',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      rating: 4.6,
      visitors: 1340,
      points: 55,
    },
    {
      id: 8,
      name: 'Hundred Islands',
      description: 'Archipelago of 124 islands with diverse marine life',
      category: 'beach',
      location: 'Pangasinan',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      rating: 4.7,
      visitors: 980,
      points: 50,
    },
    {
      id: 9,
      name: 'Vigan Heritage Village',
      description: 'Well-preserved Spanish colonial town with cobblestone streets',
      category: 'cultural',
      location: 'Ilocos Sur',
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
      rating: 4.8,
      visitors: 1120,
      points: 65,
    },
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDestinations(mockDestinations);
      setFilteredDestinations(mockDestinations);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let filtered = destinations;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(dest => dest.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(dest =>
        dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dest.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredDestinations(filtered);
  }, [selectedCategory, searchQuery, destinations]);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader 
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-sm font-medium mb-6">
              Explore Destinations
            </span>
            <h1 className="text-4xl md:text-5xl font-light mb-6 tracking-tight">
              Discover Amazing Places
            </h1>
            <p className="text-lg text-teal-100 mb-8 font-light">
              From pristine beaches to majestic mountains, explore incredible destinations and start your adventure
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search destinations, cities, or attractions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-xl text-gray-900 focus:outline-none focus:ring-4 focus:ring-teal-300"
                />
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b sticky top-20 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center space-x-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-normal transition-all whitespace-nowrap ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent"></div>
              <p className="text-gray-600 mt-4">Loading destinations...</p>
            </div>
          ) : filteredDestinations.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-24 h-24 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-600 text-lg">No destinations found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters or search query</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-8">
                <p className="text-gray-600">
                  Showing <span className="font-normal text-gray-900">{filteredDestinations.length}</span> destinations
                </p>
                <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                  <option>Most Popular</option>
                  <option>Highest Rated</option>
                  <option>Most Visitors</option>
                  <option>Most Points</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDestinations.map((destination, index) => (
                  <motion.div
                    key={destination.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={destination.image}
                        alt={destination.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      
                      {/* Category Badge */}
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-sm font-medium text-gray-800 capitalize">
                          {destination.category}
                        </span>
                      </div>

                      {/* Rating */}
                      <div className="absolute top-4 right-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center space-x-1">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-sm font-normal text-gray-800">{destination.rating}</span>
                      </div>

                      {/* Points Badge */}
                      <div className="absolute bottom-4 right-4 px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full text-white text-sm font-normal">
                        +{destination.points} pts
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      <h3 className="text-lg font-normal text-gray-900 mb-2 group-hover:text-teal-600 transition-colors">
                        {destination.name}
                      </h3>
                      
                      <p className="text-gray-600 text-sm mb-4 flex items-center">
                        <svg className="w-4 h-4 mr-1 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {destination.location}
                      </p>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {destination.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {destination.visitors} visitors
                        </span>
                      </div>

                      {/* CTA Buttons */}
                      <div className="flex gap-2">
                        <Link
                          to="/register"
                          className="flex-1 px-4 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-medium rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all text-center"
                        >
                          Check In
                        </Link>
                        <button className="px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Ready to Explore?
            </h2>
            <p className="text-xl text-teal-100 mb-8">
              Join TravelQuest today and start discovering amazing destinations
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-teal-600 font-normal rounded-xl hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1"
            >
              Create Free Account
            </Link>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
});

PublicDestinations.displayName = 'PublicDestinations';

export default PublicDestinations;
