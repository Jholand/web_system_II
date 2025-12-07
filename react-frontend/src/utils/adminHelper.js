// Helper function to get current admin data from localStorage
export const getCurrentAdmin = () => {
  const userData = localStorage.getItem('user_data');
  if (userData) {
    const user = JSON.parse(userData);
    return {
      id: user.id,
      role_id: user.role_id,
      name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Admin',
      role: user.role === 'admin' || user.role_id === 1 ? 'Administrator' : 'User'
    };
  }
  return { name: 'Admin', role: 'Administrator' };
};
