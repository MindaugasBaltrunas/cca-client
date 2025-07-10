import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuth } from "../../context/AuthContext";

export interface AuthRouteProps {
  fallbackPath?: string;
  requireFullAuth?: boolean;
  require2FA?: boolean;
  allowPublic?: boolean;
  redirectIfAuthenticated?: string;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({
  fallbackPath = "/login",
  requireFullAuth = false,
  require2FA = false,
  allowPublic = false,
  redirectIfAuthenticated,
}) => {
  const location = useLocation();

  // 🎯 Get auth state
  const {
    isLoading,
    isAuthenticated,
    isInTwoFactorFlow,
    enabled,
    tokenData,
    getCurrentUserId,
  } = useAuth();

  // ====================
  // 🧮 SIMPLIFIED COMPUTED VALUES
  // ====================

  const userId = getCurrentUserId();
  const hasToken = !!tokenData?.hasAccessToken;
  const has2FAEnabled = enabled === true;
  const needsSetup = hasToken && enabled === false;
  
  // ✅ SIMPLIFIED: Only these 3 states matter
  const authState = getAuthState(hasToken, has2FAEnabled, isInTwoFactorFlow, needsSetup);

  // ====================
  // 🐛 CLEAR DEBUG INFO
  // ====================

  console.log("==========================================");
  console.log("🔍 AuthRoute Analysis:");
  console.log("  Path:", location.pathname);
  console.log("  Route Type:", getRouteType({ requireFullAuth, require2FA, allowPublic }));
  console.log("  User ID:", userId);
  console.log("  Has Token:", hasToken);
  console.log("  2FA Enabled:", enabled);
  console.log("  Auth State:", authState);
  console.log("  Is In 2FA Flow:", isInTwoFactorFlow);
  console.log("  Needs Setup:", needsSetup);
  console.log("==========================================");

  // ====================
  // 🔄 LOADING
  // ====================

  if (isLoading) {
    console.log("→ LOADING: Showing spinner");
    return <Preloader isLoading />;
  }

  // ====================
  // 🌐 PUBLIC ROUTES
  // ====================

  if (allowPublic) {
    console.log("→ PUBLIC ROUTE PROCESSING");
    
    // ✅ FIX: Redirect authenticated users who need setup
    if (authState === 'NEEDS_SETUP') {
      console.log("→ PUBLIC: User needs 2FA setup, redirecting to /2fa-setup");
      return <Navigate to="/2fa-setup" replace />;
    }
    
    // ✅ FIX: Redirect users in 2FA verification flow  
    if (authState === 'PENDING_VERIFICATION') {
      const targetPath = determineTargetPath(authState, enabled);
      console.log(`→ PUBLIC: User in 2FA flow, redirecting to ${targetPath}`);
      return <Navigate to={targetPath} replace />;
    }
    
    // Original logic for fully authenticated users
    if (authState === 'FULL_AUTH' && redirectIfAuthenticated) {
      console.log(`→ PUBLIC: User fully authenticated, redirecting to ${redirectIfAuthenticated}`);
      return <Navigate to={redirectIfAuthenticated} replace />;
    }
    
    console.log("→ PUBLIC: Allowing access");
    return <Outlet />;
  }

  // ====================
  // 🚫 NO AUTHENTICATION
  // ====================

  if (authState === 'NO_AUTH') {
    console.log(`→ NO AUTH: Redirecting to ${fallbackPath}`);
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  // ====================
  // 🔐 2FA SPECIFIC ROUTES
  // ====================

  if (require2FA) {
    console.log("→ 2FA ROUTE PROCESSING");
    
    if (authState === 'FULL_AUTH') {
      console.log("→ 2FA ROUTE: User has full auth, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }

    if (authState === 'NEEDS_SETUP' || authState === 'PENDING_VERIFICATION') {
      const targetPath = determineTargetPath(authState, enabled);
      
      console.log(`→ 2FA ROUTE: Should be on ${targetPath}, currently on ${location.pathname}`);
      
      if (location.pathname !== targetPath) {
        console.log(`→ 2FA ROUTE: Redirecting to ${targetPath}`);
        return <Navigate to={targetPath} replace />;
      }
    }

    console.log("→ 2FA ROUTE: Allowing access");
    return <Outlet />;
  }

  // ====================
  // 🛡️ PROTECTED ROUTES
  // ====================

  if (requireFullAuth) {
    console.log("→ PROTECTED ROUTE PROCESSING");

    if (authState === 'NEEDS_SETUP') {
      console.log("→ PROTECTED: User needs 2FA setup, redirecting to /2fa-setup");
      return <Navigate to="/2fa-setup" replace />;
    }

    if (authState === 'PENDING_VERIFICATION') {
      const targetPath = determineTargetPath(authState, enabled);
      console.log(`→ PROTECTED: User needs verification, redirecting to ${targetPath}`);
      return <Navigate to={targetPath} replace />;
    }

    if (authState !== 'FULL_AUTH') {
      console.log(`→ PROTECTED: Insufficient auth (${authState}), redirecting to ${fallbackPath}`);
      return <Navigate to={fallbackPath} state={{ from: location }} replace />;
    }

    console.log("→ PROTECTED: Full auth confirmed, allowing access");
    return <Outlet />;
  }

  // ====================
  // ✅ DEFAULT ALLOW
  // ====================

  console.log("→ DEFAULT: Allowing access");
  return <Outlet />;
};

// ====================
// 🔧 HELPER FUNCTIONS
// ====================

type AuthState = 'NO_AUTH' | 'NEEDS_SETUP' | 'PENDING_VERIFICATION' | 'FULL_AUTH';

/**
 * ✅ FIXED: Determines user's authentication state
 * Fixed the order of conditions to properly handle 2FA flow
 */
function getAuthState(
  hasToken: boolean, 
  has2FAEnabled: boolean, 
  isInTwoFactorFlow: boolean,
  needsSetup: boolean
): AuthState {
  
  // No token at all and not in 2FA flow
  if (!hasToken && !isInTwoFactorFlow) {
    return 'NO_AUTH';
  }
  
  // ✅ FIX: Check 2FA flow first before other conditions
  // In 2FA verification flow (login pending)
  if (isInTwoFactorFlow) {
    return 'PENDING_VERIFICATION';
  }
  
  // Has token but 2FA not enabled (needs setup)
  if (hasToken && needsSetup) {
    return 'NEEDS_SETUP';
  }
  
  // Has token and 2FA enabled (fully authenticated)
  if (hasToken && has2FAEnabled) {
    return 'FULL_AUTH';
  }
  
  // Fallback
  return 'NO_AUTH';
}

/**
 * ✅ FIXED: Determines correct 2FA target path
 */
function determineTargetPath(authState: AuthState, enabled?: boolean): string {
  switch (authState) {
    case 'NEEDS_SETUP':
      return '/2fa-setup';
      
    case 'PENDING_VERIFICATION':
      // If 2FA is enabled, go to verify page
      // If not enabled, go to setup page
      return enabled === true ? '/verify-2fa' : '/2fa-setup';
      
    default:
      return '/2fa-setup';
  }
}

/**
 * Helper to get route type for debugging
 */
function getRouteType(props: Pick<AuthRouteProps, 'requireFullAuth' | 'require2FA' | 'allowPublic'>): string {
  if (props.allowPublic) return 'PUBLIC';
  if (props.require2FA) return '2FA_SPECIFIC';
  if (props.requireFullAuth) return 'PROTECTED';
  return 'DEFAULT';
}

/**
 * Validation function (unchanged but simplified)
 */
export function validateAuthRouteProps(props: AuthRouteProps): string[] {
  const errors: string[] = [];

  if (props.allowPublic && (props.requireFullAuth || props.require2FA)) {
    errors.push("Route cannot be both public and require authentication");
  }

  if (props.requireFullAuth && props.require2FA) {
    errors.push("Route cannot require both full auth and specific 2FA access");
  }

  return errors;
}