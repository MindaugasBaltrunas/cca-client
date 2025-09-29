export type RouteCategory = "PUBLIC" | "TWO_FA" | "PROTECTED";

// Option 1: Update to use actual route paths (RECOMMENDED)
export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string | false;
<<<<<<< HEAD
  allowedRoutes?: readonly string[] | string[]; // ✅ Now accepts actual route paths
=======
  allowedRoutes?: readonly string[] | string[]; 
>>>>>>> a67e14ca31fa5e30d8a27de84571782c518fa0a4
}

// Option 2: If you want to keep using categories, use this instead
export interface AuthRoutePropsWithCategories {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string | false;
  allowedRoutes?: readonly RouteCategory[] | RouteCategory[];
}