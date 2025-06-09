import { useCallback, useState } from "react";

import { getAccessToken } from "../../infrastructure/services/tokenStorage";

export const useAccessToken = () => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchToken = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const accessToken = await getAccessToken();
      setToken(accessToken);
    } finally {
      setLoading(false);
    }
  }, [loading]);

  return { token, fetchToken, loading };
};