import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ⚡ INSTANT LOAD Custom Hooks with React Query
// Shows cached data IMMEDIATELY, refetches in background

export const useUserBadges = () => {
  console.log('🎣 useUserBadges hook called');
  return useQuery({
    queryKey: ['user', 'badges'],
    queryFn: async () => {
      console.log('🎖️ QUERYFUNCTION EXECUTING - Fetching badges...');
      const response = await api.request('/user/badges');
      console.log('🎖️ Badges API Response:', response);
      
      if (response && response.success) {
        const data = {
          earned: response.data.earned || [],
          locked: response.data.available || [],
          summary: response.data.summary || {}
        };
        localStorage.setItem('cached_user_badges', JSON.stringify({ ...data, timestamp: Date.now() }));
        return data;
      }
      throw new Error('Failed to fetch badges');
    },
    staleTime: 0, // Always fetch fresh
    gcTime: 5 * 60 * 1000, // 5 min cache
    refetchOnMount: 'always', // Always fetch on mount
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    initialData: { earned: [], locked: [], summary: {} },
  });
};

export const useCheckins = (limit = 10) => {
  console.log('🎣 useCheckins hook called with limit:', limit);
  return useQuery({
    queryKey: ['checkins', limit],
    queryFn: async () => {
      console.log('📋 QUERYFUNCTION EXECUTING - Starting checkins fetch...');
      try {
        const response = await api.request('/checkins');
        console.log('✅ Checkins API Full Response:', response);
        
        if (response && response.success) {
          // Handle Laravel response: response.data is the array directly
          const checkinsArray = Array.isArray(response.data) ? response.data : [];
          console.log('✅ Checkins Array length:', checkinsArray.length);
          
          if (checkinsArray.length === 0) {
            console.warn('⚠️ No check-ins found in database');
          }
          
          const checkins = checkinsArray.slice(0, limit).map(c => ({
            id: c.id || c.checkin_id,
            location: c.destination?.name || 'Unknown Location',
            points: c.points_earned || c.destination?.points_reward || 0,
            time: new Date(c.checked_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            status: 'success'
          }));
          
          const data = { checkins, total: checkins.length };
          localStorage.setItem('cached_user_checkins', JSON.stringify({ ...data, timestamp: Date.now() }));
          return data;
        }
        console.error('❌ API returned unsuccessful response');
        return { checkins: [], total: 0 };
      } catch (error) {
        console.error('❌ Failed to fetch checkins:', error);
        return { checkins: [], total: 0 };
      }
    },
    staleTime: 0, // Always fetch fresh
    gcTime: 60 * 1000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    initialData: { checkins: [], total: 0 },
  });
};

export const useCheckinStats = () => {
  console.log('🎣 useCheckinStats hook called');
  return useQuery({
    queryKey: ['checkins', 'stats'],
    queryFn: async () => {
      console.log('📊 QUERYFUNCTION EXECUTING - Starting stats fetch...');
      try {
        const response = await api.request('/checkins/stats');
        console.log('✅ Checkin Stats Full Response:', response);
        
        if (response && response.success) {
          const stats = response.data || {};
          console.log('✅ Processed Stats:', stats);
          localStorage.setItem('cached_checkin_stats', JSON.stringify({ ...stats, timestamp: Date.now() }));
          return stats;
        }
        console.error('❌ Stats API returned unsuccessful response');
        return { total_visits: 0, total_points: 0, badges_earned: 0, current_streak: 0, today: 0, this_week: 0, this_month: 0, all_time: 0 };
      } catch (error) {
        console.error('❌ Failed to fetch checkin stats:', error);
        // Return cached data if API fails
        const cached = localStorage.getItem('cached_checkin_stats');
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            console.log('✅ Using cached stats:', parsed);
            return parsed;
          } catch (e) {
            console.error('Failed to parse cached stats:', e);
          }
        }
        // Return default values
        return { total_visits: 0, total_points: 0, badges_earned: 0, current_streak: 0, today: 0, this_week: 0, this_month: 0 };
      }
    },
    staleTime: 5 * 1000, // 5 seconds - fetch fresh data
    gcTime: 60 * 1000, // 1 minute cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 2,
    initialData: { total_visits: 0, total_points: 0, badges_earned: 0, current_streak: 0, today: 0, this_week: 0, this_month: 0, all_time: 0 },
  });
};

export const useSavedLocations = () => {
  return useQuery({
    queryKey: ['saved', 'locations'],
    queryFn: async () => {
      const response = await api.request('/user/saved-destinations');
      if (response.success) {
        return response.data || [];
      }
      throw new Error('Failed to fetch saved locations');
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    initialData: [],
  });
};

export const useDestinations = () => {
  return useQuery({
    queryKey: ['destinations'],
    queryFn: async () => {
      const response = await api.request('/destinations');
      if (response.success) {
        return response.data || [];
      }
      throw new Error('Failed to fetch destinations');
    },
    staleTime: 60 * 1000, // Destinations change less frequently
    gcTime: 10 * 60 * 1000,
    placeholderData: (previousData) => previousData,
    initialData: [],
  });
};

// ⚡ PREFETCH: Preload all data in background
export const usePrefetchUserData = () => {
  const queryClient = useQueryClient();
  
  const prefetchAll = () => {
    queryClient.prefetchQuery({
      queryKey: ['user', 'badges'],
      queryFn: async () => {
        const response = await api.request('/user/badges');
        return response.success ? {
          earned: response.data.earned || [],
          locked: response.data.available || [],
          summary: response.data.summary || {}
        } : null;
      },
    });
    
    queryClient.prefetchQuery({
      queryKey: ['checkins'],
      queryFn: async () => {
        const response = await api.request('/checkins');
        return response.success ? response.data : null;
      },
    });
    
    queryClient.prefetchQuery({
      queryKey: ['checkins', 'stats'],
      queryFn: async () => {
        const response = await api.request('/checkins/stats');
        return response.success ? response.data : null;
      },
    });
    
    queryClient.prefetchQuery({
      queryKey: ['saved', 'locations'],
      queryFn: async () => {
        const response = await api.request('/user/saved-destinations');
        return response.success ? response.data : null;
      },
    });
  };
  
  return { prefetchAll };
};
