import React from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AuthProvider } from './contexts/AuthContext'
import { LocationProvider } from './contexts/LocationContext'

// Admin Pages
import Dashboard from './pages/admin/Dashboard'
import Destinations from './pages/admin/Destinations'
import DestinationView from './pages/admin/DestinationView'
import DestinationDetails from './pages/admin/DestinationDetails'
import Badges from './pages/admin/Badges'
import AdminRewards from './pages/admin/Rewards'
import AdminMap from './pages/admin/AdminMap'
import AdminSettings from './pages/admin/Settings'

// User Pages
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import MapExplorer from './pages/user/MapExplorer'
import UserDashboard from './pages/user/UserDashboard'
import CheckIn from './pages/user/CheckIn'
import Rewards from './pages/user/Rewards'
import UserSettings from './pages/user/UserSettings'

import './App.css'

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/admin/login" element={<Login isAdmin={true} />} />
        <Route path="/register" element={<Register />} />
        
        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/user/map" replace />} />

        {/* User Routes - Temporarily Open Access */}
        <Route path="/user/map" element={<MapExplorer />} />
        <Route path="/user/dashboard" element={<UserDashboard />} />
        <Route path="/user/checkin" element={<CheckIn />} />
        <Route path="/user/rewards" element={<Rewards />} />
        <Route path="/user/settings" element={<UserSettings />} />

        {/* Legacy redirects for backward compatibility */}
        <Route path="/map" element={<Navigate to="/user/map" replace />} />
        <Route path="/dashboard" element={<Navigate to="/user/dashboard" replace />} />
        <Route path="/checkin" element={<Navigate to="/user/checkin" replace />} />
        <Route path="/rewards" element={<Navigate to="/user/rewards" replace />} />

        {/* Admin Routes - Temporarily Open Access */}
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/destinations" element={<Destinations />} />
        <Route path="/admin/destinations/new" element={<DestinationDetails />} />
        <Route path="/admin/destinations/:id" element={<DestinationView />} />
        <Route path="/admin/destinations/:id/edit" element={<DestinationDetails />} />
        <Route path="/admin/badges" element={<Badges />} />
        <Route path="/admin/rewards" element={<AdminRewards />} />
        <Route path="/admin/map" element={<AdminMap />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LocationProvider>
          <AnimatedRoutes />
        </LocationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
