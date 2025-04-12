import { apiClient, API_CONFIG } from '../../shared/config/apiConfig';
import { SignInCredentials, SignUpData, UserResponseData } from '../../shared/types/api.types';

// Aprašome atsakymų tipus
interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

interface LoginResponse extends TokenResponse {
  user?: UserResponseData;
  twoFactorRequired?: boolean;
  userId?: string;
}

interface TwoFactorSetupResponse {
  secretKey: string;
  qrCodeUrl: string;
}

interface MessageResponse {
  message: string;
  success: boolean;
}

/**
 * Autentifikacijos API funkcijos
 */
export const authApi = {
  /**
   * Vartotojo prisijungimas
   */
  login: async (credentials: SignInCredentials): Promise<LoginResponse> => {
    const response = await apiClient.post('/api', credentials, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.SIGN_IN
      }
    });
    return response.data;
  },

  /**
   * Admin prisijungimas
   */
  adminLogin: async (params: SignInCredentials & { adminPassword: string }): Promise<LoginResponse> => {
    const response = await apiClient.post('/api', params, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN,
        'X-API-Key': API_CONFIG.API_KEY
      }
    });
    return response.data;
  },

  /**
   * Vartotojo registracija
   */
  register: async (userData: SignUpData & { adminPassword?: string }): Promise<MessageResponse> => {
    const response = await apiClient.post('/api', userData, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.SIGN_UP
      }
    });
    return response.data;
  },

  /**
   * Atnaujinti token naudojant refreshToken
   */
  refreshToken: async (refreshToken: string): Promise<TokenResponse> => {
    const response = await apiClient.post('/api', { refreshToken }, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN
      }
    });
    return response.data;
  },

  /**
   * Vartotojo atsijungimas
   */
  logout: async (userId: string): Promise<MessageResponse> => {
    const response = await apiClient.post('/api', { id: userId }, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT
      }
    });
    return response.data;
  },

  /**
   * Gauti dabartinio vartotojo informaciją
   */
  getCurrentUser: async (): Promise<UserResponseData> => {
    const response = await apiClient.post('/api', {}, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER
      }
    });
    return response.data;
  },

  /**
   * 2FA nustatymas - gauti QR kodą
   */
  setup2FA: async (): Promise<TwoFactorSetupResponse> => {
    const response = await apiClient.post('/api', {}, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP,
        'X-API-Key': API_CONFIG.API_KEY
      }
    });
    return response.data;
  },

  /**
   * 2FA įjungimas
   */
  enable2FA: async (token: string): Promise<MessageResponse> => {
    const response = await apiClient.post('/api', { token }, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
        'X-API-Key': API_CONFIG.API_KEY
      }
    });
    return response.data;
  },

  /**
   * 2FA išjungimas
   */
  disable2FA: async (token: string): Promise<MessageResponse> => {
    const response = await apiClient.post('/api', { token }, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
        'X-API-Key': API_CONFIG.API_KEY
      }
    });
    return response.data;
  },

  /**
   * 2FA patvirtinimas prisijungimo metu
   */
  verify2FA: async (userId: string, token: string): Promise<LoginResponse> => {
    const response = await apiClient.post('/api', { userId, token }, {
      headers: {
        'X-API-Endpoint': API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.VERIFY,
        'X-API-Key': API_CONFIG.API_KEY
      }
    });
    return response.data;
  },
};