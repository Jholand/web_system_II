import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const Login = ({ isAdmin = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // INSTANT FEEDBACK - show loading immediately
    setLoading(true);
    const loadingToast = toast.loading('Signing in...');

    try {
      const result = await login(formData);

      if (result.success) {
        // ULTRA-FAST: Update UI and navigate simultaneously
        toast.success('Welcome back!', { id: loadingToast, duration: 1500 });
        
        // ✅ REDIRECT TO DASHBOARD (not map) - Better UX
        const targetRoute = result.user.role === 'admin' || isAdmin ? '/admin/dashboard' : '/user/dashboard';
        navigate(targetRoute, { replace: true });
        // Note: Don't set loading false here - we're navigating away
      } else {
        toast.error(result.error || 'Invalid credentials', { id: loadingToast });
        setLoading(false);
      }
    } catch (error) {
      toast.error('Login failed. Check your connection.', { id: loadingToast });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4 py-12 relative">
      {/* Back to Home Button */}
      {!isAdmin && (
        <Link
          to="/"
          className="absolute top-6 left-6 flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-medium">Back to Home</span>
        </Link>
      )}
      
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to={isAdmin ? "/admin/login" : "/"} className="inline-block">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-lg mb-4 hover:scale-105 transition-transform">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </Link>
          <h1 className="text-3xl font-light text-slate-900">TravelQuest</h1>
          <p className="text-slate-600 mt-2">
            {isAdmin ? 'Admin Portal' : 'Explore, Collect, Achieve'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-light text-slate-900 mb-6">
            {isAdmin ? 'Admin Login' : 'Welcome Back'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-normal text-slate-600 mb-2 uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300"
                  placeholder="you@example.com"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-normal text-slate-600 mb-2 uppercase tracking-widest">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300"
                  placeholder="••••••••"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {!isAdmin && (
            <div className="mt-6 text-center">
              <p className="text-slate-600">
                Don't have an account?{' '}
                <Link to="/register" className="text-teal-600 hover:text-teal-700 font-normal">
                  Sign up
                </Link>
              </p>
            </div>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 TravelQuest. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
