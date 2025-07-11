import { useState, useMemo } from 'react';
import { useTokenData } from './useTokenData';
import { AuthUser } from './index';

export const useAuthState = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const { data: tokenData, isLoading: tokenLoading } = useTokenData();

  const isAuthenticated = useMemo(() => {
    return !!tokenData?.hasAccessToken;
  }, [tokenData?.hasAccessToken]);

  return {
    currentUser,
    setCurrentUser,
    tokenData,
    tokenLoading,
    isAuthenticated,
  };
};
