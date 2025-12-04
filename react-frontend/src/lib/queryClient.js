import { QueryClient } from '@tanstack/react-query';

// ⚡ INSTANT LOAD React Query Configuration
// Like TikTok/Facebook - shows cached data INSTANTLY while refetching in background
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ INSTANT + ALWAYS FRESH - Best of both worlds
      staleTime: 0, // ALWAYS fetch fresh data
      gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
      
      // ⚡ PERFORMANCE: Smart refetching
      refetchOnWindowFocus: true, // ✅ Refresh when user returns (get latest data)
      refetchOnReconnect: true, // ✅ Refetch when internet reconnects
      refetchOnMount: true, // ✅ ALWAYS get fresh data on mount
      refetchInterval: false, // No automatic polling
      
      // ✅ PERFORMANCE: Retry failed requests
      retry: 1, // Only retry once
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // ✅ UX: Keep showing old data while fetching new data
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // ✅ INSTANT: Optimistic updates
      retry: false, // Don't retry mutations
    },
  },
});
