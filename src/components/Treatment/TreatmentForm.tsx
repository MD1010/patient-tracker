import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { parseCurrencyInput } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useMutation } from "convex/react";
import { he } from "date-fns/locale";
import { SubmitHandler, useForm } from "react-hook-form";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { toast } from "sonner";

export function TreatmentForm({
  treatment,
  patientId,
}: {
  treatment?: Doc<"treatments">;
  patientId: Id<"patients">;
}) {
  const addTreatment = useMutation(api.treatments.add);
  const editTreatment = useMutation(api.treatments.edit);

  const { closeModal } = useModal();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<Doc<"treatments">>({
    defaultValues: treatment || {
      type: "",
      description: "",
      cost: undefined,
      nextAppointment: "",
      notes: "",
      date: "",
    },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<Doc<"treatments">> = async (data) => {
    treatment
      ? await editTreatment({
          ...data,
          cost: +parseCurrencyInput(data.cost.toString()),
        })
      : await addTreatment({
          patientId,
          cost: +parseCurrencyInput(data.cost.toString()),
          date: data.date,
          description: data.description,
          type: data.type,
          notes: data.notes,
          nextAppointment: data.nextAppointment || "",
        });
    closeModal();
    reset();
    let completedText = treatment
      ? "הטיפול עודכן בהצלחה"
      : "הטיפול נוסף בהצלחה, נשלח מייל חדש עם פרטי המטופל.";
    toast.success(completedText, { position: "bottom-right" });
  };

  return (
    <>
      <form
        className="space-y-4 flex flex-col gap-3"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-2">
          <Input
            placeholder="סוג הטיפול"
            {...register("type", { required: "שדה חובה" })}
            className={errors.type ? "border-red-500 shadow-sm" : ""}
          />
          {errors.type && (
            <p className="text-sm text-red-600">{errors.type.message}</p>
          )}
        </div>

        <div className="flex gap-4">
          <div className="space-y-2 flex-1">
            <DatePicker
              fromYear={2000}
              toYear={new Date().getFullYear()}
              toDate={new Date()}
              placeholder="תאריך הטיפול"
              date={watch("date")}
              {...register("date", { required: "שדה חובה" })}
              onDateChange={(date) => {
                setValue("date", date ? new Date(date).toISOString() : "");
                trigger("date");
              }}
              locale={he}
              className={`w-full justify-start text-right h-10 p-2 ${
                errors.date ? "border-red-500 shadow-sm" : ""
              }`}
            />
            {errors.date && (
              <p className="text-sm text-red-600">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <CurrencyInput
              placeholder="עלות"
              currencySymbol="₪"
              value={watch("cost")}
              {...register("cost", { required: "שדה חובה" })}
              onChange={(e) => {
                setValue(
                  "cost",
                  e.target.value ? +parseCurrencyInput(e.target.value) : NaN
                );

                trigger("cost");
              }}
              error={!!errors.cost}
              className={errors.cost ? "border-red-500 shadow-sm" : ""}
            />
            {errors.cost && (
              <p className="text-sm text-red-600">{errors.cost.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="תיאור"
            className={errors.description ? "border-red-500 shadow-sm" : ""}
            {...register("description", { required: "שדה חובה" })}
          />
          {errors.description && (
            <p className="text-sm text-red-600">
              {errors.description?.message}
            </p>
          )}
        </div>

        <Textarea placeholder="הערות" {...register("notes")} />

        <div className="space-y-2">
          <DatePicker
            placeholder="בחר תאריך לטיפול הבא"
            fromYear={new Date().getFullYear()}
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
    </>
  );
}
