import React from "react";
import { NavLink } from "react-router-dom";
import styles from "../../styles/auth.module.scss";
import { safeDisplay } from "../../../infrastructure/services";

export const LoginFormActions: React.FC = () => {
  return (
    <div className={styles.linksContainer}>
      <div className={styles.links}>
        Not a user?{" "}
        <NavLink to={safeDisplay.url("/2fa-setup")}>2FA Setup</NavLink>
      </div>
      <div className={styles.links}>
        <NavLink to={safeDisplay.url("/verify-2fa")}>Forgot Password?</NavLink>
      </div>
    </div>
  );
};
