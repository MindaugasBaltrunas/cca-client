import { useTokenData } from "./useTokenData";

export const useAccessToken = () => {
  const { data, isLoading, error } = useTokenData();

  return {
    token: data?.accessToken ?? null,
    hasToken: data?.hasAccessToken ?? false,
    hasValidToken: data?.hasValidToken ?? false,
    userId: data?.userId ?? null,
    isLoading,
    error,
  };
};