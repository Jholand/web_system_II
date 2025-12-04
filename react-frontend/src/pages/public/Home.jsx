import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PublicHeader from '../../components/layout/PublicHeader';
import PublicFooter from '../../components/layout/PublicFooter';
import LoginModal from '../../components/auth/LoginModal';
import RegisterModal from '../../components/auth/RegisterModal';

const Home = React.memo(() => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const location = useLocation();

  // Show message from navigation state
  useEffect(() => {
    if (location.state?.message) {
      toast.error(location.state.message);
      // Clear the message from state
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const heroImages = [
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200',
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      title: 'GPS-Based Exploration',
      description: 'Discover destinations around you with real-time GPS tracking and interactive maps.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
      title: 'QR Code Check-In',
      description: 'Scan QR codes at locations to check in, earn points, and track your journey.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
      title: 'Collect Badges',
      description: 'Unlock achievements and collect unique badges as you explore more destinations.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: 'Earn Rewards',
      description: 'Redeem your points for exclusive rewards, discounts, and special perks.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: 'Digital Footprint',
      description: 'Track your travel history and visualize your adventures on your personal dashboard.',
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: 'Community Driven',
      description: 'Share reviews, photos, and connect with fellow travelers worldwide.',
    },
  ];

  const stats = [
    { number: '500+', label: 'Destinations' },
    { number: '10K+', label: 'Active Users' },
    { number: '50+', label: 'Unique Badges' },
    { number: '4.8', label: 'Average Rating' },
  ];

  const destinationCards = [
    {
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500',
      title: 'Beach Paradise',
      location: 'Boracay, Philippines',
      rating: 4.9,
    },
    {
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500',
      title: 'Mountain Retreat',
      location: 'Baguio, Philippines',
      rating: 4.8,
    },
    {
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=500',
      title: 'Urban Adventure',
      location: 'Manila, Philippines',
      rating: 4.7,
    },
  ];

  const handleNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % destinationCards.length);
  };

  const handlePrevCard = () => {
    setCurrentCardIndex((prev) => (prev - 1 + destinationCards.length) % destinationCards.length);
  };

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader 
        onLoginClick={() => setShowLoginModal(true)}
        onRegisterClick={() => setShowRegisterModal(true)}
      />
      
      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        onRegisterClick={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />
      
      {/* Register Modal */}
      <RegisterModal 
        isOpen={showRegisterModal} 
        onClose={() => setShowRegisterModal(false)}
        onLoginClick={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative h-screen overflow-hidden">
        {/* Background Images Slider */}
        <div className="absolute inset-0">
          {heroImages.map((image, index) => (
            <motion.div
              key={image}
              initial={{ opacity: 0 }}
              animate={{ opacity: currentImageIndex === index ? 1 : 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          ))}
          <div className="absolute inset-0 bg-gradient-to-br from-teal-900/80 via-gray-900/70 to-teal-800/80" />
        </div>

        {/* Decorative Elements */}
        {/* Decorative Elements */}
        <div className="absolute top-40 right-20 w-64 h-64 opacity-10">
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="w-3 h-3 bg-white rounded-full"
              />
            ))}
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto px-4 lg:px-8 h-full flex items-center lg:pr-[450px]">
          <div className="max-w-3xl lg:max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-block mb-6">
                <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white text-sm font-medium">
                  🌍 Start Your Adventure Today
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-light text-white mb-6 leading-tight tracking-tight">
                EXPLORE
                <br />
                DREAM
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-teal-100">
                  DESTINATION
                </span>
              </h1>

              <p className="text-base md:text-lg text-gray-200 mb-8 leading-relaxed font-light">
                Embark on a gamified travel experience. Discover stunning destinations, 
                collect unique badges, earn rewards, and create unforgettable memories 
                as you explore the world around you.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register"
                  className="group px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-normal rounded-xl hover:from-teal-600 hover:to-teal-700 transition-all shadow-2xl hover:shadow-teal-500/50 transform hover:-translate-y-1 flex items-center justify-center space-x-2"
                >
                  <span>BOOK NOW</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                
                <Link
                  to="/destinations"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-normal rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  Explore Destinations
                </Link>
              </div>

              {/* Quick Access Links - Dev Mode */}
              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                <Link to="/user/dashboard" className="px-4 py-2 bg-teal-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-teal-500/30 transition-all border border-white/20">
                  User Dashboard
                </Link>
                <Link to="/admin/dashboard" className="px-4 py-2 bg-purple-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-purple-500/30 transition-all border border-white/20">
                  Admin Dashboard
                </Link>
                <Link to="/user/map" className="px-4 py-2 bg-blue-500/20 backdrop-blur-sm text-white rounded-lg hover:bg-blue-500/30 transition-all border border-white/20">
                  Map Explorer
                </Link>
              </div>
            </motion.div>
          </div>

          {/* Featured Destination Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block absolute right-8 xl:right-20 top-32 z-20 w-[340px]"
          >
            <div className="relative">
              <motion.div
                key={currentCardIndex}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="group relative bg-white rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-300 cursor-pointer"
                style={{ boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}
              >
                <div className="relative h-72 overflow-hidden">
                  <img
                    src={destinationCards[currentCardIndex].image}
                    alt={destinationCards[currentCardIndex].title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  
                  {/* Rating Badge */}
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white rounded-full flex items-center space-x-0.5 shadow-md">
                    <svg className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[10px] font-bold text-gray-900">{destinationCards[currentCardIndex].rating}</span>
                  </div>

                  {/* Bookmark Icon */}
                  <button className="absolute top-2 left-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform duration-200">
                    <svg className="w-3 h-3 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>

                  {/* Navigation Arrows */}
                  <button
                    onClick={handlePrevCard}
                    className="absolute left-1 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 z-10 bg-transparent"
                  >
                    <svg className="w-3 h-3 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextCard}
                    className="absolute right-1 top-1/2 -translate-y-1/2 hover:scale-110 transition-transform duration-200 z-10 bg-transparent"
                  >
                    <svg className="w-3 h-3 text-white drop-shadow-2xl" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-white font-bold text-2xl mb-2 drop-shadow-lg">{destinationCards[currentCardIndex].title}</h3>
                    <p className="text-white/95 text-sm flex items-center font-medium drop-shadow-md">
                      <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {destinationCards[currentCardIndex].location}
                    </p>
                  </div>
                </div>

                {/* Read More Button */}
                <div className="p-5 bg-white">
                  <button className="w-full px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:from-teal-600 hover:to-teal-700 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-md flex items-center justify-center space-x-2 group">
                    <span className="tracking-wide">READ MORE</span>
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                </div>
              </motion.div>

              {/* Indicator Dots */}
              <div className="flex justify-center space-x-0.5 mt-2">
                {destinationCards.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentCardIndex(index)}
                    className={`rounded-full transition-all duration-300 hover:opacity-80 ${
                      index === currentCardIndex 
                        ? 'bg-teal-500 w-2 h-0.5' 
                        : 'bg-white/60 w-0.5 h-0.5 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-white"
        >
          <span className="text-sm mb-2">Scroll Down</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-teal-50 to-white">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-light bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-normal text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-teal-600 font-normal text-xs uppercase tracking-widest">Features</span>
            <h2 className="text-3xl md:text-4xl font-light text-gray-900 mt-2 mb-4">
              Why Choose TravelQuest?
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto font-light">
              Experience travel like never before with our innovative gamification platform
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-teal-500 hover:shadow-xl transition-all duration-300"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-normal text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm font-light">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-teal-600 to-teal-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-light mb-6">
              Ready to Start Your Adventure?
            </h2>
            <p className="text-lg text-teal-100 mb-8 font-light">
              Join thousands of travelers exploring the world with TravelQuest
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="px-8 py-4 bg-white text-teal-600 font-normal rounded-xl hover:bg-gray-100 transition-all shadow-xl transform hover:-translate-y-1"
              >
                Get Started Free
              </Link>
              <Link
                to="/destinations"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-normal rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
              >
                Browse Destinations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
