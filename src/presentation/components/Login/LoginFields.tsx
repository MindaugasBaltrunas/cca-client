import React from "react";
import { useFormikContext } from "formik";
import { LoginData } from "../../../shared/types/auth.base.types";
import FormInput from "../InputFields/FormInput";

const LoginFields: React.FC = () => {
  const { isSubmitting } = useFormikContext<LoginData>();

  return (
    <>
      <FormInput
        name="email"
        label="Email"
        type="email"
        required
        placeholder="Enter your email"
        autoComplete="email"
      />

      <FormInput
        name="password"
        label="Password"
        type="password"
        required
        placeholder="Enter your password"
        autoComplete="current-password"
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Logging in..." : "Login"}
      </button>
    </>
  );
};

export default LoginFields;
