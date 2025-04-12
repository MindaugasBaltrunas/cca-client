// src/infrastructure/types/api.types.ts

/**
 * Vartotojo rolės
 */
export type UserRole = 'user' | 'admin';

/**
 * Prisijungimo kredencialai
 */
export interface SignInCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Registracijos duomenys
 */
export interface SignUpData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  adminPassword?: string;
}

/**
 * Vartotojo duomenys, gaunami iš API
 */
export interface UserResponseData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dviejų faktorių autentifikacijos būsena
 */
export interface TwoFactorState {
  enabled: boolean;
  verified: boolean;
}

/**
 * Prisijungimo būsena (naudojama 2FA procesui)
 */
export interface LoginState {
  userId: string;
  credentials: SignInCredentials;
}

/**
 * API klaidos tipas
 */
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}