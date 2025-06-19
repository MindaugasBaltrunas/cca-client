import { useCallback } from "react";
import { getAccessToken } from "../../infrastructure/services/tokenStorage";

export const useAccessToken = () => {
  const fetchToken = useCallback(async (): Promise<string | null> => {
    try {
      const accessToken = await getAccessToken();
      return accessToken || null;
    } catch {
      return null;
    }
  }, []);

  return { fetchToken };
};
