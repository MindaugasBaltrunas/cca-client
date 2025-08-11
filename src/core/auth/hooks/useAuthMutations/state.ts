import { saveTokens } from '../../../../infrastructure/services/tokenStorage';
import { AuthStatusValue } from '../../../../shared/types/auth.base.types';
import { createUpdateAuthCache } from './cache';
import { AuthStateUpdateParams } from './types';
import { QueryClient } from '@tanstack/react-query';

export const createUpdateAuthStateAndStorage = (queryClient: QueryClient) =>
  async (params: AuthStateUpdateParams): Promise<void> => {
    const { token, userId, refreshToken, verified, status } = params;

    const updateAuthCache = createUpdateAuthCache(queryClient);

    updateAuthCache({
      accessToken: token,
      userId,
      refreshToken,
      verified,
      status: status as AuthStatusValue, 
    });

    await saveTokens({
      token,
      id: userId,
      refreshToken,
    });
  };
