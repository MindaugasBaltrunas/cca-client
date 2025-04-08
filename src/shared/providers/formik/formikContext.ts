import { createContext, useContext } from 'react';
import { FormikConfig, FormikValues } from 'formik';

export interface FormikContextType {
  validateOnBlur: boolean;
  validateOnChange: boolean;
  validateOnMount: boolean;
  getFieldProps?: (name: string) => any;
}

export const FormikContext = createContext<FormikContextType>({
  validateOnBlur: true,
  validateOnChange: false,
  validateOnMount: false,
});

export const useFormikConfig = () => useContext(FormikContext);

export function createFormikConfig<Values extends FormikValues>(
  config: Omit<FormikConfig<Values>, 'validateOnBlur' | 'validateOnChange' | 'validateOnMount'> & 
         Partial<Pick<FormikConfig<Values>, 'validateOnBlur' | 'validateOnChange' | 'validateOnMount'>>,
  context: FormikContextType
): FormikConfig<Values> {
  return {
    ...config,
    validateOnBlur: config.validateOnBlur ?? context.validateOnBlur,
    validateOnChange: config.validateOnChange ?? context.validateOnChange,
    validateOnMount: config.validateOnMount ?? context.validateOnMount,
  };
}