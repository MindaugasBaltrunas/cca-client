import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getId } from "../../../infrastructure/services/tokenStorage";
import type { TokenData } from "../types/auth.types";

export const useTokenData = () => {
  const fetchTokenData = async (): Promise<TokenData> => {
    try {
      const [accessToken, userId] = await Promise.all([
        getAccessToken(),
        getId(),
      ]);

      const hasAccessToken = Boolean(accessToken);
      const hasUserId = Boolean(userId);
      const hasValidToken = hasAccessToken && hasUserId;
      return {
        accessToken,
        userId,
        hasAccessToken,
        hasUserId,
        hasValidToken,
      };
    } catch {
      return {
        accessToken: null,
        userId: null,
        hasAccessToken: false,
        hasUserId: false,
        hasValidToken: false,
      };
    }
  };

  return useQuery({
    queryKey: ['auth-tokens'],
    queryFn: fetchTokenData,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });
};