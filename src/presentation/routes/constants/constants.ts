export const ALLOWED_ROUTES = {
  // Auth routes
  LOGIN: "/login",
  SIGNUP: "/signup",
  
  // 2FA routes
  TWO_FA_SETUP: "/2fa-setup",
  VERIFY_2FA: "/verify-2fa",
  
  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  REPORTS: "/reports",
} as const;

export const AUTH_ROUTES = ALLOWED_ROUTES;

export const ROUTE_CATEGORIES = {
  PUBLIC: [ALLOWED_ROUTES.LOGIN, ALLOWED_ROUTES.SIGNUP],
  TWO_FA: [ALLOWED_ROUTES.TWO_FA_SETUP, ALLOWED_ROUTES.VERIFY_2FA],
  PROTECTED: [
    ALLOWED_ROUTES.DASHBOARD, 
    ALLOWED_ROUTES.PROFILE, 
    ALLOWED_ROUTES.SETTINGS, 
    ALLOWED_ROUTES.REPORTS
  ],
} as const;