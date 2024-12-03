import { UseFormReturn } from "react-hook-form";
import { FormData } from "../MedicalRegistrationForm";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { NumericOTPInput } from "@/components/ui/numeric-otp-input";
import { validateIsraeliPhone } from "@/lib/validators";
import { useOutsideClick } from "rooks";
import { useRef } from "react";

interface PersonalDetailsProps {
  form: UseFormReturn<FormData>;
}

export function PersonalDetails({ form }: PersonalDetailsProps) {
  const {
    register,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = form;

  const phoneInputRef = useRef(null);

  useOutsideClick(phoneInputRef, () => {
    // Trigger validation when clicking outside

    if (!validateIsraeliPhone(watch("phone"))) {
      setError("phone", { message: "מספר טלפון לא תקין" });
    }
  });
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
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

        <div className="space-y-2">
          <Label>תאריך לידה</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-right ${
                  errors.dateOfBirth ? "border-red-500 shadow-sm" : ""
                }`}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {watch("dateOfBirth") ? (
                  format(watch("dateOfBirth")!, "PP", { locale: he })
                ) : (
                  <span>בחר תאריך</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("dateOfBirth")}
                onSelect={(date) => setValue("dateOfBirth", date)}
                locale={he}
              />
            </PopoverContent>
          </Popover>
          {errors.dateOfBirth && (
            <p className="text-sm text-red-600">{errors.dateOfBirth.message}</p>
          )}
        </div>

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
      </div>
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <div ref={phoneInputRef}>
            <NumericOTPInput
              isPhoneNumber
              value={watch("phone") || ""}
              error={!!errors.phone}
              {...register("phone", { required: "שדה חובה" })}
              onChange={(value) => {
                setValue("phone", value);
              }}
            />
          </div>
          {errors.phone && (
            <p className="text-sm text-red-600">{errors.phone.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>תאריך טיפול אחרון</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={`w-full justify-start text-right ${
                  errors.lastTreatmentDate ? "border-red-500 shadow-sm" : ""
                }`}
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {watch("lastTreatmentDate") ? (
                  format(watch("lastTreatmentDate")!, "PP", { locale: he })
                ) : (
                  <span>בחר תאריך</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch("lastTreatmentDate")}
                onSelect={(date) => setValue("lastTreatmentDate", date)}
                locale={he}
              />
            </PopoverContent>
          </Popover>
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