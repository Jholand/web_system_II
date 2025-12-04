import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// ⚡ INSTANT LOAD Custom Hooks with React Query
// Shows cached data IMMEDIATELY, refetches in background

export const useUserBadges = () => {
  return useQuery({
    queryKey: ['user', 'badges'],
    queryFn: async () => {
      const response = await api.request('/user/badges');
      if (response.success) {
        const data = {
          earned: response.data.earned || [],
          locked: response.data.available || [],
          summary: response.data.summary || {}
        };
        return data;
      }
      throw new Error('Failed to fetch badges');
    },
    staleTime: 1 * 1000, // ⚡ 1 second - ULTRA AGGRESSIVE refresh
    gcTime: 15 * 60 * 1000,
    refetchOnMount: true, // ⚡ ALWAYS fetch fresh data on mount
    refetchOnWindowFocus: true, // ⚡ Refresh when user returns
    placeholderData: (previousData) => previousData,
    initialData: { earned: [], locked: [], summary: {} },
  });
};

export const useCheckins = (limit = 5) => {
  return useQuery({
    queryKey: ['checkins', { limit }],
    queryFn: async () => {
      const response = await api.request('/checkins');
      if (response.success) {
        const checkinsData = response.data?.data || response.data || [];
        const checkins = (Array.isArray(checkinsData) ? checkinsData : []).slice(0, limit).map(checkin => ({
          id: checkin.checkin_id || checkin.id,
          location: checkin.destination?.name || 'Unknown Location',
          points: checkin.points_earned || checkin.destination?.points_reward || 0,
          time: new Date(checkin.checked_in_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: 'success'
        }));
        return { checkins, total: checkinsData.length };
      }
      throw new Error('Failed to fetch checkins');
    },
    staleTime: 1 * 1000, // ⚡ 1 second - ULTRA AGGRESSIVE refresh
    gcTime: 15 * 60 * 1000,
    refetchOnMount: true, // ⚡ ALWAYS fetch fresh data
    refetchOnWindowFocus: true, // ⚡ Refresh when user returns
    placeholderData: (previousData) => previousData,
    initialData: { checkins: [], total: 0 },
  });
};

export const useCheckinStats = () => {
  return useQuery({
    queryKey: ['checkins', 'stats'],
    queryFn: async () => {
      const response = await api.request('/checkins/stats');
      if (response.success) {
        return response.data;
      }
      throw new Error('Failed to fetch stats');
    },
    staleTime: 1 * 1000, // ⚡ 1 second - ULTRA AGGRESSIVE refresh
    gcTime: 15 * 60 * 1000,
    refetchOnMount: true, // ⚡ ALWAYS fetch fresh data
    refetchOnWindowFocus: true, // ⚡ Refresh when user returns
    placeholderData: (previousData) => previousData,
    initialData: { total_visits: 0, total_points: 0, badges_earned: 0, current_streak: 0, today: 0, this_week: 0, this_month: 0 },
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
