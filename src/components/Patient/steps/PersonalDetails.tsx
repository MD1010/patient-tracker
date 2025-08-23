import { DateInput } from "@/components/ui/date-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { validateIsraeliPhone } from "@/lib/validators";
import { differenceInYears } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";

interface PersonalDetailsProps {
  form: UseFormReturn<FormData>;
}

export function PersonalDetails({ form }: PersonalDetailsProps) {
  const {
    register,
    setValue,
    watch,
    trigger,
    clearErrors,
    formState: { errors },
  } = form;

  const isDateNotSetYet = watch("dateOfBirth") === "Invalid Date";
  const isAdult =
    isDateNotSetYet ||
    (watch("dateOfBirth") &&
      differenceInYears(new Date(), watch("dateOfBirth")) >= 18);

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-6">
        {/* First Name */}
        <div className="space-y-2">
          <Label htmlFor="firstName">שם פרטי</Label>
          <Input
            autoComplete="off"
            id="firstName"
            autoFocus
            {...register("firstName", { required: "שדה חובה" })}
            className={errors.firstName ? "border-red-500 shadow-sm" : ""}
          />
          {errors.firstName && (
            <p className="text-sm text-red-600">{errors.firstName.message}</p>
          )}
        </div>

        {/* Last Name */}
        <div className="space-y-2">
          <Label htmlFor="lastName">שם משפחה</Label>
          <Input
            autoComplete="off"
            id="lastName"
            {...register("lastName", { required: "שדה חובה" })}
            className={errors.lastName ? "border-red-500 shadow-sm" : ""}
          />
          {errors.lastName && (
            <p className="text-sm text-red-600">{errors.lastName.message}</p>
          )}
        </div>

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label>תאריך לידה</Label>

          <DateInput
            dir="rtl"
            id="date"
            initialValue={watch("dateOfBirth")}
            value={watch("dateOfBirth")}
            className={errors.dateOfBirth ? "border-red-500 shadow-sm" : ""}
            {...register("dateOfBirth", {
              required: "שדה חובה",
              validate: (value) => {
                if (value === "Invalid Date" || new Date(value) >= new Date()) {
                  return "תאריך לא תקין";
                }
                return true;
              },
            })}
            onChange={(date) => {
              setValue("dateOfBirth", date?.toString() || "");
              if(date?.toString()){
                trigger("dateOfBirth");  
              }
            }}
            onBlur={() => {
              trigger("dateOfBirth");
            }}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">תעודת זהות</Label>
          <Input
            type="number"
            autoComplete="off"
            id="idNumber"
            {...register("idNumber", {
              required: "שדה חובה",
            })}
            onChange={(e) => {
              setValue("idNumber", e.target.value);
              // Clear any manual errors (like duplicate ID error)
              if (errors.idNumber?.type === "manual") {
                clearErrors("idNumber");
              }
              if (e.target.value) trigger("idNumber");
            }}
            onBlur={() => {
              trigger("idNumber");
            }}
            className={errors.idNumber ? "border-red-500 shadow-sm" : ""}
          />
          {errors.idNumber && (
            <p className="text-sm text-red-600 text-right">{errors.idNumber.message}</p>
          )}
        </div>

        {/* Phone or Parent's Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            {isAdult || !watch("dateOfBirth") ? "טלפון" : "טלפון ההורה"}
          </Label>
          <Input
            value={watch(isAdult ? "phone" : "parent.phone")!}
            type="tel"
            autoComplete="off"
            id={isAdult ? "phone" : "parent.phone"}
            {...register(isAdult ? "phone" : "parent.phone", {
              required: "שדה חובה",
              validate: (value) =>
                validateIsraeliPhone(value!) || "מספר טלפון לא תקין",
            })}
            onChange={(e) => {
              setValue(isAdult ? "phone" : "parent.phone", e.target.value);
              if (validateIsraeliPhone(e.target.value))
                trigger(isAdult ? "phone" : "parent.phone");
            }}
            onBlur={() => {
              trigger(isAdult ? "phone" : "parent.phone");
            }}
            className={cn(
              errors.phone || errors.parent?.phone
                ? "border-red-500 shadow-sm"
                : "",
              "text-right"
            )}
          />
          {(errors.phone || errors.parent?.phone) && (
            <p className="text-sm text-red-600">
              {errors.phone?.message || errors.parent?.phone?.message}
            </p>
          )}
        </div>

        {/* Parent's Name (Animated) */}
        <AnimatePresence>
          {!isAdult && watch("dateOfBirth") && (
            <div className="space-y-2">
              <Label htmlFor="parent.name">שם ההורה</Label>
              <Input
                value={watch("parent.name")}
                autoComplete="off"
                id="parent.name"
                {...register("parent.name", { required: "שדה חובה" })}
                className={
                  errors.parent?.name ? "border-red-500 shadow-sm" : ""
                }
              />
              {errors.parent?.name && (
                <p className="text-sm text-red-600">
                  {errors.parent.name.message}
                </p>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Arrival Source */}
        <div
          className={cn(
            "space-y-2 w-full",
            !isAdult && watch("dateOfBirth") ? "col-span-2" : "col-span-1"
          )}
        >
          <Label htmlFor="arrivalSource">מקור הגעה</Label>
          <Input
            autoComplete="off"
            id="arrivalSource"
            {...register("arrivalSource")}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
