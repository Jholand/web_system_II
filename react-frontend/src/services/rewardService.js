import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const getAuthToken = () => localStorage.getItem('auth_token');

const getAuthHeaders = () => ({
  Authorization: `Bearer ${getAuthToken()}`
});

export const rewardService = {
  // Get all available rewards (public - no auth required)
  getAllRewards: async (filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/rewards`, {
        params: filters,
        timeout: 30000, // ⚡ 30 second timeout
        headers: {
          'Cache-Control': 'max-age=3600' // 1 hour cache
        }
      });
      
      return response.data.data || response.data || [];
    } catch (error) {
      console.error('Error fetching rewards:', error);
      throw error;
    }
  },

  // Get user's redeemed rewards (requires auth)
  getUserRedemptions: async () => {
    const response = await axios.get(`${API_URL}/user/rewards/redemptions`, {
      headers: getAuthHeaders(),
      timeout: 30000 // ⚡ 30 second timeout
    });
    return response.data;
  },

  // Redeem a reward
  redeemReward: async (rewardId, destinationId) => {
    const response = await axios.post(
      `${API_URL}/user/rewards/${rewardId}/redeem`,
      {
        latitude: 0, // ⚡ Location not required anymore
        longitude: 0,
        destination_id: destinationId
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  },

  // Change/swap a redeemed reward
  changeReward: async (redemptionId, newRewardId, destinationId) => {
    const response = await axios.post(
      `${API_URL}/user/rewards/redemptions/${redemptionId}/change`,
      {
        new_reward_id: newRewardId,
        latitude: 0, // ⚡ Location not required anymore
        longitude: 0,
        destination_id: destinationId
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  },

  // Get rewards available at current location
  getAvailableAtLocation: async (latitude, longitude) => {
    const response = await axios.post(
      `${API_URL}/user/rewards/available-at-location`,
      {
        latitude,
        longitude
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  }
};

export default rewardService;
