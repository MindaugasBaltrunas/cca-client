export const ALLOWED_ROUTES = {
  // Auth routes
  LOGIN: "/login",
  SIGNUP: "/signup",
  // Posts routes
  GET_ALL_POSTS: "/posts",
  GET_BY_ID: "/posts/:id",
  // 2FA routes
  TWO_FA_SETUP: "/2fa-setup",
  VERIFY_2FA: "/verify-2fa",
  // Protected routes
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",
  REPORTS: "/reports",
} as const;

// ✅ ROUTE_CATEGORIES now contains actual route paths (not category names)
export const ROUTE_CATEGORIES = {
  PUBLIC: [
    ALLOWED_ROUTES.LOGIN, 
    ALLOWED_ROUTES.SIGNUP,
    ALLOWED_ROUTES.GET_ALL_POSTS,
    ALLOWED_ROUTES.GET_BY_ID
  ] as const,
  TWO_FA: [
    ALLOWED_ROUTES.TWO_FA_SETUP, 
    ALLOWED_ROUTES.VERIFY_2FA
  ] as const,
  PROTECTED: [
    ALLOWED_ROUTES.DASHBOARD,
    ALLOWED_ROUTES.PROFILE,
    ALLOWED_ROUTES.SETTINGS,
    ALLOWED_ROUTES.REPORTS,
  ] as const,
} as const;