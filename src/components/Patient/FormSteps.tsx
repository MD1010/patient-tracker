import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FormStepsProps {
  currentStep: number;
  editable?: boolean; // New prop to enable free navigation
  onStepClick?: (stepNumber: number) => void; // Callback for step click
}
const steps = [
  { number: 1, title: "פרטים אישיים" },
  { number: 2, title: "רקע ומחלות" },
  { number: 3, title: "תרופות ועבר רפואי" },
  { number: 4, title: "חתימת המטופל" },
];

export function FormSteps({
  currentStep,
  editable,
  onStepClick,
}: FormStepsProps) {
  return (
    <div className="relative top-1">
      <div className="absolute top-5 right-10 w-[80%] h-[0.05rem] bg-foreground">
        <motion.div
          className="absolute top-0 left-0 h-full bg-primary"
          initial={{ width: "0%" }}
          animate={{
            width: `${((currentStep - 1) / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <ol className="relative flex justify-between">
        {steps.map((step) => {
          const isCurrent = currentStep === step.number;
          const isCompleted = !editable && currentStep > step.number;

          return (
            <li
              key={step.number}
              className={cn(
                "flex flex-col items-center group",
                editable && currentStep !== step.number && "cursor-pointer"
              )}
              onClick={() => editable && onStepClick?.(step.number)}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center relative z-10 transition-transform duration-50 ",
                  editable &&
                    currentStep !== step.number &&
                    "group-hover:scale-[1.15]",
                  isCompleted
                    ? "bg-primary"
                    : isCurrent
                      ? "bg-primary"
                      : "bg-muted border-foreground border-2"
                )}
              >
                <span
                  className={cn(
                    "text-sm font-semibold",
                    editable
                      ? isCurrent
                        ? "text-primary-foreground"
                        : "text-foreground"
                      : isCurrent
                        ? "text-primary-foreground"
                        : isCompleted
                          ? "text-primary-foreground"
                          : "text-foreground"
                  )}
                >
                  {editable || isCurrent || !isCompleted ? (
                    step.number
                  ) : (
                    <Check className="w-5 h-5" />
                  )}
                </span>
              </div>
              <span
                className={cn(
                  "mt-2 text-sm font-medium transition-transform duration-50 text-center mx-4",
                  isCurrent ? "text-primary" : "text-muted-foreground"
                  // editable && currentStep !== step.number && "group-hover:scale-[1.2]",
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