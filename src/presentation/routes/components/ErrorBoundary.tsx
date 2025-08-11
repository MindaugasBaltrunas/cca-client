import React from "react";
import { Navigate } from "react-router-dom";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";
import { ALLOWED_ROUTES } from "../constants/constants";

interface Props {
  children: React.ReactNode;
}

function FallbackComponent() {
  return (
    <div role="alert" className="error-boundary">
      <h2>Navigation Error</h2>
      <p>Redirecting to login...</p>
      <Navigate to={ALLOWED_ROUTES.LOGIN} replace />
    </div>
  );
}

export function ErrorBoundary({ children }: Props) {
  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={(error, info) => {
        console.error("Route error:", error, info);
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
