import React, { useMemo, ReactNode } from 'react';
import { FormikContext, FormikContextType } from './formikContext';

interface FormikProviderProps {
  children: ReactNode;
  config?: Partial<FormikContextType>;
}

export const FormikProvider: React.FC<FormikProviderProps> = ({ 
  children, 
  config 
}) => {
  const value = useMemo(() => ({
    validateOnBlur: config?.validateOnBlur ?? true,
    validateOnChange: config?.validateOnChange ?? false,
    validateOnMount: config?.validateOnMount ?? false,
    getFieldProps: config?.getFieldProps,
  }), [config?.validateOnBlur, config?.validateOnChange, config?.validateOnMount, config?.getFieldProps]);

  return (
    <FormikContext.Provider value={value}>
      {children}
    </FormikContext.Provider>
  );
};

export default FormikProvider;