import { useTokenData } from "./index";
import { AuthTokenData } from "./types";

/**
 * Hook for basic token authentication status.
 * Provides authentication state and loading status.
 */


export const useAsyncAuthentication = () => {
  const { data = {}, isLoading } = useTokenData() as { data?: AuthTokenData; isLoading: boolean; status: string };

  const { hasAccessToken = false } = data || {};

  return {
    isAuthenticated: hasAccessToken,
    isLoading
  };
};
