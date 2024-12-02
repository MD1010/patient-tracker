import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormSteps } from "./FormSteps";
import { MedicalBackground } from "./steps/MedicalBackground";
import { MedicalHistory } from "./steps/MedicalHistory";
import { PersonalDetails } from "./steps/PersonalDetails";
import { ArrowLeftIcon, MoveLeftIcon, MoveRight } from "lucide-react";

export type FormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: Date | undefined;
  idNumber: string;
  phone: string;
  lastTreatmentDate: Date | undefined;
  // Medical conditions
  diabetes: boolean;
  osteoporosis: boolean;
  asthma: boolean;
  thyroidProblems: boolean;
  bloodClottingProblems: boolean;
  hepatitisB: boolean;
  hepatitisC: boolean;
  aids: boolean;
  hypertension: boolean;
  heartDisease: boolean;
  artificialValve: boolean;
  pacemaker: boolean;
  heartDefect: boolean;
  tuberculosis: boolean;
  kidneyDisease: boolean;
  neurologicalProblems: boolean;
  psychiatricProblems: boolean;
  cancer: boolean;
  cancerDetails: string;
  chemotherapy: boolean;
  pregnancy: boolean;
  pregnancyWeek: string;
  smoking: boolean;
  // Medical history
  medications: string;
  surgeries: string;
  coumadin: boolean;
  // Allergies
  penicillinLatex: boolean;
  anesthesia: boolean;
  otherAllergies: string;
  date: string;
};

const formVariants = {
  enter: { y: -20, opacity: 0 },
  center: { y: 0, opacity: 1 },
  exit: { y: 20, opacity: 0 },
};

export function MedicalRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString(),
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Form submitted:", data);
    toast.success("הטופס נשלח בהצלחה!");
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
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

            <div className="mt-12 flex justify-between gap-4">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="link"
                  onClick={prevStep}
                  className="flex-1"
                >
                  הקודם
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  <span>לשלב הבא</span>
                  <ArrowLeftIcon />
                </Button>
              ) : (
                <Button type="submit" className="flex-1">
                  שלח טופס
                </Button>
              )}
            </div>
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
