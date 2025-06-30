import { useQueryClient } from '@tanstack/react-query';
import type { TokenData } from './types';

/**
 * Utility hooks for managing authentication state
 * Provides actions for refresh, clear, and cache management
 */
export const useAuthActions = () => {
  const queryClient = useQueryClient();
  
  return {
    /**
     * Refresh all authentication data
     */
    refreshAuth: () => queryClient.invalidateQueries({ queryKey: ['auth-tokens'] }),
    
    /**
     * Clear authentication cache (for logout)
     */
    clearAuth: () => {
      queryClient.setQueryData(['auth-tokens'], null);
      queryClient.removeQueries({ queryKey: ['auth-tokens'] });
    },
    
    /**
     * Get current auth data without triggering re-render
     */
    getCurrentAuthData: (): TokenData | undefined => queryClient.getQueryData(['auth-tokens']),
    
    /**
     * Prefetch authentication data
     */
    prefetchAuth: () => queryClient.prefetchQuery({
      queryKey: ['auth-tokens'],
      staleTime: 5 * 60 * 1000
    })
  };
};