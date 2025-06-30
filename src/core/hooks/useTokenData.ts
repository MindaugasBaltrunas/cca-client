import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getId } from "../../infrastructure/services/tokenStorage";
import type { TokenData } from "./types";

/**
 * Core hook for managing all token-related data
 * Consolidates token and user ID fetching into a single query
 */
export const useTokenData = () => {
  return useQuery({
    queryKey: ['auth-tokens'],
    queryFn: async (): Promise<TokenData> => {
      try {
        const [token, userId] = await Promise.all([
          getAccessToken(),
          Promise.resolve(getId())
        ]);
        
        return {
          accessToken: token,
          userId: userId,
          hasValidToken: !!(token && userId),
          hasAccessToken: !!token,
          hasUserId: !!userId
        };
      } catch (error) {
        return {
          accessToken: null,
          userId: null,
          hasValidToken: false,
          hasAccessToken: false,
          hasUserId: false
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false
  });
};