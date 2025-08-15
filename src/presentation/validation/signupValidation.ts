import * as Yup from "yup";
import { SignUpData, UserRole } from "../../shared/types/auth.base.types"; 

export const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
  name: Yup.string()
    .max(50, 'Name must be 50 characters or less'),
  role: Yup.string()
    .oneOf(Object.values(UserRole), 'Invalid role selected') 
    .nullable(),
  adminPassword: Yup.string().when('role', {
    is: (role: UserRole | undefined) => role === UserRole.Admin,
    then: (schema) => schema.required('Admin password is required for Admin role'),
    otherwise: (schema) => schema.nullable(),
  }),
});

export const initialValues: SignUpData = {
  email: '',
  password: '',
  confirmPassword: '',
  name: '',
  role: undefined,
  adminPassword: '',
};