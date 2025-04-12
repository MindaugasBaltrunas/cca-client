import { JSX, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Preloader from "../pages/preloader/preloader";
import Layout from "../components/Layout/Layout";
import Dashboard from "../pages/dashboard/dashboard";
import LoginForm from "../pages/loginPage/LoginPage";
import TwoFactorAuthSetup from "../components/Auth/TwoFactorAuthSetup";

const Routing = (): JSX.Element => {
  return (
    <Suspense fallback={<Preloader isLoading={true} />}>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginForm />} />

        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={
              <Layout>
                <Dashboard />
              </Layout>
            }
          />
          <Route
            path="/2fa-setup"
            element={
              <Layout>
                <TwoFactorAuthSetup />
              </Layout>
            }
          />
        </Route> */}
        <Route
          path="/2fa-setup"
          element={
            <Layout>
              <TwoFactorAuthSetup />
            </Layout>
          }
        />

        {/* Catch-all route for undefined paths */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default Routing;
