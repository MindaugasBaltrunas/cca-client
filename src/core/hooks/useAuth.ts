import { useDispatch } from 'react-redux';
import {
  useLoginMutation,
  useAdminLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation,
  useRefreshTokenMutation,
  useGetCurrentUserQuery
} from '../../infrastructure/api/authApi';
import { tokenService } from '../../infrastructure/services/tokenService';
import { setCredentials, setUser, logoutUser } from '../../store/slices/authSlice';
import { LoginCredentials, AdminLoginCredentials, RegistrationData, TwoFactorVerifyData, TwoFactorActionData } from '../domain/models/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  
  const [loginTrigger, loginResult] = useLoginMutation();
  const [adminLoginTrigger, adminLoginResult] = useAdminLoginMutation();
  const [registerTrigger, registerResult] = useRegisterMutation();
  const [logoutTrigger, logoutResult] = useLogoutMutation();
  const [verifyTwoFactorTrigger, verifyTwoFactorResult] = useVerifyTwoFactorMutation();
  const [enableTwoFactorTrigger, enableTwoFactorResult] = useEnableTwoFactorMutation();
  const [disableTwoFactorTrigger, disableTwoFactorResult] = useDisableTwoFactorMutation();
  const [refreshTokenTrigger, refreshTokenResult] = useRefreshTokenMutation();
  const currentUserQuery = useGetCurrentUserQuery(undefined, {
    skip: !tokenService.getToken()
  });

  const isLoading =
    loginResult.isLoading ||
    adminLoginResult.isLoading ||
    registerResult.isLoading ||
    logoutResult.isLoading ||
    verifyTwoFactorResult.isLoading ||
    enableTwoFactorResult.isLoading ||
    disableTwoFactorResult.isLoading ||
    refreshTokenResult.isLoading ||
    currentUserQuery.isLoading;

  const error =
    loginResult.error ||
    adminLoginResult.error ||
    registerResult.error ||
    logoutResult.error ||
    verifyTwoFactorResult.error ||
    enableTwoFactorResult.error ||
    disableTwoFactorResult.error ||
    refreshTokenResult.error ||
    currentUserQuery.error;

  return {
    login: async (credentials: LoginCredentials) => {
      const result = await loginTrigger(credentials).unwrap();
      
      // Check if 2FA is required
      if ('twoFactorRequired' in result) {
        return result;
      }
      
      // Save tokens to Redux and localStorage
      dispatch(setCredentials({
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt
      }));
      
      // Fetch user data after successful login
      currentUserQuery.refetch();
      
      return result;
    },
    
    adminLogin: async (credentials: AdminLoginCredentials) => {
      const result = await adminLoginTrigger(credentials).unwrap();
      
      dispatch(setCredentials({
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt
      }));
      
      currentUserQuery.refetch();
      
      return result;
    },
    
    register: async (userData: RegistrationData) => {
      return await registerTrigger(userData).unwrap();
    },
    
    logout: async (userId: string) => {
      await logoutTrigger(userId).unwrap();
      dispatch(logoutUser());
    },
    
    verifyTwoFactor: async (data: TwoFactorVerifyData) => {
      const result = await verifyTwoFactorTrigger(data).unwrap();
      
      dispatch(setCredentials({
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt
      }));
      
      currentUserQuery.refetch();
      
      return result;
    },
    
    enableTwoFactor: async (data: TwoFactorActionData) => {
      return await enableTwoFactorTrigger(data).unwrap();
    },
    
    disableTwoFactor: async (data: TwoFactorActionData) => {
      return await disableTwoFactorTrigger(data).unwrap();
    },
    
    refreshToken: async (refreshTokenValue: string) => {
      const result = await refreshTokenTrigger(refreshTokenValue).unwrap();
      
      dispatch(setCredentials({
        token: result.token,
        refreshToken: result.refreshToken,
        expiresAt: result.expiresAt
      }));
      
      return result;
    },
    
    user: currentUserQuery.data,
    isAuthenticated: !!tokenService.getToken() && !tokenService.isTokenExpired(),
    isLoading,
    error,
  };
};