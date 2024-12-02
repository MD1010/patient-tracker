import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { FormSteps } from './FormSteps';
import { PersonalDetails } from './steps/PersonalDetails';
import { MedicalBackground } from './steps/MedicalBackground';
import { MedicalHistory } from './steps/MedicalHistory';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  enter: { x: 300, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -300, opacity: 0 },
};

export function MedicalRegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<FormData>({
    defaultValues: {
      date: new Date().toISOString(),
    },
  });

  const onSubmit = (data: FormData) => {
    console.log('Form submitted:', data);
    toast.success('הטופס נשלח בהצלחה!');
  };

  const nextStep = async () => {
    const isValid = await form.trigger();
    if (isValid) setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-card rounded-xl shadow-lg">
      <FormSteps currentStep={currentStep} />
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={formVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            {currentStep === 1 && <PersonalDetails form={form} />}
            {currentStep === 2 && <MedicalBackground form={form} />}
            {currentStep === 3 && <MedicalHistory form={form} />}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={prevStep}>
              הקודם
            </Button>
          )}
          {currentStep < 3 ? (
            <Button type="button" onClick={nextStep}>
              הבא
            </Button>
          ) : (
            <Button type="submit">שלח טופס</Button>
          )}
        </div>
      </form>
    </div>
  );
}