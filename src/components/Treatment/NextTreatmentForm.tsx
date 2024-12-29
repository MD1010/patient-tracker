import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { addMonths } from "date-fns";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";
import { recallDateToValue } from "./recallDateToValue";
import { cn } from "@/lib/utils";

type NewTreatmentFormData = {
  nextTreatment: string; // Date as string
  nextTreatmentRecallDate: string; // Date as string
  selectedTime: string; // Time as string
};

type Props = {
  patient: Doc<"patients">;
};

export const NextTreatmentForm: FC<Props> = ({ patient }) => {
  const updatePatient = useMutation(api.patients.edit);
  const [showRecallDate, setShowRecallDate] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors, isValid },
  } = useForm<NewTreatmentFormData>({
    defaultValues: {
      nextTreatment: patient.nextTreatment || "",
      nextTreatmentRecallDate: patient.nextTreatmentRecallDate || "",
      selectedTime: "",
    },
    mode: "onChange",
  });

  const nextTreatment = watch("nextTreatment");
  const nextTreatmentRecallDate = watch("nextTreatmentRecallDate");
  const selectedTime = watch("selectedTime");

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setValue("nextTreatment", date.toString());
      setShowRecallDate(false); // Hide recall date when a valid date is selected
      setValue("nextTreatmentRecallDate", ""); // Clear recall date
    } else {
      setValue("nextTreatment", "");
    }
  };

  const generateTimeSlots = (start: number, end: number, gap: number) => {
    const slots = [];
    for (let time = start; time <= end; time += gap) {
      const hours = Math.floor(time);
      const minutes = Math.round((time - hours) * 60);
      slots.push(
        `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
      );
    }
    return slots;
  };

  const AVAILABLE_TIMES = generateTimeSlots(8, 21, 0.75); // Example: 0.75 for 45-minute gaps

  const onSubmit: SubmitHandler<NewTreatmentFormData> = async (data) => {
    if (!nextTreatmentRecallDate && (!nextTreatment || !selectedTime)) {
      toast.error("יש לבחור תאריך ושעה או תאריך תזכור", {
        position: "bottom-right",
      });
      return;
    }

    await updatePatient({
      ...patient,
      nextTreatment: data.nextTreatment,
      nextTreatmentRecallDate: data.nextTreatmentRecallDate,
    });
    toast.success("פרטי המטופל עודכנו בהצלחה", { position: "bottom-right" });
  };

  return (
    <form
      className="space-y-6 flex flex-col gap-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Label className="text-sm font-semibold">בחר תאריך לטיפול הבא</Label>
      <div className="flex gap-4 items-center">
        {!showRecallDate && <div className="flex-1 space-y-3">
          <DateInput
            dir="rtl"
            placeholder="הכנס תאריך"
            value={nextTreatment}
            className={cn(
              errors.nextTreatment ? "border-red-500 shadow-sm" : ""
            )}
            {...register("nextTreatment", {
              validate: (value) => {
                if (!value) return true;
                if (value === "Invalid Date") return "תאריך לא תקין";
                if (new Date(value).getTime() <= new Date().getTime())
                  return "יש לבחור תאריך עתידי";
                return true;
              },
            })}
            onChange={handleDateChange}
            onBlur={() => trigger("nextTreatment")}
          />
          {errors.nextTreatment && (
            <p className="text-sm text-red-600">
              {errors.nextTreatment.message}
            </p>
          )}
        </div>}
        <Button
          type="button"
          onClick={() => setShowRecallDate(!showRecallDate)}
          className="h-10 mx-auto w-[70%]"
        >
          {showRecallDate ? "בחר תאריך לטיפול הבא" : "בחר תאריך לתזכור"}
        </Button>
      </div>

      {/* Second Input: Recall Date */}
      {showRecallDate && (
        <div className="space-y-2">
          <h4
            className={`text-sm font-semibold pb-2 ${
              errors.nextTreatmentRecallDate ? "text-red-500" : ""
            }`}
          >
            בחר תאריך תזכור לתור הבא
          </h4>
          <ToggleGroup
            variant="outline"
            type="single"
            value={recallDateToValue(nextTreatmentRecallDate)}
            onValueChange={(value) => {
              const recallDate = addMonths(
                new Date(),
                parseInt(value)
              )?.toString();
              setValue("nextTreatmentRecallDate", recallDate);
              trigger("nextTreatmentRecallDate");
            }}
            className={`rtl w-full ${
              errors.nextTreatmentRecallDate ? "border-red-500 shadow-sm" : ""
            }`}
            {...register("nextTreatmentRecallDate", {
              validate: (value) => !!value || "שדה חובה",
            })}
          >
            <ToggleGroupItem value="3">3 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="4">4 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="6">6 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="12">12 חודשים</ToggleGroupItem>
          </ToggleGroup>
          {errors.nextTreatmentRecallDate && (
            <p className="text-sm text-red-600">
              {errors.nextTreatmentRecallDate.message}
            </p>
          )}
        </div>
      )}

      {/* Available Times */}
      {!errors.nextTreatment && !showRecallDate && (
        <div className="space-y-2">
          <Label className="text-sm font-semibold">בחר שעה</Label>
          <div className="flex flex-wrap gap-4">
            {AVAILABLE_TIMES.map((time) => (
              <Badge
                key={time}
                className={`rounded-xl h-10 px-4 text-sm cursor-pointer ${
                  selectedTime === time
                    ? "bg-primary"
                    : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
                }`}
                onClick={() => setValue("selectedTime", time)}
              >
                {time}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={!isValid}>
        שמור
      </Button>
    </form>
  );
};
