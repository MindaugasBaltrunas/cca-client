import { useTokenData } from "./index";

/**
 * Hook for accessing token data
 * Simplified interface for components that only need token info
 */
export const useAccessToken = () => {
  const { data, isLoading, error } = useTokenData();
  
  return {
    token: data?.accessToken ?? null,
    hasToken: data?.hasAccessToken ?? false,
    isLoading,
    error
  };
};