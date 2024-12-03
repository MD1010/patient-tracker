import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Id } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { he } from "date-fns/locale";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../convex/_generated/api";
import { DatePicker } from "./ui/date-picker";

interface FormInputs {
  type: string;
  description: string;
  cost: string;
  nextAppointment: string | undefined;
  notes: string;
}

export function AddTreatmentDialog({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const addTreatment = useMutation(api.treatments.add);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      type: "",
      description: "",
      cost: "",
      nextAppointment: "",
      notes: "",
    },
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    await addTreatment({
      patientId,
      cost: +data.cost,
      date: new Date().toISOString(),
      description: data.description,
      type: data.type,
      notes: data.notes,
      nextAppointment: data.nextAppointment || "",
    });
    setIsOpen(false);
    reset();
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        הוסף טיפול
      </Button>
      <Dialog open={isOpen} onOpenChange={() => {
        reset();
        setIsOpen(!isOpen)
      }}>
        <DialogContent className="max-w-lg px-12 pt-6">
          <DialogHeader>
            <DialogTitle className="text-right text-xl p-2">
              הוסף טיפול
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 flex flex-col gap-3"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="space-y-2">
              <Input
                placeholder="סוג"
                {...register("type", { required: "שדה חובה" })}
                className={errors.type ? "border-red-500 shadow-sm" : ""}
              />
              {errors.type && (
                <p className="text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            <Textarea placeholder="תיאור" {...register("description")} />

            <Textarea placeholder="הערות" {...register("notes")} />

            <div className="space-y-2">
              <Input
                type="number"
                placeholder="עלות"
                {...register("cost", {
                  required: "שדה חובה",
                  validate: (value) => parseFloat(value) > 0 || "עלות לא תקינה",
                })}
                className={errors.cost ? "border-red-500 shadow-sm" : ""}
              />
              {errors.cost && (
                <p className="text-sm text-red-600">{errors.cost.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <DatePicker
                fromDate={new Date()}
                date={watch("nextAppointment")}
                onDateChange={(date) => {
                  setValue(
                    "nextAppointment",
                    date ? new Date(date).toISOString() : undefined
                  );
                }}
                locale={he}
                className={`w-full justify-start text-right h-10 p-2 ${
                  errors.nextAppointment ? "border-red-500 shadow-sm" : ""
                }`}
              />
              {errors.nextAppointment && (
                <p className="text-sm text-red-600">
                  {errors.nextAppointment.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              שמור
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
