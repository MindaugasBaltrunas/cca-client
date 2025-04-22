// authApi.ts - Funkcinis autentifikacijos API

import { API_CONFIG, apiClient } from '../../shared/config/apiConfig';
import { AuthResponse, IVerify2FAResponse, SignInCredentials, SignUpData, TwoFactorSetupResponse, UserData } from '../../shared/types/api.types';
import { sanitizeObject, sanitizeString } from '../services/xssGuard';



export const login = async (credentials: SignInCredentials): Promise<AuthResponse> => {
  try {
    // Išsaugome originalų slaptažodį
    const originalPassword = credentials.password;
    
    // Dezinfekuojame įvesties duomenis
    const safeCredentials = sanitizeObject({
      ...credentials,
      password: '' // Laikinai pašaliname slaptažodį iš dezinfekcijos
    });
    
    // Grąžiname originalų slaptažodį
    safeCredentials.password = originalPassword;
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_IN,
      safeCredentials
    );
    
    return response.data;
  } catch (error) {
    console.error('Prisijungimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Prisijungimo klaida',
    };
  }
};

/**
 * Administratoriaus prisijungimas
 * @param credentials Prisijungimo duomenys su administratoriaus slaptažodžiu
 * @returns Promise su autentifikacijos rezultatu
 */
export const adminLogin = async (
  credentials: SignInCredentials & { adminPassword: string }
): Promise<AuthResponse> => {
  try {
    // Išsaugome originalius slaptažodžius
    const originalPassword = credentials.password;
    const originalAdminPassword = credentials.adminPassword;
    
    // Dezinfekuojame įvesties duomenis
    const safeCredentials = sanitizeObject({
      ...credentials,
      password: '', // Laikinai pašaliname slaptažodžius iš dezinfekcijos
      adminPassword: ''
    });
    
    // Grąžiname originalius slaptažodžius
    safeCredentials.password = originalPassword;
    safeCredentials.adminPassword = originalAdminPassword;
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.ADMIN_SIGN_IN,
      safeCredentials
    );
    
    return response.data;
  } catch (error) {
    console.error('Administratoriaus prisijungimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error 
        ? error.message 
        : 'Administratoriaus prisijungimo klaida',
    };
  }
};

/**
 * Vartotojo registracija
 * @param userData Registracijos duomenys
 * @returns Promise su registracijos rezultatu
 */
export const register = async (userData: SignUpData): Promise<AuthResponse> => {
  try {
    // Išsaugome originalius slaptažodžius
    const originalPassword = userData.password;
    const originalConfirmPassword = userData.confirmPassword;
    
    // Dezinfekuojame įvesties duomenis
    const safeUserData = sanitizeObject({
      ...userData,
      password: '', // Laikinai pašaliname slaptažodžius iš dezinfekcijos
      confirmPassword: ''
    });
    
    // Grąžiname originalius slaptažodžius
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
    console.error('Registracijos klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Registracijos klaida',
    };
  }
};

/**
 * Vartotojo atsijungimas
 * @param userId Vartotojo ID
 * @returns Promise su atsijungimo rezultatu
 */
export const logout = async (userId: string): Promise<AuthResponse> => {
  try {
    const safeUserId = sanitizeString(userId);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.SIGN_OUT,
      { userId: safeUserId }
    );
    
    return response.data;
  } catch (error) {
    console.error('Atsijungimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Atsijungimo klaida',
    };
  }
};

/**
 * Gauti dabartinio vartotojo informaciją
 * @returns Promise su vartotojo duomenimis
 */
export const getCurrentUser = async (): Promise<UserData | null> => {
  try {
    const response = await apiClient.post<{ user: UserData }>(
      API_CONFIG.ENDPOINTS.AUTH.CURRENT_USER
    );
    
    return response.data.user;
  } catch (error) {
    console.error('Klaida gaunant vartotojo informaciją:', error);
    return null;
  }
};

/**
 * Dviejų faktorių autentifikacijos nustatymas
 * @returns Promise su 2FA nustatymo duomenimis
 */
export const setup2FA = async (): Promise<TwoFactorSetupResponse> => {
  try {
    const response = await apiClient.post<TwoFactorSetupResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.SETUP
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA nustatymo klaida:', error);
    throw error;
  }
};

/**
 * Dviejų faktorių autentifikacijos įjungimas
 * @param token Vienkartinis autentifikacijos kodas
 * @returns Promise su operacijos rezultatu
 */
export const enable2FA = async (token: string): Promise<AuthResponse> => {
  try {
    const safeToken = sanitizeString(token);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.ENABLE,
      { token: safeToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA įjungimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '2FA įjungimo klaida',
    };
  }
};

/**
 * Dviejų faktorių autentifikacijos išjungimas
 * @param token Vienkartinis autentifikacijos kodas
 * @returns Promise su operacijos rezultatu
 */
export const disable2FA = async (token: string): Promise<AuthResponse> => {
  try {
    const safeToken = sanitizeString(token);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.TWO_FACTOR.DISABLE,
      { token: safeToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('2FA išjungimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : '2FA išjungimo klaida',
    };
  }
};

/**
 * Dviejų faktorių autentifikacijos kodo patikrinimas
 * @param userId Vartotojo ID
 * @param token Vienkartinis autentifikacijos kodas
 * @returns Promise su patikrinimo rezultatu
 */
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
    console.error('2FA patikrinimo klaida:', error);
    throw error;
  }
};

/**
 * Žetono atnaujinimas
 * @param refreshToken Atnaujinimo žetonas
 * @returns Promise su nauju žetonu
 */
export const refreshToken = async (refreshToken: string): Promise<AuthResponse> => {
  try {
    const safeRefreshToken = sanitizeString(refreshToken);
    
    const response = await apiClient.post<AuthResponse>(
      API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN,
      { refreshToken: safeRefreshToken }
    );
    
    return response.data;
  } catch (error) {
    console.error('Žetono atnaujinimo klaida:', error);
    
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Žetono atnaujinimo klaida',
    };
  }
};

// Eksportuojame visas funkcijas kartu
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