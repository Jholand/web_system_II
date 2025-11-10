import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../common/Button';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
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

    if (formData.password !== formData.password_confirmation) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    const result = await register(formData);

    if (result.success) {
      toast.success('Registration successful!');
      navigate('/map');
    } else {
      toast.error(result.error || 'Registration failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl shadow-lg mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">TravelQuest</h1>
          <p className="text-slate-600 mt-2">Start Your Adventure</p>
        </div>

        {/* Register Form */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative group">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300"
                  placeholder="John Doe"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
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
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
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

            <div className="relative">
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative group">
                <input
                  type="password"
                  name="password_confirmation"
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-50 transition-all duration-200 hover:border-slate-300"
                  placeholder="••••••••"
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-500 transition-colors duration-200">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          © 2025 TravelQuest. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Register;
