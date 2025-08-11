export interface AuthStateUpdateParams {
  token: string;
  userId: string;
  refreshToken?: string;
  expiresAt?: number;
  verified?: boolean;
  status?: string;
}

export interface AuthHandlerData {
  token: string;
  userId: string;
  refreshToken?: string;
  enabled: boolean;
  verified?: boolean;
  status?: string;
  userData?: any;
}