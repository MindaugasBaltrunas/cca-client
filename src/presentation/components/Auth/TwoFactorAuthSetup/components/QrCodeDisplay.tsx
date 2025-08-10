import React from "react";
import styles from "./QrCodeDisplay.module.scss";
import { safeDisplay } from "../../../../../infrastructure/services";

interface QrCodeDisplayProps {
  qrCodeUrl: string;
}

const QrCodeDisplay: React.FC<QrCodeDisplayProps> = ({ qrCodeUrl }) => {
  return (
    <div className={styles.container}>
      <img
        src={safeDisplay.text(qrCodeUrl)}
        alt="QR Code for Two-Factor Authentication"
        className={styles.qrImage}
      />
    </div>
  );
};

export default QrCodeDisplay;
