import { useQueryClient } from '@tanstack/react-query';
import type { TokenData } from './types';

/**
 * Utility hooks for managing authentication state.
 * Provides actions for refresh, clear, and cache management.
 */
export const useAuthActions = () => {
  const queryClient = useQueryClient();
  const queryKey = ['auth-tokens'];

  return {
    /**
     * Refresh authentication data by invalidating the query.
     */
    refreshAuth: () => queryClient.invalidateQueries({ queryKey }),

    /**
     * Clear authentication data from the cache (useful for logout).
     */
    clearAuth: () => {
      queryClient.setQueryData(queryKey, null);
      queryClient.removeQueries({ queryKey });
    },

    /**
     * Get the current cached authentication data without causing re-render.
     */
    getCurrentAuthData: (): TokenData | undefined => queryClient.getQueryData(queryKey),

    /**
     * Prefetch authentication data in the background.
     */
    prefetchAuth: () => queryClient.prefetchQuery({
      queryKey,
      staleTime: 5 * 60 * 1000, // same as your hook
    }),
  };
};
