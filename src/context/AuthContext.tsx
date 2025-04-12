// src/context/AuthContext.tsx
import React, { createContext, useContext } from "react";
import { useAuthentication } from "../core/hooks/useAuthentication";

type AuthContextValue = ReturnType<typeof useAuthentication>;

const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth turi būti naudojamas AuthProvider viduje. " +
        "Įsitikinkite, kad komponentas yra apgaubtas AuthProvider"
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
