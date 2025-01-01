import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { addMonths } from "date-fns";
import { FC, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";

type NewTreatmentFormData = {
  nextTreatment: {
    date: string;
    time: string;
  } | null; // Treatment object or null
  nextTreatmentRecallDate: string | null; // Recall date as a string
};

type Props = {
  patient: Doc<"patients">;
};

export const NextTreatmentForm: FC<Props> = ({ patient }) => {
  const updatePatient = useMutation(api.patients.edit);
  const [activeTab, setActiveTab] = useState("nextTreatment");

  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<NewTreatmentFormData>({
    defaultValues: {
      nextTreatment: patient.nextTreatment || null,
      nextTreatmentRecallDate: patient.nextTreatmentRecallDate || null,
    },
    mode: "onChange",
  });

  const nextTreatment = watch("nextTreatment");
  const nextTreatmentRecallDate = watch("nextTreatmentRecallDate");

  const isFormValid =
    (activeTab === "nextTreatment" &&
      nextTreatment?.date &&
      nextTreatment?.time &&
      !errors.nextTreatment) ||
    (activeTab === "nextRecall" &&
      nextTreatmentRecallDate &&
      !errors.nextTreatmentRecallDate);

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setValue("nextTreatment", {
        date: date.toISOString().split("T")[0],
        time: "",
      });
      setValue("nextTreatmentRecallDate", null); // Clear recall date
    } else {
      setValue("nextTreatment", null);
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
    try {
      if (
        activeTab === "nextTreatment" &&
        (!data.nextTreatment?.date || !data.nextTreatment?.time)
      ) {
        toast.error("יש למלא את כל השדות", { position: "bottom-right" });
        return;
      }

      setIsLoading(true);
      await updatePatient({
        ...patient,
        nextTreatment:
          activeTab === "nextTreatment" ? data.nextTreatment : null,
        nextTreatmentRecallDate:
          activeTab === "nextRecall" ? data.nextTreatmentRecallDate : null,
      });

      closeModal();
      const completedText =
        activeTab === "nextTreatment"
          ? "תאריך הטיפול הבא נקבע בהצלחה"
          : "התזכור נוסף בהצלחה";
      toast.success(completedText, { position: "bottom-right" });
      setIsLoading(false);
    } catch (e) {
      toast.error("ארעה שגיעה", {
        position: "bottom-right",
        style: {
          backgroundColor: "#dc2626",
          width: 150,
        },
      });
    } finally {
      setIsLoading(false);
      closeModal();
    }
  };

  return (
    <form
      className="space-y-6 flex flex-col gap-3 justify-between mobile:h-screen"
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
          <div className="flex flex-wrap gap-4">
            {[3, 4, 6, 12].map((months) => {
              const recallDate = addMonths(new Date(), months)
                .toISOString()
                .split("T")[0];

              return (
                <Badge
                  key={months}
                  className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
                    watch("nextTreatmentRecallDate") === recallDate
                      ? "bg-primary"
                      : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
                  }`}
                  onClick={() => {
                    setValue("nextTreatmentRecallDate", recallDate);
                    setValue("nextTreatment", null); // Clear next treatment
                    trigger("nextTreatmentRecallDate");
                  }}
                >
                  {months} חודשים
                </Badge>
              );
            })}
          </div>
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
              initialValue={watch("nextTreatment")?.date}
              placeholder="הכנס תאריך"
              value={nextTreatment?.date || ""}
              className={cn(
                errors.nextTreatment?.date ? "border-red-500 shadow-sm" : ""
              )}
              {...register("nextTreatment.date", {
                required: activeTab === "nextTreatment" && "שדה חובה",
                validate: (value) => {
                  if (activeTab !== "nextTreatment") return true;
                  if (!value) return "שדה חובה";
                  if (new Date(value).getTime() <= new Date().getTime())
                    return "יש לבחור תאריך עתידי";
                  return true;
                },
              })}
              onChange={(date) => handleDateChange(date)}
              onBlur={() => trigger("nextTreatment.date")}
            />
            {errors.nextTreatment?.date && (
              <p className="text-sm text-red-500">
                {errors.nextTreatment.date.message}
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
                    nextTreatment?.time === time
                      ? "bg-primary"
                      : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
                  }`}
                  onClick={() => {
                    if (nextTreatment?.date) {
                      setValue("nextTreatment", {
                        date: nextTreatment.date,
                        time: time,
                      });
                    } else {
                      toast.error("יש לבחור תאריך תחילה", {
                        position: "bottom-right",
                      });
                    }
                  }}
                >
                  {time}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        className="w-full mt-auto"
        disabled={!isFormValid}
        isLoading={isLoading}
        variant="submit"
      >
        {activeTab === "nextTreatment" ? "שמור תאריך לטיפול הבא" : "שמור תזכור"}
      </Button>
    </form>
  );
};
