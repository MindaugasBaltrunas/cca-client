import { useNavigate, useSearchParams } from "react-router-dom";
import { safeDisplay } from "xss-safe-display";
import { useTwoFactorSetup } from "./hooks/useTwoFactorSetup";
import ErrorMessage from "./components/ErrorMessage";
import Preloader from "../../Preloader/preloader";
import SetupInstructions from "./components/SetupInstructions";
import QrCodeDisplay from "./components/QrCodeDisplay";
import VerificationForm from "./components/VerificationForm";
import styles from "./TwoFactorAuthSetup.module.scss";
import { logger } from "../../../../shared/utils/logger";

const TwoFactorAuthSetup: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { error, isLoading, isVerifying, setupQrCode, verifyCode, clearError } =
    useTwoFactorSetup();

  const qrCodeUrl = searchParams.get("qr") ?? "";
  
  const handleVerifyCode = async (code: string): Promise<void> => {
    try {
      const success = await verifyCode(code);
      if (success) {
        setSearchParams({});
        navigate("/verify-2fa");
      }
    } catch (err) {
      logger.error("Verification error:", err);
    }
  };

  const handleSetupQrCode = async (): Promise<void> => {
    try {
      const qrUrl = await setupQrCode();

      if (qrUrl) {
        setSearchParams({ qr: String(qrUrl.data.qrCode) });
      }
    } catch (err) {
      console.error("QR setup error:", err);
      setSearchParams({});
    }
  };

  const showQrSection = !error && !isLoading && !!qrCodeUrl;
  logger.debug("showQrSection", showQrSection);
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Set Up Two-Factor Authentication</h2>

      <div className={styles.content}>
        {error && (
          <ErrorMessage
            message={safeDisplay.text(error)}
            onClose={clearError}
          />
        )}

        <Preloader isLoading={isLoading} />

        <div className={styles.debug}>
          <strong>Debug Info:</strong>
          <br />
          Error: {safeDisplay.text(error || "none")}
          <br />
          Loading: {isLoading.toString()}
          <br />
          QR URL: {qrCodeUrl ? "present" : "null"}
          <br />
          Show QR Section: {showQrSection.toString()}
        </div>

        {!isLoading && !qrCodeUrl && !error && (
          <button onClick={handleSetupQrCode} className={styles.setupButton}>
            Start Setup
          </button>
        )}

        {showQrSection && (
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
          <button onClick={handleSetupQrCode} className={styles.retryButton}>
            Retry Setup
          </button>
        )}
      </div>
    </div>
  );
};

export default TwoFactorAuthSetup;
