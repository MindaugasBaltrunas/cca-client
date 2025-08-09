import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { isAllowedRoute, getRouteCategory } from "../utils/routeValidator";

export const useRouteValidation = () => {
  const location = useLocation();

  return useMemo(() => ({
    isValidRoute: isAllowedRoute(location.pathname),
    routeCategory: getRouteCategory(location.pathname),
    currentPath: location.pathname,
  }), [location.pathname]);
};