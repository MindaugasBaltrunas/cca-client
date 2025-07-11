import { useTokenData } from "./useTokenData";

/**
 * Simplified hook for components that only need token info
 */
export const useAccessToken = () => {
  const { data, isLoading, error } = useTokenData();
  
  return {
    token: data?.accessToken ?? null,
    hasToken: data?.hasAccessToken ?? false,
    hasValidToken: data?.hasValidToken ?? false,
    userId: data?.userId ?? null,
    isLoading,
    error
  };
};