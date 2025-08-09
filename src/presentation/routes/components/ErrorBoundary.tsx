import React, { Component, ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ALLOWED_ROUTES } from "../constants/constants";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Route error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div role="alert" className="error-boundary">
          <h2>Navigation Error</h2>
          <p>Redirecting to dashboard...</p>
          <Navigate to={ALLOWED_ROUTES.DASHBOARD} replace />
        </div>
      );
    }

    return this.props.children;
  }
}