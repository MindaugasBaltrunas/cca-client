import * as Yup from "yup";
import { LoginData } from "../../shared/types/auth.base.types";

export const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

export const initialValues: LoginData = { email: '', password: '' };