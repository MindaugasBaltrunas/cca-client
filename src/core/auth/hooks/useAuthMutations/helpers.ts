import { AuthResponse, TwoFactorSetupResponse } from "../../../../shared/types/api.response.types";


export const extractAuthData = (authResponse: AuthResponse) => ({
  token: authResponse.data?.accessToken,
  userId: authResponse.data?.userId,
  refreshToken: authResponse.data?.refreshToken,
  enabled: authResponse.data?.auth?.enabled,
  verified: authResponse.data?.auth?.verified,
  expiresAt: authResponse.data?.expiresAt,
  status: authResponse.data?.auth?.status,
});

export const extractTwoFactorData = (response: TwoFactorSetupResponse) => ({
  token: response.data.token,
  userId: response.data.user?.id,
  refreshToken: response.data.refreshToken,
  status: response.data.auth.status,
  verified: response.data.auth.verified,
});

export const isValidAuthData = (token?: string, userId?: string): boolean =>
  Boolean(token && userId);

export const determineAuthStatus = (success: boolean, enabled?: boolean) => ({
  isSuccess: success,
  needsTwoFactorSetup: success && !enabled,
  canCompleteLogin: success && enabled,
});

export const handleApiResponse = <T,>(result: T, errorMessage: string): T => {
  if (result && typeof result === 'object' && 'success' in result && 'meta' in result) {
    return result;
  }
  throw new Error((result as any)?.message || errorMessage);
};
