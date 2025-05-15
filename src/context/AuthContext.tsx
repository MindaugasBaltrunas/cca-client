import React, { createContext, useContext } from "react";
import { useAuthentication } from "../core/hooks/useAuthentication";

type AuthContextValue = ReturnType<typeof useAuthentication>;

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider. " +
        "Make sure the component is wrapped in an AuthProvider."
    );
  }

  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthentication();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};
