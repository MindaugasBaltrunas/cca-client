import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType, useAuthentication } from "../core/authHooks/index";

const AuthContext = createContext<AuthContextType | null>(null);

// 🎯 Main auth hook - use this everywhere
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

// 📦 Provider component
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthentication();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};