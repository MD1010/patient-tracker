import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface MedicalBackgroundProps {
  form: UseFormReturn<FormData>;
}

export function MedicalBackground({ form }: MedicalBackgroundProps) {
  const { register, watch, setValue } = form;

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
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 w-full gap-4 gap-x-6">
        {conditions.map((condition) => (
          <div key={condition.id} className="flex items-center space-x-2 ">
            <Checkbox
              className="ml-2"
              id={condition.id}
              checked={watch(`conditions.${condition.id}` as keyof FormData) as boolean}
              onCheckedChange={(checked) =>
                setValue(`conditions.${condition.id}` as keyof FormData, checked as boolean)
              }
            />
            <Label htmlFor={condition.id}>{condition.label}</Label>
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-4 h-8">
        <div className="flex items-center space-x-2 ">
          <Checkbox
            className="ml-2"
            id="cancer"
            checked={watch("conditions.cancer")}
            onCheckedChange={(checked) =>
              setValue("conditions.cancer", checked as boolean)
            }
          />
          <Label htmlFor="cancer">סרטן</Label>
        </div>
        {watch("conditions.cancer") && (
          <div className="flex items-center gap-x-2">
            <Label htmlFor="cancerDetails" className="mr-4">
              פירוט
            </Label>
            <Input
              id="cancerDetails"
              {...register("cancerDetails")}
              className="w-full"
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 h-4">
        <Label htmlFor="pregnancy" className="ml-3">
          הריון
        </Label>

        <Switch
          id="pregnancy"
          checked={watch("pregnancy")}
          onCheckedChange={(checked) => setValue("pregnancy", checked)}
        />
        {watch("pregnancy") && (
          <div className="flex items-center">
            <Label htmlFor="pregnancyWeek">שבוע</Label>
            <Input
              autoComplete='new-password'
              min={1}
              type="number"
              id="pregnancyWeek"
              className="w-20 mr-2"
              {...register("pregnancyWeek")}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4 h-4">
        <Label htmlFor="smoking" className="ml-3">
          עישון
        </Label>
        <Switch
          className="mr-4"
          id="smoking"
          checked={watch("smoking")}
          onCheckedChange={(checked) => setValue("smoking", checked)}
        />
      </div>
    </div>
  );
}
