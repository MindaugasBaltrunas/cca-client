import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getId } from "../../infrastructure/services/tokenStorage";
import type { TokenData } from "./types";
import { logger } from "../../shared/utils/logger";

/**
 * Core hook for managing all token-related data.
 * Consolidates token and user ID fetching into a single query.
 */
export const useTokenData = () => {
  const fetchTokenData = async (): Promise<TokenData> => {
    try {
      const [accessToken, userId] = await Promise.all([
        getAccessToken(),
        Promise.resolve(getId())
      ]);

      const hasAccessToken = Boolean(accessToken);
      const hasUserId = Boolean(userId);
      const hasValidToken = hasAccessToken && hasUserId;
      logger.debug("Token data fetched:", { hasUserId, hasAccessToken, hasValidToken, accessToken, userId });
      return {
        accessToken,
        userId,
        hasAccessToken,
        hasUserId,
        hasValidToken
      };
    } catch {
      return {
        accessToken: null,
        userId: null,
        hasAccessToken: false,
        hasUserId: false,
        hasValidToken: false
      };
    }
  };

  const query = useQuery({
    queryKey: ['auth-tokens'],
    queryFn: fetchTokenData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });

  return {
    ...query
  };
};
