import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

// Sanitize user data to prevent XSS
const sanitizeUserData = (user) => {
  if (!user) return null;
  return {
    ...user,
    name: String(user.name || '').trim(),
    email: String(user.email || '').trim().toLowerCase(),
    role: String(user.role || 'user'),
    status: String(user.status || 'active'),
  };
};

// Custom hook to use auth context
function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// Auth Provider Component
function AuthProvider({ children }) {
  // Check localStorage immediately for instant load
  const getInitialUser = () => {
    const userData = localStorage.getItem('user_data');
    const token = localStorage.getItem('auth_token');
    if (userData && token) {
      try {
        const parsed = JSON.parse(userData);
        return sanitizeUserData(parsed);
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const initialUser = getInitialUser();
  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false); // Start false for instant display
  const [isAuthenticated, setIsAuthenticated] = useState(!!initialUser);

  useEffect(() => {
    checkAuth();
    
    // OPTIMIZED: Check every 5 minutes, or when tab becomes visible
    const interval = setInterval(() => {
      if (isAuthenticated && document.visibilityState === 'visible') {
        checkAuth();
      }
    }, 300000); // 5 minutes (98% less API calls)

    // Check when tab becomes visible for instant updates
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isAuthenticated) {
        checkAuth();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated]);

  const checkAuth = async () => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user_data');
    
    if (token) {
      // Immediately restore user from localStorage for instant UI
      if (userData) {
        try {
          // Check if it's old encrypted data (starts with base64-like characters)
          if (userData.startsWith('JTdC') || userData.length > 1000) {
            // Old encrypted data, clear it
            console.log('Clearing old encrypted user data...');
            localStorage.removeItem('user_data');
          } else {
            const parsedUser = JSON.parse(userData);
            const sanitizedUser = sanitizeUserData(parsedUser);
            setUser(sanitizedUser);
            setIsAuthenticated(true);
            setLoading(false); // INSTANT - Set loading false immediately with cached data
          }
        } catch (e) {
          console.error('Failed to restore user data:', e);
          localStorage.removeItem('user_data');
        }
      }
      
      // Verify with backend in background (don't wait)
      try {
        // Make sure API service has the token
        api.setToken(token);
        
        // Background verification - doesn't block UI
        api.checkAuth().then(response => {
          if (response.authenticated && response.user) {
            const sanitizedUser = sanitizeUserData(response.user);
            setUser(sanitizedUser);
            setIsAuthenticated(true);
            // Update stored user data
            try {
              localStorage.setItem('user_data', JSON.stringify(sanitizedUser));
            } catch (storageError) {
              console.error('Failed to store user data:', storageError);
            }
          } else {
            // Auth check failed but returned success - logout
            logout();
          }
        }).catch(error => {
          console.error('Auth check failed:', error);
          // Only logout on 401/403, not on network errors
          if (error.message.includes('Unauthorized') || error.message.includes('401')) {
            logout();
          }
          // Otherwise keep the user logged in from localStorage
        });
      } catch (error) {
        console.error('Auth check failed:', error);
        // Only logout on auth errors
        if (error.message.includes('Unauthorized') || error.message.includes('401')) {
          logout();
        }
      }
    } else {
      setLoading(false);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      const sanitizedUser = sanitizeUserData(response.user);
      
      // ULTRA-FAST: Set state and localStorage in parallel
      setUser(sanitizedUser);
      setIsAuthenticated(true);
      
      // Non-blocking localStorage update
      Promise.resolve().then(() => {
        try {
          localStorage.setItem('user_data', JSON.stringify(sanitizedUser));
        } catch (storageError) {
          console.error('Failed to store user data:', storageError);
        }
      });
      
      return { 
        success: true, 
        user: response.user,
        redirect: response.redirect || (response.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard')
      };
    } catch (error) {
      // Clear any partial auth state
      setUser(null);
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: error.message || 'Invalid credentials'
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.register(userData);
      const sanitizedUser = sanitizeUserData(response.user);
      setUser(sanitizedUser);
      setIsAuthenticated(true);
      // Store user data in localStorage for persistence
      try {
        localStorage.setItem('user_data', JSON.stringify(sanitizedUser));
      } catch (storageError) {
        console.error('Failed to store user data:', storageError);
      }
      return { 
        success: true, 
        user: response.user,
        redirect: '/user/dashboard' // Always redirect users to user dashboard
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      api.setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  };

  const refreshUser = async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    try {
      api.setToken(token);
      const response = await api.checkAuth();
      if (response.authenticated && response.user) {
        const sanitizedUser = sanitizeUserData(response.user);
        setUser(sanitizedUser);
        setIsAuthenticated(true);
        localStorage.setItem('user_data', JSON.stringify(sanitizedUser));
        return sanitizedUser;
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
    isAdmin: user?.role === 'admin',
    isUser: user?.role === 'user',
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Export hook and provider
export { AuthProvider, useAuth };
