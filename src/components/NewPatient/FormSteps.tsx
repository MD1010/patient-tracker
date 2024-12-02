import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface FormStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, title: 'פרטים אישיים' },
  { number: 2, title: 'רקע ומחלות' },
  { number: 3, title: 'תרופות ועבר רפואי' },
];

export function FormSteps({ currentStep }: FormStepsProps) {
  return (
    <div className="relative">
      <div className="absolute top-5 left-0 w-full h-0.5 bg-muted">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <ol className="relative flex justify-between">
        {steps.map((step) => {
          const isCompleted = currentStep > step.number;
          const isCurrent = currentStep === step.number;

          return (
            <li key={step.number} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-colors duration-200',
                  isCompleted ? 'bg-primary' : isCurrent ? 'bg-primary' : 'bg-muted'
                )}
              >
                {isCompleted ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </motion.div>
                ) : (
                  <span
                    className={cn(
                      'text-sm font-medium',
                      isCurrent ? 'text-primary-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {step.number}
                  </span>
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-sm font-medium',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}