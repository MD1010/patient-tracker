import { Button } from "@/components/ui/button";
import { useModal } from "@/store/modal-store";
import { useMutation } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { ScrollArea } from "../ui/scroll-area";
import DEFAULT_FORM_VALUES from "./defualtFormValues";
import { FormSteps } from "./FormSteps";
import { MedicalBackground } from "./steps/MedicalBackground";
import { MedicalHistory } from "./steps/MedicalHistory";
import { PersonalDetails } from "./steps/PersonalDetails";

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

  const form = useForm<FormData>({
    defaultValues: patient || DEFAULT_FORM_VALUES,
    mode: "onChange",
  });
  const addPatientMutation = useMutation(api.patients.add);
  const editPatientMutation = useMutation(api.patients.edit);

  const onSubmit = async (data: FormData) => {
    patient ? await editPatientMutation(data) : await addPatientMutation(data);
    let completedText = patient ? "המטופל עודכן בהצלחה" : "המטופל נוסף בהצלחה";
    toast.success(completedText, { position: "bottom-right" });
    closeModal();
  };

  const onStepClick = (stepNumber: number) => {
    if (patient) {
      setCurrentStep(stepNumber);
    }
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    isValid && setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-4xl p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={formVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          <FormSteps
            currentStep={currentStep}
            editable={!!patient}
            onStepClick={onStepClick}
          />

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <ScrollArea className="h-[42vh] rtl px-4">
              {currentStep === 1 && <PersonalDetails form={form} />}
              {currentStep === 2 && <MedicalBackground form={form} />}
              {currentStep === 3 && <MedicalHistory form={form} />}
            </ScrollArea>

            <div className="mt-12 flex justify-between gap-4">
              {patient ? (
                // Render only the submit button if patient exists
                <Button type="submit" className="flex-1">
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
                      className="flex-1"
                    >
                      <span className="text-right ml-auto">הקודם</span>
                    </Button>
                  )}
                  {currentStep < 3 ? (
                    <Button type="button" onClick={nextStep} className="flex-1">
                      <span>לשלב הבא</span>
                      <ArrowLeftIcon />
                    </Button>
                  ) : (
                    <Button type="submit" className="flex-1">
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
