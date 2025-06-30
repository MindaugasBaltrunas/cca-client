import { useTokenData } from "./useTokenData";

/**
 * Hook for basic token authentication status
 * Provides authentication state and loading status
 */
export const useAsyncAuthentication = () => {
  const { data, isLoading } = useTokenData();
  
  return {
    isAuthenticated: data?.hasAccessToken ?? false,
    isLoading
  };
};