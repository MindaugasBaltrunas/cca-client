import * as Yup from "yup";
import { FormValues } from "./types";

export const validationSchema = Yup.object({
  verificationCode: Yup.string()
    .required("Verification code is required")
    .matches(/^[0-9]{6}$/, "Code must be 6 digits")
    .length(6, "Code must be exactly 6 digits"),
});

export const initialValues: FormValues = {
  verificationCode: "",
};
