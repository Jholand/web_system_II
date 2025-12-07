import { QueryClient } from '@tanstack/react-query';

// ⚡ BALANCED SPEED + DATA React Query Configuration
// Fast loading with automatic data fetching when needed
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ⚡ SMART CACHING: 30 min cache, auto-refetch when stale
      staleTime: 30 * 60 * 1000, // ⚡ 30 MIN - balanced performance
      gcTime: 120 * 60 * 1000, // 2 HOUR cache retention
      
      // ✅ SMART: Always show data, fetch when needed!
      refetchOnWindowFocus: false, // No refetch on tab switch
      refetchOnReconnect: false, // No refetch on reconnect
      refetchOnMount: true, // ✅ YES - fetch fresh data on mount
      refetchInterval: false, // No automatic polling
      
      // ✅ PERFORMANCE: Retry on failure
      retry: 2, // Retry twice
      retryDelay: 1000, // 1 second delay
      
      // ✅ UX: Keep showing old data while fetching new data
      placeholderData: (previousData) => previousData,
    },
    mutations: {
      // ✅ INSTANT: Optimistic updates
      retry: false, // Don't retry mutations
    },
  },
});
