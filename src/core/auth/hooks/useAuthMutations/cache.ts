import { QueryClient } from '@tanstack/react-query';
import { AuthTokens } from '../../../../shared/types/auth.base.types';
import { AuthCacheData } from '../../../../shared/types/api.response.types';

export const createUpdateAuthCache = (queryClient: QueryClient) => (
  data: Partial<AuthTokens>
): void => {
  queryClient.setQueryData<AuthCacheData>(['auth-tokens'], (prev) => ({
    accessToken: data.accessToken ?? prev?.accessToken ?? null,
    refreshToken: data.refreshToken ?? prev?.refreshToken,
    userId: data.userId ?? prev?.userId ?? null,
    enabled: data.enabled ?? prev?.enabled ?? false,
    verified: data.verified ?? prev?.verified ?? false,
    status: data.status ?? prev?.status,
    hasAccessToken: !!(data.accessToken ?? prev?.accessToken),
    hasUserId: !!(data.userId ?? prev?.userId),
    hasValidToken:
      !!(data.accessToken ?? prev?.accessToken) && !!(data.userId ?? prev?.userId),
  }));
};