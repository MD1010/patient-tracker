import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { addMonths } from "date-fns";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";
import { recallDateToValue } from "./recallDateToValue";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { useModal } from "@/store/modal-store";
import { toast } from "sonner";

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
  const [activeTab, setActiveTab] = useState("nextTreatment");

  const { closeModal } = useModal();

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
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

  const isFormValid =
    (activeTab === "nextTreatment" &&
      nextTreatment &&
      selectedTime &&
      !errors.nextTreatment &&
      !errors.selectedTime) ||
    (activeTab === "nextRecall" &&
      nextTreatmentRecallDate &&
      !errors.nextTreatmentRecallDate);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setValue("nextTreatment", date.toString());
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

  const AVAILABLE_TIMES = generateTimeSlots(8, 21, 0.75);

  const onSubmit: SubmitHandler<NewTreatmentFormData> = async (data) => {
    setIsLoading(true)
    await updatePatient({
      ...patient,
      nextTreatment: data.nextTreatment,
      nextTreatmentRecallDate: data.nextTreatmentRecallDate,
    });

    closeModal();
    const completedText =
      activeTab === "nextTreatment"
        ? "תאריך הטיפול הבא נקבע בהצלחה"
        : "התזכור נוסף בהצלחה";
    toast.success(completedText, { position: "bottom-right" });
    setIsLoading(false)
  };

  return (
    <form
      className="space-y-6 flex flex-col gap-3"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Tabs
        defaultValue={activeTab}
        className="w-full"
        onValueChange={setActiveTab}
      >
        {/* Tabs Header */}
        <TabsList className="flex justify-center gap-4 rtl">
          <TabsTrigger value="nextTreatment" className="w-1/2 text-center">
            טיפול הבא
          </TabsTrigger>
          <TabsTrigger value="nextRecall" className="w-1/2 text-center">
            תזכור הבא
          </TabsTrigger>
        </TabsList>

        {/* Next Recall Tab */}
        <TabsContent value="nextRecall" className="rtl pt-8 space-y-4">
          <Label className="text-sm font-semibold text-right">
            בחר תאריך תזכור לתור הבא
          </Label>
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
              setValue("nextTreatment", ""); // Clear next treatment
              trigger("nextTreatmentRecallDate");
            }}
            className={`rtl w-full ${
              errors.nextTreatmentRecallDate ? "border-red-500 shadow-sm" : ""
            }`}
            {...register("nextTreatmentRecallDate", {
              required: activeTab === "nextRecall" && "שדה חובה",
            })}
          >
            <ToggleGroupItem value="3">3 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="4">4 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="6">6 חודשים</ToggleGroupItem>
            <ToggleGroupItem value="12">12 חודשים</ToggleGroupItem>
          </ToggleGroup>
          {errors.nextTreatmentRecallDate && (
            <p className="text-sm text-red-500">שדה חובה</p>
          )}
        </TabsContent>

        {/* Next Treatment Tab */}
        <TabsContent value="nextTreatment" className="rtl pt-4 space-y-4">
          <Label className="text-sm font-semibold text-right">
            בחר תאריך לטיפול הבא
          </Label>
          <div className="space-y-3">
            <DateInput
              dir="rtl"
              initialValue={watch("nextTreatment")}
              placeholder="הכנס תאריך"
              value={nextTreatment}
              className={cn(
                errors.nextTreatment ? "border-red-500 shadow-sm" : ""
              )}
              {...register("nextTreatment", {
                required: activeTab === "nextTreatment" && "שדה חובה",
                validate: (value) => {
                  if (value === "Invalid Date") return "תאריך לא תקין";
                  if (
                    activeTab === "nextTreatment" &&
                    new Date(value).getTime() <= new Date().getTime()
                  )
                    return "יש לבחור תאריך עתידי";
                  return true;
                },
              })}
              onChange={handleDateChange}
              onBlur={() => trigger("nextTreatment")}
            />
            {errors.nextTreatment && (
              <p className="text-sm text-red-500">
                {errors.nextTreatment.message}
              </p>
            )}
          </div>

          {/* Available Times */}
          <div className="space-y-2 mt-4">
            <Label className="text-sm font-semibold text-right">בחר שעה</Label>
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
        </TabsContent>
      </Tabs>

      <Button type="submit" className="w-full" disabled={!isFormValid} isLoading={isLoading}>
        {activeTab === "nextTreatment" ? "שמור תאריך לטיפול הבא" : "שמור תזכור"}
      </Button>
    </form>
  );
};
