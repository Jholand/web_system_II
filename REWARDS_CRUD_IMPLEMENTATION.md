# Rewards CRUD Implementation Guide

## Backend Setup ✅ COMPLETED

### 1. Request Files
- ✅ **StoreRewardRequest.php** - Updated with proper validation
  - Fixed `category_id` validation to use `destination_categories,category_id`
  - Added `prepareForValidation()` for auto-slug generation and defaults
  - Proper boolean handling for `stock_unlimited`

- ✅ **UpdateRewardRequest.php** - Updated with proper validation
  - Fixed `category_id` validation
  - Added `prepareForValidation()` method
  - Handles partial updates with `sometimes` rules

### 2. Controller
- ✅ **RewardController.php** - Complete CRUD implementation
  - Uses `ApiResponses` trait for consistent responses
  - Uses `RewardResource` for data transformation
  - Implements caching (60 seconds) with proper cache clearing
  - Methods: `index()`, `store()`, `show()`, `update()`, `destroy()`

### 3. Model & Resource
- ✅ **Reward.php** - Already has traits and relationships
  - Uses: Searchable, Filterable, Cacheable, HasSlug
  - Relationships: `category()`, `redemptions()`, `users()`

- ✅ **RewardResource.php** - Already transforms data properly
  - Returns structured JSON with category, stock, validity, partner info

## Frontend Implementation Needed

### Key Changes Required in `react-frontend/src/pages/admin/Rewards.jsx`:

1. **Add Imports**
```jsx
import { useEffect, useCallback } from 'react';
import axios from 'axios';
const API_BASE_URL = 'http://localhost:8000/api';
```

2. **Add State Management**
```jsx
const [rewards, setRewards] = useState([]);
const [categories, setCategories] = useState([]);
const [loading, setLoading] = useState(true);
const [fetching, setFetching] = useState(false);
const [formData, setFormData] = useState({
  category_id: null,
  title: '',
  description: '',
  terms_conditions: '',
  points_required: 0,
  stock_quantity: 0,
  stock_unlimited: false,
  max_redemptions_per_user: 1,
  valid_from: '',
  valid_until: '',
  redemption_period_days: 30,
  partner_name: '',
  partner_contact: '',
  image_url: '',
  is_active: true,
  is_featured: false,
});
```

3. **Add API Functions**
```jsx
const fetchRewards = useCallback(async () => {
  try {
    setFetching(true);
    const response = await axios.get(`${API_BASE_URL}/rewards`, {
      params: {
        _t: Date.now(), // Cache buster
      },
    });
    setRewards(response.data.data || []);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    toast.error('Failed to load rewards');
  } finally {
    setLoading(false);
    setFetching(false);
  }
}, []);

const fetchCategories = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/categories`, {
      params: {
        per_page: 100,
        _t: Date.now(),
      },
    });
    setCategories(response.data.data || []);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

useEffect(() => {
  fetchCategories();
  fetchRewards();
}, [fetchRewards]);
```

4. **Add Save Handler**
```jsx
const handleSave = async () => {
  try {
    if (!formData.title || !formData.category_id) {
      toast.error('Please fill in required fields');
      return;
    }

    const dataToSend = {
      ...formData,
      category_id: formData.category_id ? parseInt(formData.category_id) : null,
      points_required: parseInt(formData.points_required) || 0,
      stock_quantity: parseInt(formData.stock_quantity) || 0,
      stock_unlimited: Boolean(formData.stock_unlimited),
      max_redemptions_per_user: parseInt(formData.max_redemptions_per_user) || 1,
      redemption_period_days: parseInt(formData.redemption_period_days) || 30,
      is_active: Boolean(formData.is_active),
      is_featured: Boolean(formData.is_featured),
    };

    if (modalState.mode === 'add') {
      await axios.post(`${API_BASE_URL}/rewards`, dataToSend);
      closeModal();
      
      // Force immediate refresh
      const response = await axios.get(`${API_BASE_URL}/rewards`, {
        params: { _t: Date.now() },
      });
      setRewards(response.data.data || []);
      toast.success('Reward added successfully!');
    } else if (modalState.mode === 'edit') {
      await axios.put(`${API_BASE_URL}/rewards/${modalState.data.id}`, dataToSend);
      closeModal();
      
      // Force immediate refresh
      const response = await axios.get(`${API_BASE_URL}/rewards`, {
        params: { _t: Date.now() },
      });
      setRewards(response.data.data || []);
      toast.success('Reward updated successfully!');
    }
  } catch (error) {
    console.error('Error saving reward:', error);
    const errorMessage = error.response?.data?.message || 'Failed to save reward';
    
    if (error.response?.data?.errors) {
      const errors = error.response.data.errors;
      Object.keys(errors).forEach(field => {
        toast.error(`${field}: ${errors[field].join(', ')}`);
      });
    } else {
      toast.error(errorMessage);
    }
  }
};
```

5. **Add Delete Handler**
```jsx
const confirmDelete = async () => {
  try {
    await axios.delete(`${API_BASE_URL}/rewards/${modalState.data.id}`);
    closeModal();
    
    // Force immediate refresh
    const response = await axios.get(`${API_BASE_URL}/rewards`, {
      params: { _t: Date.now() },
    });
    setRewards(response.data.data || []);
    toast.success('Reward deleted successfully!');
  } catch (error) {
    console.error('Error deleting reward:', error);
    toast.error('Failed to delete reward');
  }
};
```

6. **Update Modal Handlers**
```jsx
const openModal = (mode, data = null) => {
  setModalState({ isOpen: true, mode, data });
  
  if (mode === 'edit' && data) {
    setFormData({
      category_id: data.category_id || null,
      title: data.title || '',
      description: data.description || '',
      terms_conditions: data.terms_conditions || '',
      points_required: data.points_required || 0,
      stock_quantity: data.stock?.quantity || 0,
      stock_unlimited: data.stock?.unlimited || false,
      max_redemptions_per_user: data.max_redemptions_per_user || 1,
      valid_from: data.validity?.from || '',
      valid_until: data.validity?.until || '',
      redemption_period_days: data.validity?.redemption_period_days || 30,
      partner_name: data.partner?.name || '',
      partner_contact: data.partner?.contact || '',
      image_url: data.image_url || '',
      is_active: data.is_active ?? true,
      is_featured: data.is_featured ?? false,
    });
  } else if (mode === 'add') {
    setFormData({
      category_id: null,
      title: '',
      description: '',
      terms_conditions: '',
      points_required: 0,
      stock_quantity: 0,
      stock_unlimited: false,
      max_redemptions_per_user: 1,
      valid_from: '',
      valid_until: '',
      redemption_period_days: 30,
      partner_name: '',
      partner_contact: '',
      image_url: '',
      is_active: true,
      is_featured: false,
    });
  }
};

const handleInputChange = (e) => {
  const { name, value, type, checked } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: type === 'checkbox' ? checked : value
  }));
};
```

7. **Update Modal Form Fields** - Replace hardcoded categories with API data
```jsx
<select 
  name="category_id"
  value={formData.category_id || ''}
  onChange={handleInputChange}
  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm text-slate-900 bg-white border-2 border-slate-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
>
  <option value="">Select category</option>
  {categories.map((cat) => (
    <option key={cat.id} value={cat.id}>
      {cat.icon} {cat.name}
    </option>
  ))}
</select>
```

8. **Update Data Display** - Map API response structure
```jsx
{paginatedRewards.map((reward) => (
  <motion.div key={reward.id} variants={slideInFromRight}>
    <div className="group bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-slate-200 relative">
      {/* ... */}
      <h4 className="text-lg font-semibold text-slate-900 mb-2">{reward.title}</h4>
      <p className="text-sm text-slate-600">{reward.description}</p>
      <p className="text-xs font-medium text-teal-600">{reward.points_required}</p>
      <p className="text-lg font-semibold text-slate-900">
        {reward.stock?.quantity || 0} / {reward.stock?.unlimited ? '∞' : (reward.stock?.quantity || 0)}
      </p>
    </div>
  </motion.div>
))}
```

9. **Add Loading States**
```jsx
{loading ? (
  <div className="flex items-center justify-center py-20">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-slate-600 font-medium">Loading rewards...</p>
    </div>
  </div>
) : paginatedRewards.length > 0 ? (
  // Rewards grid
) : (
  // Empty state
)}
```

## Testing Checklist

- [ ] Backend rewards endpoint works: `GET /api/rewards`
- [ ] Create reward works with proper validation
- [ ] Update reward works
- [ ] Delete reward works (soft delete)
- [ ] Categories load in dropdown
- [ ] Real-time updates (cache-busting works)
- [ ] Form validation shows proper errors
- [ ] Stock unlimited checkbox toggles stock quantity field
- [ ] Date fields work properly
- [ ] Pagination works with filtered rewards
- [ ] Search works across title/description
- [ ] Category filter works

## API Endpoints

- `GET /api/rewards` - List all rewards (with filters)
- `POST /api/rewards` - Create new reward
- `GET /api/rewards/{id}` - View single reward
- `PUT /api/rewards/{id}` - Update reward
- `DELETE /api/rewards/{id}` - Delete reward (soft delete)

All endpoints use the `ApiResponses` trait for consistent JSON structure.
