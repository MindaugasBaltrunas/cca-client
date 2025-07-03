import { useTokenData } from "./index";

/**
 * Hook for checking if user has valid authentication tokens
 * Returns null while loading, boolean when ready
 */
export const useTokenCheck = () => {
  const { data, isLoading } = useTokenData();
  
  if (isLoading) return null;
  return data?.hasValidToken ?? false;
};