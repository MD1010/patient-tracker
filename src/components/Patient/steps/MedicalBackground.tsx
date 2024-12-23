import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";

interface MedicalBackgroundProps {
  form: UseFormReturn<FormData>;
}

export function MedicalBackground({ form }: MedicalBackgroundProps) {
  const {
    register,
    watch,
    setValue,
    // formState: { errors },
    // trigger,
  } = form;

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
    { id: "chemotherapy", label: "כימותרפיה/הקרנות" },
    { id: "cancer", label: "סרטן" },
  ];

  const toggleCondition = useCallback(
    (id: string, isChecked: boolean) => {
      setValue(`conditions.${id}` as keyof FormData, !isChecked);
    },
    [setValue]
  );

  return (
    <div className="space-y-6 ">
      <div className="flex flex-wrap  w-full gap-4 gap-x-6">
        {conditions.map((condition) => {
          const isChecked = !!watch(
            `conditions.${condition.id}` as keyof FormData
          );

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
          onClick={() => setValue("pregnancy", !watch("pregnancy"))}
        >
          בהריון
        </Badge>
      </div>

      <div className="flex gap-4">
        {/* Conditional Inputs */}
        {watch("conditions.cancer") && (
          <div className="flex-1 w-full">
            <Label htmlFor="cancerDetails" className="block mb-2 font-semibold">
              פרט על הסרטן
            </Label>
            <Input
              autoFocus
              id="cancerDetails"
              {...register("cancerDetails")}
              className="w-full mt-4"
              placeholder="פרט על הסרטן"
            />
          </div>
        )}
        {watch("pregnancy") && (
          <div className="flex-1 w-full">
            <Label htmlFor="pregnancyWeek" className="block mb-2 font-semibold">
              באיזה שבוע ההריון?
            </Label>
            <Input
              autoFocus
              type="number"
              id="pregnancyWeek"
              {...register("pregnancyWeek")}
              className="w-full mt-4 appearance-none!"
              placeholder="הריון בשבוע.."
            />
          </div>
        )}

        {/* {watch("conditions.chemotherapy") && (
          <div className="flex-1 w-full">
            <Label htmlFor="date" className="block mb-2 font-semibold">
              תאריך כימותרפיה אחרון
            </Label>
            <DateInput
              autoFocus
              placeholder="הקלד תאריך"
              dir="rtl"
              id="date"
              initialValue={watch("dateOfBirth")}
              value={watch("dateOfBirth")}
              className={cn(
                // errors.dateOfBirth ? "border-red-500 shadow-sm" : "",
                "mt-4"
              )}
              {...register("dateOfBirth", {
                validate: (value: string | undefined) => {
                  return value !== "Invalid Date" || "תאריך לא תקין";
                },
              })}
              onChange={(date) => {
                setValue("dateOfBirth", date?.toString() || "");
              }}
              onBlur={() => {
                trigger("dateOfBirth");
              }}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}
