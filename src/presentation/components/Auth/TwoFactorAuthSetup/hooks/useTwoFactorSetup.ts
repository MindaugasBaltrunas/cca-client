import { useState, useCallback } from "react";
import { useAuth } from "../../../../../core/auth/context/AuthContext";
import { logger } from "../../../../../shared/utils/logger";
import { AuthResponse, TwoFactorSetupResponse } from "../../../../../shared/types/api.types";

interface UseTwoFactorSetupReturn {
  qrCodeUrl: AuthResponse | null;
  error: string | null;
  isLoading: boolean;
  isVerifying: boolean;
  setupQrCode: () => Promise<TwoFactorSetupResponse | void>;
  verifyCode: (code: string) => Promise<boolean>;
  clearError: () => void;
}

export const useTwoFactorSetup = (): UseTwoFactorSetupReturn => {
  const [qrCodeUrl, setQrCodeUrl] = useState<AuthResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const { setupTwoFactorAuth, enableTwoFactorAuth } = useAuth();

  const handleSetupError = (err: any) => {
    logger.error("2FA setup error", err);
    if (err?.status === 429) {
      setError("Too many requests. Please wait a moment and try again.");
    } else if (err?.code === "ERR_NETWORK") {
      setError("Server is unreachable. Please check your network or backend.");
    } else {
      setError(err?.message || "Failed to set up two-factor authentication");
    }
  };

  const handleVerificationError = (err: any) => {
    logger.error("2FA verification error", err);
    if (err?.message?.toLowerCase().includes("invalid")) {
      setError("Invalid verification code. Please try again.");
    } else {
      setError(err?.message || "Verification failed. Please try again.");
    }
  };

  const setupQrCode = useCallback(async (): Promise<TwoFactorSetupResponse | void> => {
    if (isLoading ) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await setupTwoFactorAuth();
      setQrCodeUrl(response?.qrCode || null);

      return response;
    } catch (err: any) {
      handleSetupError(err);
    } finally {
      setIsLoading(false);
    }
  }, [setupTwoFactorAuth, isLoading]);

  const verifyCode = useCallback(
    async (code: string): Promise<boolean> => {
      if (isVerifying) return false;

      setIsVerifying(true);
      setError(null);

      try {
        const response = await enableTwoFactorAuth(code);
        return response.status === "success";
      } catch (err: any) {
        handleVerificationError(err);
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [enableTwoFactorAuth, isVerifying]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    qrCodeUrl,
    error,
    isLoading,
    isVerifying,
    setupQrCode,
    verifyCode,
    clearError,
  };
};
