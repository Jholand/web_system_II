import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import toast from 'react-hot-toast';

// API URL auto-detection
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return `http://${hostname}:8000`;
};

const API_URL = import.meta.env.VITE_API_URL || getApiUrl();
const BASE_URL = import.meta.env.VITE_BASE_URL || getBaseUrl();

// Philippine Regions mapping
const provinceToRegion = {
  // NCR
  'Metro Manila': 'NCR',
  
  // Region I - Ilocos Region
  'Ilocos Norte': 'Region I',
  'Ilocos Sur': 'Region I',
  'La Union': 'Region I',
  'Pangasinan': 'Region I',
  
  // Region II - Cagayan Valley
  'Batanes': 'Region II',
  'Cagayan': 'Region II',
  'Isabela': 'Region II',
  'Nueva Vizcaya': 'Region II',
  'Quirino': 'Region II',
  
  // Region III - Central Luzon
  'Aurora': 'Region III',
  'Bataan': 'Region III',
  'Bulacan': 'Region III',
  'Nueva Ecija': 'Region III',
  'Pampanga': 'Region III',
  'Tarlac': 'Region III',
  'Zambales': 'Region III',
  
  // Region IV-A - CALABARZON
  'Batangas': 'Region IV-A',
  'Cavite': 'Region IV-A',
  'Laguna': 'Region IV-A',
  'Quezon': 'Region IV-A',
  'Rizal': 'Region IV-A',
  
  // Region IV-B - MIMAROPA
  'Marinduque': 'Region IV-B',
  'Occidental Mindoro': 'Region IV-B',
  'Oriental Mindoro': 'Region IV-B',
  'Palawan': 'Region IV-B',
  'Romblon': 'Region IV-B',
  
  // Region V - Bicol Region
  'Albay': 'Region V',
  'Camarines Norte': 'Region V',
  'Camarines Sur': 'Region V',
  'Catanduanes': 'Region V',
  'Masbate': 'Region V',
  'Sorsogon': 'Region V',
  
  // Region VI - Western Visayas
  'Aklan': 'Region VI',
  'Antique': 'Region VI',
  'Capiz': 'Region VI',
  'Guimaras': 'Region VI',
  'Iloilo': 'Region VI',
  'Negros Occidental': 'Region VI',
  
  // Region VII - Central Visayas
  'Bohol': 'Region VII',
  'Cebu': 'Region VII',
  'Negros Oriental': 'Region VII',
  'Siquijor': 'Region VII',
  
  // Region VIII - Eastern Visayas
  'Biliran': 'Region VIII',
  'Eastern Samar': 'Region VIII',
  'Leyte': 'Region VIII',
  'Northern Samar': 'Region VIII',
  'Samar': 'Region VIII',
  'Southern Leyte': 'Region VIII',
  
  // Region IX - Zamboanga Peninsula
  'Zamboanga del Norte': 'Region IX',
  'Zamboanga del Sur': 'Region IX',
  'Zamboanga Sibugay': 'Region IX',
  
  // Region X - Northern Mindanao
  'Bukidnon': 'Region X',
  'Camiguin': 'Region X',
  'Lanao del Norte': 'Region X',
  'Misamis Occidental': 'Region X',
  'Misamis Oriental': 'Region X',
  
  // Region XI - Davao Region
  'Davao de Oro': 'Region XI',
  'Davao del Norte': 'Region XI',
  'Davao del Sur': 'Region XI',
  'Davao Occidental': 'Region XI',
  'Davao Oriental': 'Region XI',
  
  // Region XII - SOCCSKSARGEN
  'Cotabato': 'Region XII',
  'Sarangani': 'Region XII',
  'South Cotabato': 'Region XII',
  'Sultan Kudarat': 'Region XII',
  
  // Region XIII - Caraga
  'Agusan del Norte': 'Region XIII',
  'Agusan del Sur': 'Region XIII',
  'Dinagat Islands': 'Region XIII',
  'Surigao del Norte': 'Region XIII',
  'Surigao del Sur': 'Region XIII',
  
  // BARMM
  'Basilan': 'BARMM',
  'Lanao del Sur': 'BARMM',
  'Maguindanao': 'BARMM',
  'Sulu': 'BARMM',
  'Tawi-Tawi': 'BARMM',
  
  // CAR - Cordillera Administrative Region
  'Abra': 'CAR',
  'Apayao': 'CAR',
  'Benguet': 'CAR',
  'Ifugao': 'CAR',
  'Kalinga': 'CAR',
  'Mountain Province': 'CAR',
};

const RegisterModal = ({ isOpen, onClose, onLoginClick }) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const emailCheckTimeoutRef = React.useRef(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    date_of_birth: '',
    gender: '',
    street_address: '',
    barangay: '',
    city: '',
    province: '',
    region: '',
    postal_code: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [checkingEmail, setCheckingEmail] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return '';
    if (!emailRegex.test(email)) {
      return 'Invalid email format';
    }
    return '';
  };

  const checkEmailAvailability = async (email) => {
    // Only check if email format is valid
    const formatError = validateEmail(email);
    if (!email || formatError) {
      setCheckingEmail(false);
      return;
    }
    
    setCheckingEmail(true);
    
    // Abort previous request if still pending
    if (window.emailCheckController) {
      window.emailCheckController.abort();
    }
    window.emailCheckController = new AbortController();
    
    try {
      // OPTIMIZED: Direct indexed lookup - no timeout race needed
      const response = await fetch(`${API_URL}/check-email`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email }),
        signal: window.emailCheckController.signal
      });

      if (response.ok) {
        const data = await response.json();
        setEmailError(data.exists ? '❌ This email is already registered' : '');
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Silent fail - don't block registration
      }
    } finally {
      setCheckingEmail(false);
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain lowercase letter';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain uppercase letter';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain a number';
    }
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Auto-populate region when province is selected
    if (name === 'province') {
      const region = provinceToRegion[value] || '';
      setFormData({
        ...formData,
        [name]: value,
        region: region,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }

    // Real-time validation
    if (name === 'email') {
      const error = validateEmail(value);
      setEmailError(error);
      if (!error && value) {
        // ULTRA-FAST: 300ms debounce for optimal UX (instant feel + reduced requests)
        if (emailCheckTimeoutRef.current) {
          clearTimeout(emailCheckTimeoutRef.current);
        }
        emailCheckTimeoutRef.current = setTimeout(() => {
          checkEmailAvailability(value);
        }, 300);
      } else if (error) {
        setCheckingEmail(false);
        if (emailCheckTimeoutRef.current) {
          clearTimeout(emailCheckTimeoutRef.current);
        }
      }
    }
    if (name === 'password') {
      const error = validatePassword(value);
      setPasswordError(error);
      // Instant confirm password check
      if (formData.password_confirmation) {
        setConfirmError(value !== formData.password_confirmation ? 'Passwords do not match' : '');
      }
    }
    if (name === 'password_confirmation') {
      setConfirmError(value !== formData.password ? 'Passwords do not match' : '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate email
    if (emailError) {
      toast.error(emailError);
      return;
    }

    // Validate password
    const pwdError = validatePassword(formData.password);
    if (pwdError) {
      setPasswordError(pwdError);
      toast.error(pwdError);
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setConfirmError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // OPTIMIZED: Parallel CSRF + prepare data
      const csrfPromise = fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
        credentials: 'include'
      });

      // Get CSRF token from cookie helper
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
      };

      // Wait for CSRF cookie
      await csrfPromise;
      const csrfToken = getCookie('XSRF-TOKEN');

      // FAST registration - no delays
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken || '',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        // Show success notification
        toast.success(
          `🎉 Welcome, ${formData.first_name}! Please log in to start your adventure.`,
          {
            duration: 3000,
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: '600',
              fontSize: '15px',
              padding: '16px',
              borderRadius: '12px',
            },
            icon: '✅',
          }
        );
        
        // Close modal and open login modal
        setTimeout(() => {
          onClose();
          if (onLoginClick) {
            onLoginClick(); // Open login modal
          }
        }, 500);
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('Registration failed. Please try again.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    if (onLoginClick) {
      onLoginClick();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Header Section */}
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-8 text-center flex-shrink-0">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl shadow-lg mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-white mb-2">Start Your Adventure</h2>
            <p className="text-teal-100 text-sm">Create your TravelQuest account</p>
          </div>

          {/* Form Section - Scrollable */}
          <div className="p-8 overflow-y-auto flex-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b pb-2">Personal Information</h3>
                
                {/* First Name & Last Name */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                {/* Phone & Date of Birth */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="09123456789"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b pb-2">Address (Optional)</h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                    Street Address
                  </label>
                  <input
                    type="text"
                    name="street_address"
                    value={formData.street_address}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                    placeholder="123 Main St"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Barangay
                    </label>
                    <input
                      type="text"
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="Barangay"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="City"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Province
                    </label>
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleChange}
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                      placeholder="Province"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                      Region <span className="text-teal-600 text-[10px] normal-case">(Auto-filled)</span>
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      readOnly
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 cursor-not-allowed"
                      placeholder="Auto-filled based on province"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    value={formData.postal_code}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-50 transition-all"
                    placeholder="1000"
                  />
                </div>
              </div>

              {/* Account Section */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider border-b pb-2">Account Credentials</h3>
                
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative group">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={`w-full pl-11 pr-10 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 hover:border-slate-300 ${
                        emailError ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-50'
                      }`}
                      placeholder="you@example.com"
                    />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  {checkingEmail && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="animate-spin h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="mt-1 text-xs text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={`w-full pl-11 pr-12 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 hover:border-slate-300 ${
                      passwordError ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-50'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0 bg-transparent border-0"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <p className="mt-1 text-xs text-red-600">{passwordError}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-2 uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    required
                    minLength={8}
                    className={`w-full pl-11 pr-12 py-3 bg-white border rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 transition-all duration-200 hover:border-slate-300 ${
                      confirmError ? 'border-red-300 focus:border-red-500 focus:ring-red-50' : 'border-slate-200 focus:border-teal-500 focus:ring-teal-50'
                    }`}
                    placeholder="••••••••"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0 bg-transparent border-0"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {confirmError && (
                  <p className="mt-1 text-xs text-red-600">{confirmError}</p>
                )}
              </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-600 text-sm">
                Already have an account?{' '}
                <button 
                  onClick={handleLoginClick}
                  className="px-4 py-2 bg-white text-teal-600 hover:text-teal-700 font-medium transition-colors rounded-lg"
                >
                  Sign in
                </button>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RegisterModal;
