import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { he } from "date-fns/locale";
import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { validateIsraeliPhone } from "@/lib/validators";

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
              setValue("dateOfBirth", date!.toISOString());
              trigger("dateOfBirth")
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

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            autoComplete="off"
            id="phone"
            {...register("phone", {
              required: "שדה חובה",
              validate: (value) =>
                validateIsraeliPhone(value) || "מספר טלפון לא תקין",
            })}
            className={errors.phone ? "border-red-500 shadow-sm" : ""}
          />
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        {/* Last Treatment Date */}
        <div className="space-y-2">
          <Label>תאריך טיפול אחרון</Label>
          <DatePicker
            fromYear={2000}
            toDate={new Date()}
            date={watch("lastTreatmentDate")}
            onDateChange={(date) => {
              setValue("lastTreatmentDate", date!.toISOString());
            }}
            locale={he}
            className={`w-full justify-start text-right ${
              errors.lastTreatmentDate ? "border-red-500 shadow-sm" : ""
            }`}
          />
          {errors.lastTreatmentDate && (
            <p className="text-sm text-red-600">
              {errors.lastTreatmentDate.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}