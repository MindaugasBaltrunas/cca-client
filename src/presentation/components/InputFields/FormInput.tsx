import React from 'react';
import { useFormikContext } from 'formik';

interface FormInputProps {
  name: string;
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}

const FormInput: React.FC<FormInputProps> = ({ 
  name, 
  label, 
  type, 
  required, 
  placeholder 
}) => {
  const formik = useFormikContext<any>();
  const fieldProps = formik.getFieldProps(name);
  
  const getErrorMessage = (): string => {
    const error = formik.errors[name];
    return typeof error === 'string' ? error : '';
  };
  
  return (
    <div>
      <label htmlFor={name}>{label}{required && ' *'}</label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...fieldProps}
      />
      {formik.touched[name] && formik.errors[name] ? (
        <div className="danger">{getErrorMessage()}</div>
      ) : null}
    </div>
  );
};

export default FormInput;