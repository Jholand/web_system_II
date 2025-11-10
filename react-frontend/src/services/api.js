// API Service Layer for Laravel Backend Communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
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
    
    return headers;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication
  async login(credentials) {
    return this.request('/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData) {
    return this.request('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async logout() {
    return this.request('/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/user');
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
