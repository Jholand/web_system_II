import axios from 'axios';

// Auto-detect API URL
const getApiUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  return `http://${hostname}:8000/api`;
};

const API_BASE_URL = getApiUrl();

/**
 * Preload and cache all critical data for instant page loads
 */
export const preloadAllData = async () => {
  const preloadTasks = [
    preloadCategories(),
    preloadDestinations(),
    preloadBadges(),
    preloadRewards(),
  ];

  try {
    await Promise.allSettled(preloadTasks);
    console.log('✅ All data preloaded successfully');
  } catch (error) {
    console.error('❌ Error preloading data:', error);
  }
};

/**
 * Preload categories
 */
const preloadCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: { per_page: 100 }
    });
    const data = response.data.data || [];
    localStorage.setItem('cached_categories', JSON.stringify({
      categories: data,
      total: data.length,
      timestamp: Date.now()
    }));
    localStorage.setItem('cached_destination_categories', JSON.stringify(data));
    localStorage.setItem('cached_badge_categories', JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
    localStorage.setItem('cached_map_categories', JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to preload categories:', error);
  }
};

/**
 * Preload destinations
 */
const preloadDestinations = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/destinations`, {
      params: { per_page: 100 }
    });
    const data = response.data.data || [];
    const meta = response.data.meta || {};
    
    const transformed = data.map(dest => ({
      id: dest.id,
      name: dest.name,
      slug: dest.slug,
      category: dest.category?.name?.toLowerCase() || 'hotel',
      categoryId: dest.category?.id || '',
      categoryIcon: dest.category?.icon || '📍',
      categoryName: dest.category?.name || 'Uncategorized',
      address: `${dest.address?.street || ''} ${dest.address?.barangay || ''}, ${dest.address?.city || ''}, ${dest.address?.province || ''}`.trim(),
      latitude: dest.coordinates?.latitude || 0,
      longitude: dest.coordinates?.longitude || 0,
      qrCode: dest.qr_code || '',
      visits: dest.stats?.total_visits || 0,
      reviews: dest.stats?.total_reviews || 0,
      points: dest.points_reward || 50,
      description: dest.description || '',
      images: dest.images || [],
    }));
    
    // Cache for Destinations page
    localStorage.setItem('cached_destinations_list', JSON.stringify({
      destinations: transformed,
      total: meta.total || data.length,
      timestamp: Date.now()
    }));
    
    // Cache for AdminMap page
    localStorage.setItem('cached_map_destinations', JSON.stringify({
      data: transformed,
      timestamp: Date.now()
    }));
    
    // Cache for Rewards page (destination list)
    localStorage.setItem('cached_destinations', JSON.stringify(data));
  } catch (error) {
    console.error('Failed to preload destinations:', error);
  }
};

/**
 * Preload badges
 */
const preloadBadges = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/badges`);
    const data = response.data.data || [];
    localStorage.setItem('cached_badges', JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Failed to preload badges:', error);
  }
};

/**
 * Preload rewards
 */
const preloadRewards = async () => {
  try {
    const [rewardsRes, categoriesRes] = await Promise.all([
      axios.get(`${API_BASE_URL}/rewards`),
      axios.get(`${API_BASE_URL}/reward-categories`)
    ]);
    
    const rewards = rewardsRes.data.data || [];
    const categories = categoriesRes.data.data || [];
    
    localStorage.setItem('cached_rewards', JSON.stringify({
      data: rewards,
      timestamp: Date.now()
    }));
    
    localStorage.setItem('cached_reward_categories', JSON.stringify(categories));
  } catch (error) {
    console.error('Failed to preload rewards:', error);
  }
};

/**
 * Check if cache needs refresh
 */
export const shouldRefreshCache = (cacheKey, maxAge = 300000) => { // 5 min default
  const cached = localStorage.getItem(cacheKey);
  if (!cached) return true;
  
  try {
    const parsed = JSON.parse(cached);
    const age = Date.now() - (parsed.timestamp || 0);
    return age > maxAge;
  } catch {
    return true;
  }
};

/**
 * Clear all caches
 */
export const clearAllCaches = () => {
  const cacheKeys = [
    'cached_categories',
    'cached_destination_categories',
    'cached_badge_categories',
    'cached_map_categories',
    'cached_destinations_list',
    'cached_map_destinations',
    'cached_destinations',
    'cached_badges',
    'cached_rewards',
    'cached_reward_categories'
  ];
  
  cacheKeys.forEach(key => localStorage.removeItem(key));
  console.log('🗑️ All caches cleared');
};
