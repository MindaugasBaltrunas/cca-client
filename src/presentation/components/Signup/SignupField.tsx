import React from "react";
import { useFormikContext } from "formik";
import { SignUpData, UserRole } from "../../../shared/types/auth.base.types";
import FormInput from "../InputFields/FormInput";

const SignUpFields: React.FC = () => {
  const { isSubmitting, values } = useFormikContext<SignUpData>();

  return (
    <>
      <FormInput
        name="name"
        label="Name"
        type="text"
        required
        placeholder="Enter your name"
        autoComplete="name"
      />

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
        autoComplete="new-password"
      />

      <FormInput
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        required
        placeholder="Confirm your password"
        autoComplete="new-password"
      />

      {/* Optional role selection */}
      {/* <FormSelect
        name="role"
        label="Role (Optional)"
        options={UserRole.map((role) => ({
          value: role,
          label: role.charAt(0).toUpperCase() + role.slice(1),
        }))}
      /> */}

      {/* Conditional field for admin password */}
      {values.role === UserRole.Admin && (
        <FormInput
          name="adminPassword"
          label="Admin Password"
          type="password"
          required
          placeholder="Enter admin password"
        />
      )}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Signing up..." : "Sign Up"}
      </button>
    </>
  );
};

export default SignUpFields;