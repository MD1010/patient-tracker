import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

export function RegistrationForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const { control, handleSubmit, trigger } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      allergies: "",
      medications: "",
      medicalConditions: "",
      lastDentalVisit: "",
      concerns: "",
    },
    mode: "onChange",
  });

  const goToNextStep = async () => {
    const isValid = await trigger(["name", "email", "phone", "dateOfBirth"]);
    if (isValid) setCurrentStep(2);
  };

  const goToPreviousStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = (data: any) => {
    console.log(data);
    toast.success("המטופל נוסף בהצלחה!");
  };

  return (
    <div data-hs-stepper="">
      {/* Stepper Navigation */}
      <ul className="relative flex flex-row gap-x-2">
        {[1, 2].map((step) => (
          <li
            key={step}
            className={`flex items-center gap-x-2 shrink basis-0 flex-1 group ${
              currentStep === step ? "text-indigo-600" : "text-gray-800"
            }`}
          >
            <span
              className={`min-w-7 min-h-7 group inline-flex items-center text-xs align-middle ${
                currentStep >= step
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <span>{step}</span>
            </span>
            <span className="ms-2 text-sm font-medium">
              {step === 1 ? "פרטים אישיים" : "שאלון רפואי"}
            </span>
          </li>
        ))}
      </ul>

      {/* Form Content */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-6">
        {currentStep === 1 && (
          <div data-hs-stepper-content-item='{ "index": 1 }'>
            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <div>
                  <label>שם מלא</label>
                  <Input {...field} />
                </div>
              )}
            />
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <div>
                  <label>דואר אלקטרוני</label>
                  <Input {...field} />
                </div>
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <div>
                  <label>טלפון</label>
                  <Input {...field} />
                </div>
              )}
            />
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <div>
                  <label>תאריך לידה</label>
                  <Input type="date" {...field} />
                </div>
              )}
            />
          </div>
        )}

        {currentStep === 2 && (
          <div data-hs-stepper-content-item='{ "index": 2 }'>
            <Controller
              name="allergies"
              control={control}
              render={({ field }) => (
                <div>
                  <label>אלרגיות</label>
                  <Textarea {...field} />
                </div>
              )}
            />
            <Controller
              name="medications"
              control={control}
              render={({ field }) => (
                <div>
                  <label>תרופות קבועות</label>
                  <Textarea {...field} />
                </div>
              )}
            />
            <Controller
              name="medicalConditions"
              control={control}
              render={({ field }) => (
                <div>
                  <label>מצבים רפואיים</label>
                  <Textarea {...field} />
                </div>
              )}
            />
            <Controller
              name="lastDentalVisit"
              control={control}
              render={({ field }) => (
                <div>
                  <label>ביקור אחרון אצל רופא שיניים</label>
                  <Input type="date" {...field} />
                </div>
              )}
            />
            <Controller
              name="concerns"
              control={control}
              render={({ field }) => (
                <div>
                  <label>תלונות עיקריות / בעיות</label>
                  <Textarea {...field} />
                </div>
              )}
            />
          </div>
        )}

        {/* Buttons */}
        <div className="mt-5 flex justify-between items-center gap-x-2">
          {currentStep === 2 && (
            <Button type="button" onClick={goToPreviousStep}>
              חזרה
            </Button>
          )}
          {currentStep === 1 ? (
            <Button type="button" onClick={goToNextStep}>
              לשאלון רפואי
            </Button>
          ) : (
            <Button type="submit">הוסף</Button>
          )}
        </div>
      </form>
    </div>
  );
}