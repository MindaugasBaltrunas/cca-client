import React from "react";
import { useFormikContext } from "formik";
import { safeDisplay } from "xss-safe-display";

interface FormInputProps {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  type,
  required,
  placeholder,
  autoComplete,
}) => {
  const formik = useFormikContext<any>();
  const { touched, errors, getFieldProps } = formik;
  const fieldProps = getFieldProps(name);

  const errorMessage =
    touched[name] && typeof errors[name] === "string"
      ? (errors[name] as string)
      : "";

  return (
    <div>
      <label
        htmlFor={name}
        dangerouslySetInnerHTML={safeDisplay.html(
          `${label}${required ? " *" : ""}`
        )}
      />
      <input
        id={name}
        type={type}
        placeholder={safeDisplay.text(placeholder || "")}
        autoComplete={autoComplete}
        {...fieldProps}
      />
      {errorMessage && <div className="danger">{safeDisplay.text(errorMessage)}</div>}
    </div>
  );
};

export default FormInput;
