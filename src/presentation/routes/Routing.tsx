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
const PostsList = React.lazy(() => import("../pages/post/postPage"));
// const PostDetail = React.lazy(() => import("../pages/post/postDetailPage")); // Add this if you have it

export const Routing: React.FC = () => {
  const { isLoading } = useAuth();
  
  if (isLoading) {
    return <Preloader isLoading />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<Preloader isLoading />}>
        <Routes>
          {/* Root redirect */}
          <Route
            path="/"
            element={<Navigate to={ALLOWED_ROUTES.GET_ALL_POSTS} replace />}
          />

          {/* Public routes - accessible without authentication */}
          <Route element={<PublicRoute />}>
            <Route path={ALLOWED_ROUTES.LOGIN} element={<LoginPage />} />
            <Route path={ALLOWED_ROUTES.SIGNUP} element={<SignupPage />} />
            <Route path={ALLOWED_ROUTES.GET_ALL_POSTS} element={<PostsList />} />
            {/* <Route path={ALLOWED_ROUTES.GET_BY_ID} element={<PostDetail />} /> */}
          </Route>

          {/* 2FA routes - for authenticated users needing 2FA setup/verification */}
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

          {/* Protected routes - for fully authenticated users */}
          <Route element={<ProtectedRoute />}>
            <Route
              path={ALLOWED_ROUTES.DASHBOARD}
              element={<DashboardPage />}
            />
            <Route path={ALLOWED_ROUTES.PROFILE} element={<ProfilePage />} />
          </Route>

          {/* Catch all - redirect to posts (public) */}
          <Route
            path="*"
            element={<Navigate to={ALLOWED_ROUTES.GET_ALL_POSTS} replace />}
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
};
