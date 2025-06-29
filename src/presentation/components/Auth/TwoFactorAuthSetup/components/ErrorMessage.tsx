import React from "react";
import styles from "./ErrorMessage.module.scss";

interface ErrorMessageProps {
  message: string;
  onClose?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose }) => {
  return (
    <div
      className={`${styles.errorContainer} ${onClose ? styles.withCloseButton : ''}`}
    >
      {message}
      {onClose && (
        <button
          onClick={onClose}
          className={styles.closeButton}
          aria-label="Close error"
        >
          ×
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;