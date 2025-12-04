import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

const categoryService = {
  /**
   * Get all destination categories
   * @param {Object} params - Query parameters (is_active, search, per_page)
   * @returns {Promise}
   */
  getAllCategories: async (params = {}) => {
    const response = await axios.get(`${API_URL}/categories`, { params });
    return response.data;
  },

  /**
   * Get a single category by ID
   * @param {number} id - Category ID
   * @returns {Promise}
   */
  getCategory: async (id) => {
    const response = await axios.get(`${API_URL}/categories/${id}`);
    return response.data;
  },

  /**
   * Get active categories only
   * @returns {Promise}
   */
  getActiveCategories: async () => {
    const response = await axios.get(`${API_URL}/categories`, {
      params: { is_active: true }
    });
    return response.data;
  },
};

export default categoryService;
