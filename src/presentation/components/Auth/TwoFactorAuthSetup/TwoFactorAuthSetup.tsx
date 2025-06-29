import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useTwoFactorSetup } from "./hooks/useTwoFactorSetup";
import ErrorMessage from "./components/ErrorMessage";
import Preloader from "../../Preloader/preloader";
import SetupInstructions from "./components/SetupInstructions";
import QrCodeDisplay from "./components/QrCodeDisplay";
import VerificationForm from "./components/VerificationForm";
import styles from "./TwoFactorAuthSetup.module.scss";
import { logger } from "../../../../shared/utils/logger";

const TwoFactorAuthSetup: React.FC = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const { error, isLoading, isVerifying, setupQrCode, verifyCode, clearError } =
    useTwoFactorSetup();

  const handleVerifyCode = async (code: string): Promise<void> => {
    try {
      const success = await verifyCode(code);
      if (success) {
        navigate("/login");
      }
    } catch (err) {
      // Error is already set in the hook
      console.error("Verification error (already handled):", err);
    }
  };

  const qrCodeUrlExists = async () => {
    const qr = await setupQrCode();
    setQrCodeUrl(qr?.qrCodeUrl || null);
    logger.debug("Rendering TwoFactorAuthSetup component 1", {
      qr,
      error,
      isLoading,
    });
  };
  logger.debug("Rendering TwoFactorAuthSetup component 2", {
    qrCodeUrl,
    error,
    isLoading,
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set Up Two-Factor Authentication</h2>

      <div className={styles.content}>
        {error && <ErrorMessage message={error} onClose={clearError} />}
        <Preloader isLoading={isLoading} />

        {!isLoading && !qrCodeUrl && !error && (
          <button onClick={qrCodeUrlExists} className={styles.setupButton}>
            Start Setup
          </button>
        )}

        {!error && !isLoading && qrCodeUrl && (
          <>
            <SetupInstructions />
            <QrCodeDisplay qrCodeUrl={qrCodeUrl} />
            <VerificationForm
              onSubmit={handleVerifyCode}
              isVerifying={isVerifying}
            />
          </>
        )}

        {error && !isLoading && (
          <button onClick={qrCodeUrlExists} className={styles.retryButton}>
            Retry Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthSetup;
