import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { he } from "date-fns/locale";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { validateIsraeliPhone } from "@/lib/validators";
import { differenceInYears, parseISO } from "date-fns";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PersonalDetailsProps {
  form: UseFormReturn<FormData>;
}

export function PersonalDetails({ form }: PersonalDetailsProps) {
  const {
    register,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = form;

  const isAdult =
    watch("dateOfBirth") &&
    differenceInYears(new Date(), parseISO(watch("dateOfBirth"))) >= 18;

  return (
    <div className="space-y-6">
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
          <DatePicker
            fromYear={1901}
            toDate={new Date()}
            date={watch("dateOfBirth")}
            onDateChange={(date) => {
              setValue("dateOfBirth", date!.toString());
              trigger("dateOfBirth");
            }}
            {...register("dateOfBirth", { required: "שדה חובה" })}
            locale={he}
            className={`w-full justify-start text-right ${
              errors.dateOfBirth ? "border-red-500 shadow-sm" : ""
            }`}
          />
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

        {/* ID Number */}
        <div className="space-y-2">
          <Label htmlFor="idNumber">תעודת זהות</Label>
          <Input
            autoComplete="off"
            id="idNumber"
            {...register("idNumber", {
              required: "שדה חובה",
              pattern: { value: /^\d{9}$/, message: "תעודת זהות לא תקינה" },
            })}
            className={errors.idNumber ? "border-red-500 shadow-sm" : ""}
          />
          {errors.idNumber && (
            <p className="text-sm text-red-600">{errors.idNumber.message}</p>
          )}
        </div>

        {/* Phone or Parent's Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            {isAdult || !watch("dateOfBirth") ? "טלפון" : "טלפון ההורה"}
          </Label>
          <Input
            autoComplete="off"
            id={isAdult ? "phone" : "parent.phone"}
            {...register(isAdult ? "phone" : "parent.phone", {
              required: "שדה חובה",
              validate: (value) =>
                validateIsraeliPhone(value!) || "מספר טלפון לא תקין",
            })}
            className={
              errors.phone || errors.parent?.phone
                ? "border-red-500 shadow-sm"
                : ""
            }
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
            <motion.div
              initial={{ x: -30, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -30, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-2"
            >
              <Label htmlFor="parent.name">שם ההורה</Label>
              <Input
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
            </motion.div>
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
