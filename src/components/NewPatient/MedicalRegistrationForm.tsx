import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftIcon } from "lucide-react";
import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormSteps } from "./FormSteps";
import { MedicalBackground } from "./steps/MedicalBackground";
import { MedicalHistory } from "./steps/MedicalHistory";
import { PersonalDetails } from "./steps/PersonalDetails";
import { Doc } from "../../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import DEFAULT_FORM_VALUES from "./defualtFormValues";

export type FormData = Doc<"patients">;
const formVariants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

type Props = {
  onCloseModal: () => void;
};

export const MedicalRegistrationForm: FC<Props> = ({ onCloseModal }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<FormData>({
    defaultValues: DEFAULT_FORM_VALUES,
    mode: "onBlur",
  });
  const addPatientMutation = useMutation(api.patients.add);

  const onSubmit = async (data: FormData) => {
    console.log(data);
    await addPatientMutation(data);
    toast.success("המטופל נוסף בהצלחה");
    onCloseModal();
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    // const isSpecialValid = revalidateFormBySpecialValidators(form);
    // console.log("is special valid", isSpecialValid);

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
          <FormSteps currentStep={currentStep} />

          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
            <div>
              {currentStep === 1 && <PersonalDetails form={form} />}
              {currentStep === 2 && <MedicalBackground form={form} />}
              {currentStep === 3 && <MedicalHistory form={form} />}
            </div>

            <div className="mt-12 flex justify-between gap-4 ">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="link"
                  onClick={prevStep}
                  className="flex-1 "
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
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
