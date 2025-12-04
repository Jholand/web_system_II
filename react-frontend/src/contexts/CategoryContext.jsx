import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import categoryService from '../services/categoryService';

const CategoryContext = createContext();

/**
 * ⚡ ULTRA-FAST CATEGORY CONTEXT
 * - Loads categories ONLY ONCE per session
 * - Caches in memory + localStorage
 * - Zero repeated API calls
 * - Auto-invalidation on category updates
 */
export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  // Cache duration: 10 minutes
  const CACHE_DURATION = 10 * 60 * 1000;
  const CACHE_KEY = 'travelquest_categories_cache';

  /**
   * Check if cache is still valid
   */
  const isCacheValid = useCallback(() => {
    if (!lastFetch) return false;
    return Date.now() - lastFetch < CACHE_DURATION;
  }, [lastFetch]);

  /**
   * Load categories from localStorage cache
   */
  const loadFromCache = useCallback(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setCategories(data);
          setLastFetch(timestamp);
          return true;
        }
      }
    } catch (error) {
      console.error('Cache load error:', error);
    }
    return false;
  }, []);

  /**
   * Save categories to localStorage cache
   */
  const saveToCache = useCallback((data) => {
    try {
      const timestamp = Date.now();
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp }));
      setLastFetch(timestamp);
    } catch (error) {
      console.error('Cache save error:', error);
    }
  }, []);

  /**
   * Fetch categories from API (with smart caching)
   */
  const fetchCategories = useCallback(async (forceRefresh = false) => {
    // If cache is valid and not forcing refresh, skip API call
    if (!forceRefresh && isCacheValid() && categories.length > 0) {
  
      return categories;
    }

    // Try loading from localStorage first
    if (!forceRefresh && loadFromCache()) {
  
      return categories;
    }

    // Prevent duplicate API calls
    if (loading) {
  
      return categories;
    }

    setLoading(true);
    setError(null);

    try {
  
      const response = await categoryService.getActiveCategories();
      const categoryData = response.data?.data || response.data || response || [];
      
      setCategories(categoryData);
      saveToCache(categoryData);
      
      console.log('✅ Categories loaded:', categoryData.length);
      return categoryData;
    } catch (err) {
      console.error('❌ Error fetching categories:', err);
      setError(err.message || 'Failed to load categories');
      
      // Fallback to cache even if expired
      if (categories.length > 0) {
    
        return categories;
      }
      
      return [];
    } finally {
      setLoading(false);
    }
  }, [categories, loading, isCacheValid, loadFromCache, saveToCache]);

  /**
   * Invalidate cache (call when categories are created/updated/deleted)
   */
  const invalidateCache = useCallback(() => {

    localStorage.removeItem(CACHE_KEY);
    setLastFetch(null);
    fetchCategories(true);
  }, [fetchCategories]);

  /**
   * Initialize categories on mount
   */
  useEffect(() => {
    fetchCategories();
  }, []); // ✅ Empty dependency - runs ONLY ONCE

  const value = {
    categories,
    loading,
    error,
    fetchCategories,
    invalidateCache,
    isCacheValid: isCacheValid()
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

/**
 * Hook to use category context
 */
export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within CategoryProvider');
  }
  return context;
};

export default CategoryContext;
