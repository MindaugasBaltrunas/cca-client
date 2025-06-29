import * as Yup from "yup";

export interface TwoFactorFormValues {
  verificationCode: string;
}

export const twoFactorValidationSchema = Yup.object({
  verificationCode: Yup.string()
    .matches(/^\d{6}$/, "Must be exactly 6 digits")
    .required("Verification code is required"),
});

export const initialFormValues: TwoFactorFormValues = {
  verificationCode: "",
};