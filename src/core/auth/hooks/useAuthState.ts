import { useState, useMemo, useEffect } from 'react';
import { useTokenData } from './index';
import { AuthUser } from './index';

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  const isAuthenticated = useMemo(() => {
    return !!tokenData?.hasValidToken;
  }, [tokenData?.hasValidToken]);

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentUser(null);
    }
  }, [isAuthenticated]);

  return {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    isAuthenticated,
  };
};