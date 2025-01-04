import { Button } from "@/components/ui/button";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getClientTimeZone, parseCurrencyInput } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useMutation } from "convex/react";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Doc, Id } from "../../../convex/_generated/dataModel";
import { DateInput } from "../ui/date-input";

export function TreatmentForm({
  treatment,
  patientId,
}: {
  treatment?: Doc<"treatments">;
  patientId: Id<"patients">;
}) {
  const addTreatment = useMutation(api.treatments.add);
  const editTreatment = useMutation(api.treatments.edit);

  const [isLoading, setIsLoading] = useState(false);

  const { closeModal } = useModal();

  // const { setSelectedPatient, selectedPatient } = usePatients();

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
      ? treatment
      : {
          type: "",
          description: "",
          cost: undefined,
          notes: "",
          date: "",
        },
    mode: "onChange",
  });

  const onSubmit: SubmitHandler<Doc<"treatments">> = async (data) => {
    try {
      setIsLoading(true);
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
            userTimeZone: getClientTimeZone(),
          });
      closeModal();
      reset();
      let completedText = treatment
        ? "הטיפול עודכן בהצלחה"
        : "הטיפול נוסף בהצלחה, נשלח מייל חדש עם פרטי המטופל.";
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
    <>
      <form
        className="space-y-8 flex flex-col h-full"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="h-full space-y-4 mobile:space-y-8">
          <div className="space-y-2 flex-1">
            <Input
              autoComplete="off"
              placeholder="סוג הטיפול"
              {...register("type", { required: "שדה חובה" })}
              className={errors.type ? "border-red-500 shadow-sm" : ""}
            />
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
          <div className="flex gap-4 mobile:gap-8 mobile:flex-col">
            <div className="space-y-2 flex-1">
              <DateInput
                placeholder="תאריך הטיפול"
                dir="rtl"
                id="date"
                initialValue={watch("date")}
                value={watch("date")}
                className={errors.date ? "border-red-500 shadow-sm" : ""}
                {...register("date", {
                  required: "שדה חובה",
                  validate: (value: string | undefined) => {
                    return value !== "Invalid Date" || "תאריך הטיפול לא תקין";
                  },
                })}
                onChange={(date) => {
                  setValue("date", date?.toString() || "");
                }}
                onBlur={() => {
                  trigger("date");
                }}
              />
              {errors.date && (
                <p className="text-sm text-red-600">{errors.date.message}</p>
              )}
            </div>
            {/* </div> */}
            <div className="relative">
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

          <div className="space-y-2 flex-1">
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
        </div>
        <Button
          type="submit"
          className="w-full mt-auto"
          isLoading={isLoading}
          variant="submit"
        >
          שמור
        </Button>
      </form>
    </>
  );
}
