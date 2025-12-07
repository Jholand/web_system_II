// API Service Layer for Laravel Backend Communication
// Auto-detect API URL based on hostname for mobile access
const getApiUrl = () => {
  const hostname = window.location.hostname;
  // For localhost development - use port 8000 (artisan serve)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000/api';
  }
  // For mobile access via local IP (e.g., 192.168.x.x) - use port 8000
  return `http://${hostname}:8000/api`;
};

const getBaseUrl = () => {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return `http://${hostname}:8000`;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || getApiUrl();
const BASE_URL = import.meta.env.VITE_BASE_URL || getBaseUrl();

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = null;
    this.requestCache = new Map(); // Request deduplication cache
    this.cacheTimeout = 1000; // 1 second cache for duplicate requests
    this.defaultTimeout = 30000; // ⚡ 30 second timeout (for slow connections)
    // Initialize token from localStorage
    this.initToken();
  }

  initToken() {
    try {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        this.token = storedToken;
      }
    } catch (e) {
      console.error('Failed to get token from localStorage:', e);
      // Clear if corrupted
      try {
        localStorage.removeItem('auth_token');
      } catch (clearError) {
        console.error('Failed to clear corrupted token:', clearError);
      }
    }
  }

  setToken(token) {
    this.token = token;
    if (token) {
      try {
        localStorage.setItem('auth_token', token);
      } catch (e) {
        console.error('Failed to store token (quota exceeded?):', e);
        // Try to clear old data and retry
        try {
          localStorage.removeItem('user_data');
          localStorage.setItem('auth_token', token);
        } catch (retryError) {
          console.error('Still failed after clearing user_data:', retryError);
        }
      }
    } else {
      try {
        localStorage.removeItem('auth_token');
      } catch (e) {
        console.error('Failed to remove token:', e);
      }
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    // Add CSRF token from cookie if available
    const xsrfToken = this.getCookie('XSRF-TOKEN');
    if (xsrfToken) {
      headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
    }
    
    return headers;
  }

  // Helper to get cookie value
  getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  async request(endpoint, options = {}) {
    console.log(`🌐 API Request START: ${endpoint}`, { method: options.method || 'GET', hasToken: !!this.token });
    
    const url = `${this.baseURL}${endpoint}`;
    
    // Request deduplication for GET requests
    const cacheKey = `${options.method || 'GET'}_${endpoint}`;
    if (!options.method || options.method === 'GET') {
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        console.log(`💾 Using cached request: ${endpoint}`);
        return cached.promise;
      }
    }
    
    const config = {
      ...options,
      credentials: 'include', // Enable cookies for CSRF protection
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };
    
    // ⚡ Only add timeout if connection is available
    if (options.timeout !== false && navigator.onLine) {
      try {
        config.signal = AbortSignal.timeout(options.timeout || this.defaultTimeout);
      } catch (e) {
        // AbortSignal.timeout not supported in older browsers
      }
    }

    const requestPromise = (async () => {
      try {
        console.log(`📡 Sending fetch to: ${url}`);
        const response = await fetch(url, config);
        console.log(`✅ Received response from ${endpoint}:`, { status: response.status, ok: response.ok });
        
        // Handle empty responses
        if (response.status === 204) {
          return null;
        }

        // Handle unauthorized - FIXED: Don't auto-logout, let AuthContext handle it
        if (response.status === 401) {
          const data = await response.json().catch(() => ({ message: 'Unauthorized' }));
          console.error('❌ Unauthorized:', data);
          throw new Error(data.message || 'Unauthorized. Please login again.');
        }

        // Handle forbidden
        if (response.status === 403) {
          const data = await response.json();
          console.error('❌ Forbidden:', data);
          throw new Error(data.message || 'Access denied.');
        }

        const data = await response.json();
        console.log(`📦 Parsed data from ${endpoint}:`, data);

        if (!response.ok) {
          // Handle validation errors (422)
          if (response.status === 422 && data.errors) {
            // Extract first error message from Laravel validation errors
            const firstError = Object.values(data.errors)[0];
            throw new Error(Array.isArray(firstError) ? firstError[0] : firstError);
          }
          
          throw new Error(data.message || 'API request failed');
        }

        return data;
      } catch (error) {
        console.error('API Error:', error);
        // Remove from cache on error
        this.requestCache.delete(cacheKey);
        throw error;
      }
    })();
    
    // Cache GET requests to prevent duplicates
    if (!options.method || options.method === 'GET') {
      this.requestCache.set(cacheKey, {
        promise: requestPromise,
        timestamp: Date.now()
      });
      
      // Clear cache after timeout
      setTimeout(() => {
        this.requestCache.delete(cacheKey);
      }, this.cacheTimeout);
    }
    
    return requestPromise;
  }

  // Get CSRF Cookie before authentication requests
  async getCsrfCookie() {
    try {
      await fetch(`${BASE_URL}/sanctum/csrf-cookie`, {
        credentials: 'include',
      });
    } catch (error) {
      console.error('CSRF Cookie Error:', error);
    }
  }

  // Authentication - ULTRA-FAST LOGIN
  async login(credentials) {
    // OPTIMIZED: Get CSRF and login in parallel (non-blocking)
    this.getCsrfCookie(); // Fire and forget - don't await
    
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async register(userData) {
    await this.getCsrfCookie();
    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    const response = await this.request('/logout', { method: 'POST' });
    this.setToken(null);
    return response;
  }

  async getCurrentUser() {
    return this.request('/me');
  }

  async checkAuth() {
    return this.request('/auth/check');
  }

  // Destinations
  async getDestinations(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/destinations${query ? `?${query}` : ''}`);
  }

  async getDestinationById(id) {
    return this.request(`/destinations/${id}`);
  }

  async createDestination(data) {
    return this.request('/destinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDestination(id, data) {
    return this.request(`/destinations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDestination(id) {
    return this.request(`/destinations/${id}`, {
      method: 'DELETE',
    });
  }

  // Check-ins / Visits
  async checkIn(qrCode) {
    return this.request('/visits/check-in', {
      method: 'POST',
      body: JSON.stringify({ qr_code: qrCode }),
    });
  }

  async getUserVisits(userId) {
    return this.request(`/visits/user/${userId}`);
  }

  // Badges
  async getBadges() {
    return this.request('/badges');
  }

  async createBadge(data) {
    return this.request('/badges', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBadge(id, data) {
    return this.request(`/badges/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteBadge(id) {
    return this.request(`/badges/${id}`, {
      method: 'DELETE',
    });
  }

  // Rewards / Souvenirs
  async getRewards() {
    return this.request('/rewards');
  }

  async createReward(data) {
    return this.request('/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReward(id, data) {
    return this.request(`/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteReward(id) {
    return this.request(`/rewards/${id}`, {
      method: 'DELETE',
    });
  }

  async redeemReward(rewardId, destinationId) {
    return this.request('/rewards/redeem', {
      method: 'POST',
      body: JSON.stringify({ reward_id: rewardId, destination_id: destinationId }),
    });
  }

  async getUserRewards(userId) {
    return this.request(`/user-rewards/${userId}`);
  }

  // Reviews
  async createReview(visitId, data) {
    return this.request(`/visits/${visitId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Dashboard Statistics
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getUserActivity(userId) {
    return this.request(`/users/${userId}/activity`);
  }

  // QR Code Generation
  async generateQRCode(destinationId) {
    return this.request(`/destinations/${destinationId}/qr-code`);
  }
}

export default new ApiService();
