// authApi.ts - Funkcinis autentifikacijos API

import { API_CONFIG, apiClient } from '../../shared/config/apiConfig';
import { AuthResponse, IVerify2FAResponse, SignInCredentials, SignUpData, TwoFactorSetupResponse, UserData } from '../../shared/types/api.types';
import { sanitizeObject, sanitizeString } from '../services/xssGuard';



export const login = async (credentials: SignInCredentials): Promise<AuthResponse> => {
  try {
    const originalPassword = credentials.password;
    
    const safeCredentials = sanitizeObject({
      ...credentials,
      password: '' 
    });
    
    safeCredentials.password = originalPassword;
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
      safeCredentials
    );
    
    return response.data;
  } catch (error) {
    console.error('login error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'login error',
    };
  }
};

export const adminLogin = async (
  credentials: SignInCredentials & { adminPassword: string }
): Promise<AuthResponse> => {
  try {
    const originalPassword = credentials.password;
    const originalAdminPassword = credentials.adminPassword;
    
    const safeCredentials = sanitizeObject({
      ...credentials,
      password: '',
      adminPassword: ''
    });
    
    safeCredentials.password = originalPassword;
    safeCredentials.adminPassword = originalAdminPassword;
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN,
      safeCredentials
    );
    
    return response.data;
  } catch (error) {
    console.error('Admin login error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error 
        ? error.message 
        : 'Admin login error',
    };
  }
};

export const register = async (userData: SignUpData): Promise<AuthResponse> => {
  try {
    const originalPassword = userData.password;
    const originalConfirmPassword = userData.confirmPassword;
    
    const safeUserData = sanitizeObject({
      ...userData,
      password: '',
      confirmPassword: ''
    });
    
    safeUserData.password = originalPassword;
    if (originalConfirmPassword) {
      safeUserData.confirmPassword = originalConfirmPassword;
    }
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_UP,
      safeUserData
    );
    
    return response.data;
  } catch (error) {
    console.error('Signup error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Signup error',
    };
  }
};

export const logout = async (userId: string): Promise<AuthResponse> => {
  try {
    const safeUserId = sanitizeString(userId);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT,
      { userId: safeUserId }
    );
    
    return response.data;
  } catch (error) {
    console.error('logout error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'logout error',
    };
  }
};

export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const response = await apiClient.post<{ user: UserData }>(
      API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER
    );
    
    return response.data.user;
  } catch (error) {
    console.error('get user data error:', error);
    return null;
  }
};

export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  try {
    const response = await apiClient.post<TwoFactorSetupResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA setup error:', error);
    throw error;
  }
};

export const enable2FA = async (token: string): Promise<AuthResponse> => {
  try {
    const safeToken = sanitizeString(token);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
      { token: safeToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA enable error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '2FA enable error',
    };
  }
};

export const disable2FA = async (token: string): Promise<AuthResponse> => {
  try {
    const safeToken = sanitizeString(token);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
      { token: safeToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA disable error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '2FA disable error',
    };
  }
};

export const verify2FA = async (userId: string, token: string): Promise<IVerify2FAResponse> => {
  try {
    const safeUserId = sanitizeString(userId);
    const safeToken = sanitizeString(token);
    
    const response = await apiClient.post<IVerify2FAResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.VERIFY,
      {
        userId: safeUserId,
        token: safeToken
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA verify error:', error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const safeRefreshToken = sanitizeString(refreshToken);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken: safeRefreshToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('Token refresh error:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Token refresh error',
    };
  }
};

export const authApi = {
  login,
  adminLogin,
  register,
  logout,
  getCurrentUser,
  setup2FA,
  enable2FA,
  disable2FA,
  verify2FA,
  refreshToken
};