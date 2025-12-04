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
        params: filters
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
      headers: getAuthHeaders()
    });
    return response.data;
  },

  // Redeem a reward
  redeemReward: async (rewardId, location) => {
    const response = await axios.post(
      `${API_URL}/user/rewards/${rewardId}/redeem`,
      {
        latitude: location.latitude,
        longitude: location.longitude,
        destination_id: location.destination_id
      },
      {
        headers: getAuthHeaders()
      }
    );
    return response.data;
  },

  // Change/swap a redeemed reward
  changeReward: async (redemptionId, newRewardId, location) => {
    const response = await axios.post(
      `${API_URL}/user/rewards/redemptions/${redemptionId}/change`,
      {
        new_reward_id: newRewardId,
        latitude: location.latitude,
        longitude: location.longitude,
        destination_id: location.destination_id
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
