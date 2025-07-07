import React, {  useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTwoFactorSetup } from "./hooks/useTwoFactorSetup";
import ErrorMessage from "./components/ErrorMessage";
import Preloader from "../../Preloader/preloader";
import SetupInstructions from "./components/SetupInstructions";
import QrCodeDisplay from "./components/QrCodeDisplay";
import VerificationForm from "./components/VerificationForm";
import styles from "./TwoFactorAuthSetup.module.scss";
import { logger } from "../../../../shared/utils/logger";

const TwoFactorAuthSetup: React.FC = () => {
  // Use URL search params to persist QR code across re-mounts
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const { 
    error, 
    isLoading, 
    isVerifying, 
    setupQrCode, 
    verifyCode, 
    clearError 
  } = useTwoFactorSetup();

  const qrCodeUrl = searchParams.get('qr');

  useEffect(() => {
    console.log("🔍 State changed:", {
      qrCodeUrl,
      error,
      isLoading,
      isVerifying,
      shouldShowQrCode: !error && !isLoading && qrCodeUrl
    });
  }, [qrCodeUrl, error, isLoading, isVerifying]);

  const handleVerifyCode = async (code: string): Promise<void> => {
    try {
      const success = await verifyCode(code);
      if (success) {
        // Clear QR from URL and navigate to dashboard
        setSearchParams({});
        navigate("/verify-2fa");
      }
    } catch (err) {
      console.error("Verification error (already handled):", err);
    }
  };

  const handleSetupQrCode = async (): Promise<void> => {
    try {      
      const qr = await setupQrCode();
      
      // Store QR code in URL params (survives re-mounts)
      const qrUrl = qr?.qrCodeUrl;
      if (qrUrl) {
        setSearchParams({ qr: qrUrl });
      }
      
      logger.debug("QR Code setup completed");
    } catch (err) {
      console.error("❌ QR setup error:", err);
      setSearchParams({}); // Clear on error
      logger.error("Failed to setup QR code", err);
    }
  };

  logger.debug("Rendering TwoFactorAuthSetup", {
    qrCodeUrl,
    error,
    isLoading,
    isVerifying
  });

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set Up Two-Factor Authentication</h2>

      <div className={styles.content}>
        {error && <ErrorMessage message={error} onClose={clearError} />}

        <Preloader isLoading={isLoading} />

        {/* Debug info - remove in production */}
        <div style={{ 
          background: '#f0f0f0', 
          padding: '10px', 
          margin: '10px 0', 
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <strong>Debug Info:</strong><br />
          Error: {error || 'none'}<br />
          Loading: {isLoading.toString()}<br />
          QR URL (from params): {qrCodeUrl ? 'present' : 'null'}<br />
          Should show QR: {(!error && !isLoading && !!qrCodeUrl).toString()}
        </div>

        {/* Initial setup button */}
        {!isLoading && !qrCodeUrl && !error && (
          <button onClick={handleSetupQrCode} className={styles.setupButton}>
            Start Setup
          </button>
        )}

        {/* QR Code and verification form */}
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

        {/* Retry button when there's an error */}
        {error && !isLoading && (
          <button onClick={handleSetupQrCode} className={styles.retryButton}>
            Retry Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthSetup;