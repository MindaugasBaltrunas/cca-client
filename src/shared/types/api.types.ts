
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
  }
  
  export interface TokenResponseData {
    userId: string;
    token: string;
    refreshToken: string;
    expiresAt: number;
  }
  
  export interface UserResponseData {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    twoFactorEnabled: boolean;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface TwoFactorRequiredResponseData {
    userId: string;
    tempToken: string;
    twoFactorRequired: true;
  }
  
  export interface TwoFactorSetupResponseData {
    qrCodeUrl: string;
    secret: string;
  }