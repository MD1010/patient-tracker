import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { DateInput } from "@/components/ui/date-input";
import { cn } from "@/lib/utils";

interface MedicalBackgroundProps {
  form: UseFormReturn<FormData>;
}

export function MedicalBackground({ form }: MedicalBackgroundProps) {
  const { register, watch, setValue, trigger } = form;

  const pregnancyInputRef = useRef<HTMLInputElement | null>(null);
  const cancerDetailsRef = useRef<HTMLInputElement | null>(null);
  const chemotherapyDateRef = useRef<HTMLInputElement | null>(null);

  const conditions = [
    { id: "diabetes", label: "סכרת" },
    { id: "osteoporosis", label: "אוסטואופורוזיס" },
    { id: "asthma", label: "אסתמה" },
    { id: "thyroidProblems", label: "בעיות בבלוטת התריס" },
    { id: "bloodClottingProblems", label: "בעיות בקרישת דם" },
    { id: "hepatitisB", label: "צהבת B" },
    { id: "hepatitisC", label: "צהבת C" },
    { id: "aids", label: "איידס" },
    { id: "hypertension", label: "יתר לחץ דם" },
    { id: "heartDisease", label: "מחלות לב" },
    { id: "artificialValve", label: "מסתם מלאכותי" },
    { id: "pacemaker", label: "קוצב לב" },
    { id: "heartDefect", label: "מום לב" },
    { id: "tuberculosis", label: "שחפת" },
    { id: "kidneyDisease", label: "מחלות כליות" },
    { id: "neurologicalProblems", label: "בעיות נוירולוגיות" },
    { id: "psychiatricProblems", label: "בעיות פסיכיאטריות" },
    { id: "cancer", label: "סרטן" },
  ];

  const toggleCondition = useCallback(
    (id: string, isChecked: boolean) => {
      setValue(`conditions.${id}` as keyof FormData, !isChecked);

      if (id === "cancer" && !isChecked) {
        setTimeout(() => cancerDetailsRef.current?.focus(), 0);
      }
    },
    [setValue]
  );

  const toggleChemotherapy = useCallback(() => {
    const hasUndergoneTreatment = watch("conditions.chemotherapy.hasUndergoneTreatment");
    setValue("conditions.chemotherapy.hasUndergoneTreatment", !hasUndergoneTreatment);

    if (!hasUndergoneTreatment) {
      setTimeout(() => chemotherapyDateRef.current?.focus(), 0);
    }
  }, [setValue, watch]);

  const togglePregnancy = useCallback(() => {
    const isPregnant = watch("pregnancy");
    setValue("pregnancy", !isPregnant);

    if (!isPregnant) {
      setTimeout(() => pregnancyInputRef.current?.focus(), 0);
    }
  }, [setValue, watch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap w-full gap-4 gap-x-6 justify-center items-center sm:h-80 mt-4">
        {conditions.map((condition) => {
          const isChecked = !!watch(`conditions.${condition.id}` as keyof FormData);

          return (
            <Badge
              key={condition.id}
              className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
                isChecked
                  ? "bg-primary"
                  : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
              }`}
              onClick={() => toggleCondition(condition.id, isChecked)}
            >
              {condition.label}
            </Badge>
          );
        })}

        {/* Smoking Badge */}
        <Badge
          className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
            watch("smoking")
              ? "bg-primary"
              : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
          }`}
          onClick={() => setValue("smoking", !watch("smoking"))}
        >
          מעשן/ת
        </Badge>

        {/* Pregnancy Badge */}
        <Badge
          className={`rounded-xl h-10 px-4 text-sm cursor-pointer ${
            watch("pregnancy")
              ? "bg-primary"
              : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
          }`}
          onClick={togglePregnancy}
        >
          בהריון
        </Badge>

        {/* Chemotherapy Badge */}
        <Badge
          className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
            watch("conditions.chemotherapy.hasUndergoneTreatment")
              ? "bg-primary"
              : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
          }`}
          onClick={toggleChemotherapy}
        >
          כימותרפיה/הקרנות
        </Badge>
      </div>

      <div className="flex gap-4">
        {/* Conditional Inputs */}
        {watch("conditions.cancer") && (
          <div className="flex-2 w-full">
            <Label htmlFor="cancerDetails" className="block mb-2 font-semibold">
              פרט על הסרטן
            </Label>
            <Input
              id="cancerDetails"
              {...register("cancerDetails")}
              ref={cancerDetailsRef}
              className="w-full mt-4"
              placeholder="פרט על הסרטן"
            />
          </div>
        )}
        {watch("pregnancy") && (
          <div className="flex-1 min-w-32">
            <Label htmlFor="pregnancyWeek" className="block mb-2 font-semibold">
              באיזה שבוע ההריון?
            </Label>
            <Input
              type="number"
              id="pregnancyWeek"
              {...register("pregnancyWeek")}
              ref={pregnancyInputRef}
              className="w-full mt-4"
              placeholder="הריון בשבוע.."
            />
          </div>
        )}
        {watch("conditions.chemotherapy.hasUndergoneTreatment") && (
          <div className="flex-2 w-full">
            <Label
              htmlFor="chemotherapyDate"
              className="block mb-2 font-semibold"
            >
              תאריך כימותרפיה אחרון
            </Label>
            <DateInput
              dateInputRef={chemotherapyDateRef}
              placeholder="הקלד תאריך"
              dir="rtl"
              id="lastTreatmentDate"
              initialValue={watch("conditions.chemotherapy.lastTreatmentDate")}
              value={watch("conditions.chemotherapy.lastTreatmentDate")}
              className={cn("mt-4")}
              {...register("conditions.chemotherapy.lastTreatmentDate")}
              onChange={(date) => {
                setValue("conditions.chemotherapy.lastTreatmentDate", date?.toISOString() || "");
              }}
              onBlur={() => {
                trigger("conditions.chemotherapy.lastTreatmentDate");
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}