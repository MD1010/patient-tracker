import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";

interface MedicalHistoryProps {
  form: UseFormReturn<FormData>;
}

export function MedicalHistory({ form }: MedicalHistoryProps) {
  const { register, watch, setValue } = form;

  return (
    <div className="space-y-6">
      {" "}
      {/* Consistent spacing between all sections */}
      <div className="space-y-2">
        <Label htmlFor="medications">אילו תרופות קבועות המטופל נוטל?</Label>
        <Textarea
          placeholder="תרופות קבועות"
          id="medications"
          {...register("medications.otherMedications")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="surgeries">אילו ניתוחים או אשפוזים המטופל עבר?</Label>
        <Textarea
          placeholder="ניתוחים/אשפוזים"
          id="surgeries"
          {...register("surgeries")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="otherAllergies">האם המטופל סובל מאלרגיות נוספות?</Label>
        <Input
          placeholder="אלרגיות נוספות/אחר"
          id="otherAllergies"
          {...register("otherAllergies")}
        />
      </div>
      <div className="space-y-2">
        <Label className="block mb-2 font-semibold my-4">
          רגישויות וחומרים נוספים (בחר)
        </Label>
        <div className="flex flex-wrap gap-4">
          <Badge
            className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
              watch("medications.coumadin")
                ? "bg-primary"
                : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
            }`}
            onClick={() =>
              setValue("medications.coumadin", !watch("medications.coumadin"))
            }
          >
            נוטל קומדין
          </Badge>
          <Badge
            className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
              watch("medications.penicillinLatex")
                ? "bg-primary"
                : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
            }`}
            onClick={() =>
              setValue(
                "medications.penicillinLatex",
                !watch("medications.penicillinLatex")
              )
            }
          >
            פניצילין / לטקס
          </Badge>
          <Badge
            className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
              watch("anesthesia")
                ? "bg-primary"
                : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
            }`}
            onClick={() => setValue("anesthesia", !watch("anesthesia"))}
          >
            חומרי הרדמה
          </Badge>
        </div>
      </div>
    </div>
  );
}
