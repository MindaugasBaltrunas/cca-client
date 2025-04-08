import { useFormik, FormikConfig, FormikValues } from 'formik';
import { createFormikConfig, useFormikConfig } from './formikContext';

export function useFormikWithDefaults<Values extends FormikValues>(
  config: Omit<FormikConfig<Values>, 'validateOnBlur' | 'validateOnChange' | 'validateOnMount'> & 
         Partial<Pick<FormikConfig<Values>, 'validateOnBlur' | 'validateOnChange' | 'validateOnMount'>>
) {
  const formikContext = useFormikConfig();
  const formikConfig = createFormikConfig(config, formikContext);
  return useFormik(formikConfig);
}