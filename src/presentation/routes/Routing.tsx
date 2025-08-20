import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Preloader from "../components/Preloader/preloader";
import { useAuth } from "../../core/auth/context/AuthContext";
import {
  ProtectedRoute,
  TwoFactorRoute,
  PublicRoute,
} from "./components/RouteComponents";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ALLOWED_ROUTES } from "./constants/constants";

const LoginPage = React.lazy(() => import("../pages/login/loginPage"));
const SignupPage = React.lazy(() => import("../pages/signup/signupPage"));

const ProfilePage = React.lazy(() => import("../pages/profile/profilePage"));
const TwoFactorSetupPage = React.lazy(
  () => import("../components/Auth/TwoFactorAuthSetup/TwoFactorAuthSetup")
);

const TwoFactorVerifyPage = React.lazy(
  () => import("../components/Auth/TwoFactorVerifyForm/TwoFactorVerifyForm")
);
const DashboardPage = React.lazy(() => import("../pages/dashboard/dashboard"));

export const Routing: React.FC = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <Preloader isLoading />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Preloader isLoading />}>
        <Routes>
          {/* Root redirect 
          <Route
            path="/"
            element={<Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />}
          />*/}

          {/* Public routes - Login/Signup when not authenticated */}
          <Route element={<PublicRoute />}>
            <Route path={ALLOWED_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ALLOWED_ROUTES.SIGNUP} element={<SignupPage />} />
          </Route>

          {/* 2FA routes - Setup/Verify when authenticated but not fully authorized */}
          <Route element={<TwoFactorRoute />}>
            <Route
              path={ALLOWED_ROUTES.TWO_FA_SETUP}
              element={<TwoFactorSetupPage />}
            />
            <Route
              path={ALLOWED_ROUTES.VERIFY_2FA}
              element={<TwoFactorVerifyPage />}
            />
          </Route>

          {/* Protected routes - All app routes when fully authorized */}
          <Route element={<ProtectedRoute />}>
            <Route
              path={ALLOWED_ROUTES.DASHBOARD}
              element={<DashboardPage />}
            />
            <Route path={ALLOWED_ROUTES.PROFILE} element={<ProfilePage />} />
            {/* <Route path={ALLOWED_ROUTES.SETTINGS} element={<SettingsPage />} />
            <Route path={ALLOWED_ROUTES.REPORTS} element={<ReportsPage />} /> */}
          </Route>

          {/* Catch all unauthorized routes */}
          <Route
            path="*"
            element={<Navigate to={ALLOWED_ROUTES.LOGIN} replace />}
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
