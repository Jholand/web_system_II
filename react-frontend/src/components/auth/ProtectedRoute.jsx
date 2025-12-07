import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-slate-600 font-medium">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to home
  if (!isAuthenticated || !user) {
    return <Navigate to="/" state={{ from: location, message: 'Please login to access this page' }} replace />;
  }

  // Check user status - only active users can access
  if (user.status !== 'active') {
    return <Navigate to="/" state={{ message: 'Your account is not active' }} replace />;
  }

  // Check role-based access if required
  if (requiredRole) {
    if (requiredRole === 'admin' && user.role !== 'admin') {
      // User trying to access admin routes - redirect to user dashboard
      return <Navigate to="/user/dashboard" state={{ message: 'Access denied. Admin privileges required.' }} replace />;
    }
    
    if (requiredRole === 'owner' && user.role !== 'owner') {
      // Non-owner trying to access owner routes - redirect to their dashboard
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
      return <Navigate to={redirectPath} state={{ message: 'Access denied. Owner privileges required.' }} replace />;
    }
    
    if (requiredRole === 'user' && user.role !== 'user') {
      // Admin/Owner trying to access user routes - redirect to their dashboard
      const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/owner/dashboard';
      return <Navigate to={redirectPath} state={{ message: 'Access denied. User access only.' }} replace />;
    }
  }

  // All checks passed - render the protected component
  return children;
};

export default ProtectedRoute;
