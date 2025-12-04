import React, { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'
import { CategoryProvider } from './contexts/CategoryContext'
import { queryClient } from './lib/queryClient'
import api from './services/api'

// ⚡ PRELOAD DATA ON APP START - Makes all pages instant
const preloadUserData = () => {
  const token = localStorage.getItem('auth_token');
  if (!token) return;
  
  // Fire and forget - load all user data in parallel
  Promise.all([
    api.request('/user/badges').then(res => {
      if (res.success) {
        localStorage.setItem('cached_user_badges', JSON.stringify({
          earned: res.data.earned || [],
          locked: res.data.available || [],
          summary: res.data.summary || {},
          timestamp: Date.now()
        }));
      }
    }).catch(() => {}),
    
    api.request('/checkins').then(res => {
      if (res.success) {
        const checkinsData = res.data?.data || res.data || [];
        const recentCheckins = checkinsData.slice(0, 5).map(checkin => ({
          id: checkin.id,
          destination: {
            name: checkin.destination?.name || 'Unknown',
            category: checkin.destination?.category || 'destination'
          },
          points: checkin.points_earned || 0,
          createdAt: new Date(checkin.checked_in_at).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        }));
        localStorage.setItem('cached_recent_checkins', JSON.stringify({
          data: recentCheckins,
          timestamp: Date.now()
        }));
      }
    }).catch(() => {}),
    
    api.request('/checkins/stats').then(res => {
      if (res.success) {
        localStorage.setItem('cached_checkin_stats', JSON.stringify({
          data: res.data,
          timestamp: Date.now()
        }));
      }
    }).catch(() => {}),
    
    api.request('/user/saved-destinations').then(res => {
      if (res.success) {
        localStorage.setItem('cached_saved_destinations', JSON.stringify({
          data: res.data || [],
          timestamp: Date.now()
        }));
      }
    }).catch(() => {})
  ]);
};

// Public Pages - Eager load (needed immediately)
import Home from './pages/public/Home'

// Lazy load all other pages for faster initial load
const About = lazy(() => import('./pages/public/About'))
const Contact = lazy(() => import('./pages/public/Contact'))
const PublicDestinations = lazy(() => import('./pages/public/Destinations'))

// Admin Pages - Lazy loaded
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const Destinations = lazy(() => import('./pages/admin/Destinations'))
const DestinationView = lazy(() => import('./pages/admin/DestinationView'))
const DestinationDetails = lazy(() => import('./pages/admin/DestinationDetails'))
const Categories = lazy(() => import('./pages/admin/Categories'))
const Badges = lazy(() => import('./pages/admin/Badges'))
const AdminRewards = lazy(() => import('./pages/admin/Rewards'))
const Users = lazy(() => import('./pages/admin/Users'))
const AdminMap = lazy(() => import('./pages/admin/AdminMap'))
const AdminSettings = lazy(() => import('./pages/admin/Settings'))

// User Pages - Lazy loaded
const MapExplorer = lazy(() => import('./pages/user/MapExplorer'))
const UserDashboard = lazy(() => import('./pages/user/UserDashboard'))
const CheckIn = lazy(() => import('./pages/user/CheckIn'))
const Rewards = lazy(() => import('./pages/user/Rewards'))
const UserSettings = lazy(() => import('./pages/user/UserSettings'))
const UserBadges = lazy(() => import('./pages/user/UserBadges'))

const ProtectedRoute = lazy(() => import('./components/auth/ProtectedRoute'))

import './App.css'
import { Toaster } from 'react-hot-toast'

// Loading fallback component - Minimal, no blocking
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
      <p className="text-sm text-slate-600 animate-pulse">Loading...</p>
    </div>
  </div>
)

// ✅ OPTIMIZATION: Wrap routes to prevent parent re-rendering
function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    // ✅ REMOVED AnimatePresence - causes delay on navigation
    <Suspense fallback={<PageLoader />}>
      <Routes location={location} key={location.pathname}>
          {/* Public Pages */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/destinations" element={<PublicDestinations />} />
          
          {/* User Routes - Protected (User Role Only) */}
          <Route path="/user/map" element={
            <ProtectedRoute requiredRole="user">
            <MapExplorer />
          </ProtectedRoute>
        } />
        <Route path="/user/dashboard" element={
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        } />
        <Route path="/user/checkin" element={
          <ProtectedRoute requiredRole="user">
            <CheckIn />
          </ProtectedRoute>
        } />
        <Route path="/user/rewards" element={
          <ProtectedRoute requiredRole="user">
            <Rewards />
          </ProtectedRoute>
        } />
        <Route path="/user/badges" element={
          <ProtectedRoute requiredRole="user">
            <UserBadges />
          </ProtectedRoute>
        } />
        <Route path="/user/settings" element={
          <ProtectedRoute requiredRole="user">
            <UserSettings />
          </ProtectedRoute>
        } />

        {/* Legacy redirects for backward compatibility */}
        <Route path="/map" element={<Navigate to="/user/map" replace />} />
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/checkin" element={<Navigate to="/user/checkin" replace />} />
        <Route path="/rewards" element={<Navigate to="/user/rewards" replace />} />

        {/* Admin Routes - Protected (Admin Role Only) */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/destinations" element={
          <ProtectedRoute requiredRole="admin">
            <Destinations />
          </ProtectedRoute>
        } />
        <Route path="/admin/destinations/new" element={
          <ProtectedRoute requiredRole="admin">
            <DestinationDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/destinations/:id" element={
          <ProtectedRoute requiredRole="admin">
            <DestinationView />
          </ProtectedRoute>
        } />
        <Route path="/admin/destinations/:id/edit" element={
          <ProtectedRoute requiredRole="admin">
            <DestinationDetails />
          </ProtectedRoute>
        } />
        <Route path="/admin/categories" element={
          <ProtectedRoute requiredRole="admin">
            <Categories />
          </ProtectedRoute>
        } />
        <Route path="/admin/badges" element={
          <ProtectedRoute requiredRole="admin">
            <Badges />
          </ProtectedRoute>
        } />
        <Route path="/admin/rewards" element={
          <ProtectedRoute requiredRole="admin">
            <AdminRewards />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <Users />
          </ProtectedRoute>
        } />
        <Route path="/admin/map" element={
          <ProtectedRoute requiredRole="admin">
            <AdminMap />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminSettings />
          </ProtectedRoute>
        } />

          {/* 404 Catch-all - Redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
  );
}

// ✅ OPTIMIZED: Removed AnimatePresence import since we're not using it
function App() {
  // ⚡ PRELOAD all user data on app start
  useEffect(() => {
    preloadUserData();
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <CategoryProvider>
            <LocationProvider>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    duration: 4000,
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
              <AnimatedRoutes />
            </LocationProvider>
          </CategoryProvider>
        </AuthProvider>
      </BrowserRouter>
      {/* ⚡ React Query DevTools - Only in development */}
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  )
}

export default App
