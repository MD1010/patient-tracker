import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

interface MedicalHistoryProps {
  form: UseFormReturn<FormData>;
}

export function MedicalHistory({ form }: MedicalHistoryProps) {
  const { register, watch, setValue } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medications">תרופות קבועות</Label>
        <Textarea id="medications" {...register("medications.otherMedications")} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="surgeries">ניתוחים/אשפוזים</Label>
        <Textarea id="surgeries" {...register("surgeries")} />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="coumadin" className="ml-3">
          נוטל קומדין
        </Label>
        <Switch
          id="coumadin"
          checked={watch("medications.coumadin")}
          onCheckedChange={(checked) => setValue("medications.coumadin", checked)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="penicillinLatex" className="ml-3">
          פניצילין / לטקס
        </Label>
        <Switch
          id="penicillinLatex"
          checked={watch("medications.penicillinLatex")}
          onCheckedChange={(checked) => setValue("medications.penicillinLatex", checked)}
        />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="anesthesia" className="ml-3">
          חומרי הרדמה
        </Label>
        <Switch
          id="anesthesia"
          checked={watch("anesthesia")}
          onCheckedChange={(checked) => setValue("anesthesia", checked)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="otherAllergies">אלרגיות נוספות/אחר</Label>
        <Input id="otherAllergies" {...register("otherAllergies")} />
      </div>
    </div>
  );
}
