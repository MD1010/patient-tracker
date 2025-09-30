import { Button } from "@/components/ui/button";
import { useModal } from "@/store/modal-store";
import { usePatients } from "@/store/patients-store";
import { useMutation, useConvex } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import DEFAULT_FORM_VALUES from "./defualtFormValues";
import { FormSteps } from "./FormSteps";
import { MedicalBackground } from "./steps/MedicalBackground";
import { MedicalHistory } from "./steps/MedicalHistory";
import { PersonalDetails } from "./steps/PersonalDetails";
import { ESignature } from "../ESignature";


export type FormData = Doc<"patients">;
const formVariants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

type Props = {
  patient?: Doc<"patients">;
};

export const MedicalRegistrationForm: FC<Props> = ({ patient }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const { setSelectedPatient } = usePatients();


  const form = useForm<FormData>({
    defaultValues: patient || DEFAULT_FORM_VALUES,
    mode: "onChange",
  });
  const addPatientMutation = useMutation(api.patients.add);
  const editPatientMutation = useMutation(api.patients.edit);
  const convex = useConvex();

  const onSubmit = async (data: FormData) => {
    try {
      setIsLoading(true);
      const updatedPatient = patient
        ? await editPatientMutation(data)
        : await addPatientMutation(data);
      let completedText = patient
        ? "המטופל עודכן בהצלחה"
        : "המטופל נוסף בהצלחה";
      toast.success(completedText, { position: "bottom-right" });
      closeModal();
      setIsLoading(false);

      if (updatedPatient) {
        setTimeout(() => {
          setSelectedPatient(updatedPatient);
        }, 250);
      }
    } catch (e) {
      toast.error("ארעה שגיעה", {
        position: "bottom-right",
        style: {
          backgroundColor: "#dc2626",
          width: 150,
        },
      });
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };

  const onStepClick = (stepNumber: number) => {
    if (patient) {
      setCurrentStep(stepNumber);
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    
    if (isValid && currentStep === 1) {
      // Check for duplicate ID only when moving from step 1 (Personal Details)
      const idNumber = form.getValues("idNumber");
      if (idNumber) {
        try {
          const isDuplicate = await convex.query(api.patients.checkIdExists, {
            idNumber,
            excludePatientId: patient?._id // Exclude current patient in edit mode
          });
          
          if (isDuplicate) {
            form.setError("idNumber", {
              type: "manual",
              message: "מטופל עם מספר תעודת זהות קיים במערכת"
            });
            return; // Don't proceed to next step
          }
        } catch (error) {
          console.error("Error checking ID:", error);
          toast.error("שגיאה בבדיקת תעודת הזהות", {
            position: "bottom-right",
          });
          return;
        }
      }
    }
    
    isValid && setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-4xl p-6 mobile:p-0 pt-0 h-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={formVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="flex flex-col h-full overflow-hidden"
        >
          <FormSteps
            currentStep={currentStep}
            editable={!!patient && form.formState.isValid}
            onStepClick={onStepClick}
          />

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="mt-6 flex flex-col flex-1 overflow-hidden"
          >
            <div className="px-4 overflow-auto max-h-[50vh] mobile:max-h-[55vh] scrollbar-rtl mobile:px-1">
              {currentStep === 1 && <PersonalDetails form={form} />}
              {currentStep === 2 && <MedicalBackground form={form} />}
              {currentStep === 3 && <MedicalHistory form={form} />}
              {currentStep === 4 && <ESignature form={form} isEditMode={!!patient?.signature}/>}
            </div>

            <div className="mt-auto pt-4 gap-4 flex items-center flex-shrink-0">
              {patient ? (
                // Render only the submit button if patient exists
                <Button
                  disabled={currentStep === 4 && !!patient.signature}
                  type="submit"
                  className="flex-1"
                  isLoading={isLoading}
                  variant="submit"
                >
                  עדכן
                </Button>
              ) : (
                // Render navigation buttons for steps if no patient
                <>
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="link"
                      onClick={prevStep}
                      className="flex-1 mobile:py-6 !border-none"
                    >
                      <ArrowRightIcon />
                      <span className="text-right ml-auto">הקודם</span>
                    </Button>
                  )}
                  {currentStep < 4 ? (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex-1"
                      variant="submit"
                    >
                      <span>לשלב הבא</span>
                      <ArrowLeftIcon />
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      className="flex-1"
                      isLoading={isLoading}
                    >
                      שמור
                    </Button>
                  )}
                </>
              )}
            </div>
          </form>
        </motion.div>
      </AnimatePresence>

    </div>
  );
};
