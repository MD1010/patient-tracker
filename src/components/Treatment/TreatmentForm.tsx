import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"; // Assuming you have a toggle group component
import { getClientTimeZone, parseCurrencyInput } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { usePatients } from "@/store/patients-store";
import { useMutation } from "convex/react";
import { addMonths, differenceInMonths } from "date-fns";
import { he } from "date-fns/locale";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";

const recallDateToValue = (recallDate: string | undefined) => {
  if (recallDate) {
    if (+recallDate) return recallDate;

    const monthsDifference = differenceInMonths(recallDate, new Date());
    console.log("hi", monthsDifference + 1);

    return (monthsDifference + 1).toString();
  }
  return undefined;
};

export function TreatmentForm({
  treatment,
  patientId,
  isLastTreatment,
}: {
  treatment?: Doc<"treatments">;
  patientId: Id<"patients">;
  isLastTreatment?: boolean;
}) {
  const addTreatment = useMutation(api.treatments.add);
  const editTreatment = useMutation(api.treatments.edit);

  console.log("isLastTreatment", isLastTreatment);
  

  const { closeModal } = useModal();

  const { setSelectedPatient, selectedPatient } = usePatients();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<Doc<"treatments">>({
    defaultValues: treatment
      ? { ...treatment, recallDate: recallDateToValue(treatment.recallDate) }
      : {
          type: "",
          description: "",
          cost: undefined,
          nextAppointment: "",
          notes: "",
          date: "",
          recallDate: undefined,
        },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<Doc<"treatments">> = async (data) => {
    console.log("sending to server", data);

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
          nextAppointment: data.nextAppointment,
          recallDate: data.recallDate,
          userTimeZone: getClientTimeZone(),
        });
    closeModal();

    if (selectedPatient) {
      setSelectedPatient({
        ...selectedPatient,
        nextTreatmentRecallDate: data.recallDate?.toString() || null,
        nextTreatment: data.nextAppointment?.toString() || null,
      });
    }

    reset();
    let completedText = treatment
      ? "הטיפול עודכן בהצלחה"
      : "הטיפול נוסף בהצלחה, נשלח מייל חדש עם פרטי המטופל.";
    toast.success(completedText, { position: "bottom-right" });
  };

  const isRecallRendered =
    !watch("nextAppointment") && (isLastTreatment || !treatment);

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
                setValue("date", date ? new Date(date).toString() : "");
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
        {(isLastTreatment || !treatment) && (
          <div className="space-y-2">
            <DatePicker
              placeholder="בחר תאריך לטיפול הבא"
              fromYear={new Date().getFullYear()}
              fromDate={new Date()}
              date={watch("nextAppointment")}
              onDateChange={(date) => {
                setValue(
                  "nextAppointment",
                  date ? new Date(date).toString() : undefined
                );
                setValue("recallDate", undefined);
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
        )}
        {isRecallRendered && (
          <div className="space-y-2">
            <h4
              className={`text-sm font-semibold pb-2  ${errors.recallDate && !watch("nextAppointment") ? "text-red-500" : ""}`}
            >
              בחר תאריך תזכור לתור הבא
            </h4>
            <ToggleGroup
              variant="outline"
              type="single"
              value={recallDateToValue(watch("recallDate"))}
              onValueChange={(value) => {
                const recallDate = addMonths(
                  new Date(),
                  parseInt(value)
                )?.toString();
                setValue("recallDate", recallDate);
                trigger("recallDate");

                setValue("nextAppointment", undefined);
                trigger("nextAppointment");
              }}
              className={`rtl w-full ${
                errors.recallDate && !watch("nextAppointment")
                  ? "border-red-500 shadow-sm"
                  : ""
              }`}
              {...register("recallDate", {
                validate: (value) =>
                  !!value || !!watch("nextAppointment") || "שדה חובה",
              })}
            >
              <ToggleGroupItem value="3">3 חודשים</ToggleGroupItem>
              <ToggleGroupItem value="4">4 חודשים</ToggleGroupItem>
              <ToggleGroupItem value="6">6 חודשים</ToggleGroupItem>
              <ToggleGroupItem value="12">12 חודשים</ToggleGroupItem>
            </ToggleGroup>
            {errors.recallDate && !watch("nextAppointment") && (
              <p className="text-sm text-red-600">
                {errors.recallDate.message}
              </p>
            )}
          </div>
        )}

        <Button type="submit" className="w-full">
          שמור
        </Button>
      </form>
    </>
  );
}
