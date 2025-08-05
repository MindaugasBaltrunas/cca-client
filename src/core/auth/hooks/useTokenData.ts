import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from '@tanstack/react-query';
import { getAccessToken, getId } from "../../../infrastructure/services/tokenStorage";
import type { TokenData } from "../types/auth.types";

export const useTokenData = () => {
  const queryClient = useQueryClient();
  
  const fetchTokenData = async (): Promise<TokenData> => {
    try {
      const [accessToken, userId] = await Promise.all([
        getAccessToken(),
        getId()
      ]);
      
      const currentData = queryClient.getQueryData<TokenData>(['auth-tokens']);
      const hasAccessToken = Boolean(accessToken);
      const hasUserId = Boolean(userId);
      const enable = currentData?.enable ?? true;
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