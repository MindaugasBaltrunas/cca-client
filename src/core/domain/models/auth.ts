export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegistrationData {
    name: string;
    email: string;
    password: string;
    role: "user" | "admin";
    adminPassword?: string;
  }
  
  export interface AdminLoginCredentials {
    email: string;
    password: string;
    adminPassword: string;
  }
  
  export interface TwoFactorVerifyData {
    userId: string;
    token: string;
  }
  
  export interface TwoFactorActionData {
    token: string;
  }
  
  export interface TokenPair {
    token: string;
    refreshToken: string;
    expiresAt: number;
  }