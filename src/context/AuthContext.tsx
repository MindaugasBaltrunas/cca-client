// context/AuthContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { useAuthentication } from "../core/authHooks/index";

type AuthContextValue = ReturnType<typeof useAuthentication>;

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Hook'as gauti auth kontekstą
 * Automatiškai tikrina ar yra AuthProvider kontekste
 */
export const useAuth = (): AuthContextValue => {
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
  children: ReactNode;
}

/**
 * Auth konteksto provider'is
 * Turi būti wrapped aukščiau nei bet kuris komponentas naudojantis auth
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthentication();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};