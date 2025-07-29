import { useQuery } from "@tanstack/react-query";
import { getAccessToken, getId, getTwoFactorEnabled } from "../../../infrastructure/services/tokenStorage";
import type { TokenData } from "../types/auth.types";

export const useTokenData = () => {
  const fetchTokenData = async (): Promise<TokenData> => {
    try {
      const [accessToken, userId, twoFactorEnabled] = await Promise.all([
        getAccessToken(),
        getId(),
        getTwoFactorEnabled(),
      ]);

      const hasAccessToken = Boolean(accessToken);
      const hasUserId = Boolean(userId);
      const enable = Boolean(twoFactorEnabled);
      const hasValidToken = hasAccessToken && hasUserId;

      return {
        accessToken,
        userId,
        hasAccessToken,
        hasUserId,
        hasValidToken,
        enable,
      };
    } catch {
      return {
        accessToken: null,
        userId: null,
        hasAccessToken: false,
        hasUserId: false,
        hasValidToken: false,
        enable: false,
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
