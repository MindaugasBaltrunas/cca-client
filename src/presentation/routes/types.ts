export type RouteCategory = "PUBLIC" | "TWO_FA" | "PROTECTED";

// Option 1: Update to use actual route paths (RECOMMENDED)
export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string | false;
  allowedRoutes?: readonly string[] | string[]; 
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