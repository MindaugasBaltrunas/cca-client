import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_CONFIG, AUTH_ENDPOINTS } from '../../shared/config/apiConfig';
import { 
  TokenResponseData, 
  UserResponseData, 
  TwoFactorRequiredResponseData,
  TwoFactorSetupResponseData
} from '../../shared/types/api.types';
import {
  LoginCredentials,
  RegistrationData,
  AdminLoginCredentials,
  TwoFactorVerifyData,
  TwoFactorActionData
} from '../../core/domain/models/auth';
import { RootState } from '../../store/store';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${API_CONFIG.BASE_URL}${API_CONFIG.API_PATH}`,
    prepareHeaders: (headers, { getState }) => {
      headers.set('Content-Type', 'application/json');
      headers.set('X-API-Secret', API_CONFIG.API_SECRET);
      
      const token = (getState() as RootState).auth.tokens?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
    responseHandler: async (response) => {
      const data = await response.json();
      if (!response.ok) {
        return { 
          error: { 
            status: response.status, 
            data: data.error || data.message || 'Unknown error' 
          } 
        };
      }
      return { data };
    },
  }),
  endpoints: (builder) => ({
    register: builder.mutation<UserResponseData, RegistrationData>({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.REGISTER,
        method: 'POST',
        body: credentials
      }),
    }),
    
    login: builder.mutation<TokenResponseData | TwoFactorRequiredResponseData, LoginCredentials>({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.LOGIN,
        method: 'POST',
        body: credentials
      }),
    }),
    
    adminLogin: builder.mutation<TokenResponseData, AdminLoginCredentials>({
      query: (credentials) => ({
        url: AUTH_ENDPOINTS.ADMIN_LOGIN,
        method: 'POST',
        body: credentials,
        headers: {
          'X-API-Key': API_CONFIG.API_KEY
        }
      }),
    }),
    
    logout: builder.mutation<void, string>({
      query: (userId) => ({
        url: AUTH_ENDPOINTS.LOGOUT,
        method: 'POST',
        body: { id: userId }
      }),
    }),
    
    getCurrentUser: builder.query<UserResponseData, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.CURRENT_USER,
        method: 'GET'
      }),
    }),
    
    refreshToken: builder.mutation<TokenResponseData, string>({
      query: (refreshToken) => ({
        url: AUTH_ENDPOINTS.REFRESH_TOKEN,
        method: 'POST',
        body: { refreshToken }
      }),
    }),
    
    setupTwoFactor: builder.mutation<TwoFactorSetupResponseData, void>({
      query: () => ({
        url: AUTH_ENDPOINTS.TWO_FACTOR_SETUP,
        method: 'POST',
        headers: {
          'X-API-Key': API_CONFIG.API_KEY
        }
      }),
    }),
    
    verifyTwoFactor: builder.mutation<TokenResponseData, TwoFactorVerifyData>({
      query: (data) => ({
        url: AUTH_ENDPOINTS.TWO_FACTOR_VERIFY,
        method: 'POST',
        body: data,
        headers: {
          'X-API-Key': API_CONFIG.API_KEY
        }
      }),
    }),
    
    enableTwoFactor: builder.mutation<void, TwoFactorActionData>({
      query: (data) => ({
        url: AUTH_ENDPOINTS.TWO_FACTOR_ENABLE,
        method: 'POST',
        body: data,
        headers: {
          'X-API-Key': API_CONFIG.API_KEY
        }
      }),
    }),
    
    disableTwoFactor: builder.mutation<void, TwoFactorActionData>({
      query: (data) => ({
        url: AUTH_ENDPOINTS.TWO_FACTOR_DISABLE,
        method: 'POST',
        body: data,
        headers: {
          'X-API-Key': API_CONFIG.API_KEY
        }
      }),
    }),
  }),
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useAdminLoginMutation,
  useLogoutMutation,
  useGetCurrentUserQuery,
  useRefreshTokenMutation,
  useSetupTwoFactorMutation,
  useVerifyTwoFactorMutation,
  useEnableTwoFactorMutation,
  useDisableTwoFactorMutation
} = authApi;