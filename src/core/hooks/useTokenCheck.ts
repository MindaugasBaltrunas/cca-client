import { useEffect, useState } from "react";
import { getAccessToken, getId } from "../../infrastructure/services/tokenStorage";

const useTokenCheck = () => {
  const [hasValidToken, setHasValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await getAccessToken();
        const userId = getId();
        setHasValidToken(!!(token && userId));
      } catch (error) {
        setHasValidToken(false);
      }
    };

    checkToken();
  }, []);

  return hasValidToken;
};

export default useTokenCheck;