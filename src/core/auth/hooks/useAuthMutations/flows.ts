import { AuthHandlerData } from './types';
import { createUpdateAuthStateAndStorage } from './state';
import { extractAuthData } from './helpers';
import { logger } from '../../../../shared/utils/logger';
import { AuthResponse } from '../../../../shared/types/api.response.types';

interface AuthMutationHandlersInternal {
  handleAuthSuccess: (data: any) => Promise<void> | void;
  startTwoFactorFlow: (userId: string) => void;
  setNeedsSetup: (needs: boolean) => void;
  resetAuthState: () => void;
}

const createHandleAuthFlow = (handlers: AuthMutationHandlersInternal) =>
  async (authData: AuthHandlerData): Promise<void> => {
    const { token, userId, enabled, verified, status } = authData;

    const authStatus = {
      isSuccess: true,
      needsTwoFactorSetup: true && !enabled,
      canCompleteLogin: true && enabled,
    };

    if (authStatus.needsTwoFactorSetup) {
      handlers.startTwoFactorFlow(userId);
      return;
    }

    if (authStatus.canCompleteLogin) {
      handlers.setNeedsSetup(!enabled);
      await handlers.handleAuthSuccess({
        token,
        userId,
        refreshToken: authData.refreshToken,
        enabled,
        verified: verified ?? false,
        status: status,
        userData: authData.userData,
      });
    }
  };

export const createProcessAuthResponse = (
  queryClient: import('@tanstack/react-query').QueryClient,
  handlers: AuthMutationHandlersInternal,
) => {
  const updateAuthStateAndStorage = createUpdateAuthStateAndStorage(queryClient);
  const handleAuthFlow = createHandleAuthFlow(handlers);

  return async (authResponse: AuthResponse): Promise<void> => {
    const extractedData = extractAuthData(authResponse);
    const { token, userId, refreshToken, enabled, verified, status, expiresAt } =
      extractedData;

    if (!token || !userId) {
      logger.error('Missing token or userId in auth response');
      handlers.resetAuthState();
      return;
    }

    if (!authResponse.success) {
      logger.warn('Auth response not successful');
      handlers.resetAuthState();
      return;
    }

    try {
      await updateAuthStateAndStorage({
        token: token!,
        userId: userId!,
        refreshToken,
        expiresAt: expiresAt ? Number(expiresAt) : undefined,
        verified,
        status,
      });

      await handleAuthFlow({
        token: token!,
        userId: userId!,
        refreshToken,
        enabled: enabled ?? false,
        verified,
        status,
      });
    } catch (error) {
      logger.error('Failed to process auth response:', error as any);
      handlers.resetAuthState();
    }
  };
};