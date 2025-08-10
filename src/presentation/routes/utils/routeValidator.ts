import { RouteCategory } from "../../../core/auth/types/auth.types";
import { ALLOWED_ROUTES, ROUTE_CATEGORIES } from "../constants/constants";

const normalize = (path: string): string => path.replace(/\/+$/, "") || "/";

export const isAllowedRoute = (path: string): boolean => {
  const normalizedPath = normalize(path);
  return Object.values(ALLOWED_ROUTES).some(route =>
    normalize(route) === normalizedPath
  );
};

export const getRouteCategory = (path: string): RouteCategory | null => {
  const normalizedPath = normalize(path);

  for (const [category, routes] of Object.entries(ROUTE_CATEGORIES)) {
    if (routes.some(route => normalize(route) === normalizedPath)) {
      return category as RouteCategory;
    }
  }
  return null;
};

export const isRouteAllowedInConfig = (
  currentPath: string,
  allowedCategories?: readonly RouteCategory[] | RouteCategory[]
): boolean => {
  if (!allowedCategories?.length) return true;

  const routeCategory = getRouteCategory(currentPath);
  if (!routeCategory) return false;

  return (allowedCategories as RouteCategory[]).includes(routeCategory);
};