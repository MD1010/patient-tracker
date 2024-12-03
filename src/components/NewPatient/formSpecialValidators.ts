import { validateIsraeliPhone } from "@/lib/validators";
import { FormData } from "./MedicalRegistrationForm";
import { UseFormReturn } from "react-hook-form";

interface SpecialValidation<FormData> {
  field: keyof FormData; // Ensures the field exists in the form
  message: string;
  validateFunc: (value: any) => boolean; // Define validation function signature
}

export const FORM_SPECIAL_VALIDATIONS: SpecialValidation<FormData>[] = [
  {
    field: "phone",
    message: "מספר טלפון לא תקין",
    validateFunc: validateIsraeliPhone,
  },
];

export const revalidateFormBySpecialValidators = (
  form: UseFormReturn<any, any, undefined>
) => {
  FORM_SPECIAL_VALIDATIONS.forEach(({ field, message, validateFunc }) => {
    const fieldValue = form.watch(field as keyof FormData);

    console.log("field value", fieldValue);
    console.log("valid ?", validateFunc(fieldValue));
    

    if (!validateFunc(fieldValue)) {
      form.setError(field, { message });
      return false;
    }
  });
  return true;
};
