import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { Doc } from "convex/_generated/dataModel";
import { useMutation, useQueries, useQuery } from "convex/react";
import { addMonths } from "date-fns";
import { Loader2 } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";
import { useAuth, useClerk, useUser } from "@clerk/clerk-react";

type NewTreatmentFormData = {
  nextTreatment: {
    date: string;
    time: string;
  } | null;
  nextTreatmentRecallDate: string | null;
};

type Props = {
  patient: Doc<"patients">;
};

const fetchAvailableTimes = async (
  userId: string,
  authToken: string,
  date: string
): Promise<string[]> => {
  // Simulating API call with 1 second delay
  // await new Promise((resolve) => setTimeout(resolve, 1000));
  // // Generate dummy data - 20 time slots (4 rows of 5 slots)
  // const times = [];
  // for (let hour = 8; hour <= 17; hour++) {
  //   times.push(`${hour.toString().padStart(2, "0")}:00`);
  //   if (hour !== 17) times.push(`${hour.toString().padStart(2, "0")}:30`);
  // }
  // return times.slice(0, 20); // Return exactly 20 slots
  const query = new URLSearchParams({
    userId,
    date,
    startOfDay: "08:00",
    endOfDay: "20:00",
    duration: "45",
  });
  const res = await fetch(`/api/timeslots?${query.toString()}`);
  if (!res.ok) {
    throw new Error("Failed to fetch timeslots");
  }
  return res.json(); // returns string[] of free start times
};

export const NextTreatmentForm: FC<Props> = ({ patient }) => {
  const updatePatient = useMutation(api.patients.edit);
  const [activeTab, setActiveTab] = useState("nextTreatment");
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const { closeModal } = useModal();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { userId, getToken } = useAuth();
  // const userGoogleToken = useQuery(api.auth.getGoogleTokens, { userId });

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
    mode: "onBlur",
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

  useEffect(() => {
    if (nextTreatment?.date) {
      const dateObj = new Date(nextTreatment.date);
      const now = new Date();
      // if the date is valid and in the future, fetch times
      if (!isNaN(dateObj.getTime()) && dateObj.getTime() > now.getTime()) {
        loadAvailableTimes(nextTreatment.date);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  const loadAvailableTimes = async (dateString: string) => {
    const token = await getToken();
    if (!userId || !token) return;
    setIsLoadingTimes(true);
    try {
      const times = await fetchAvailableTimes(userId, token, dateString);
      setAvailableTimes(times);
    } catch (error) {
      toast.error("Failed to load available times", {
        position: "bottom-right",
      });
      setAvailableTimes([]);
    } finally {
      setIsLoadingTimes(false);
    }
  };

  /**
   * Fix: handleDateChange sets form values first, then triggers validation.
   * If invalid, we reset. If valid, we fetch times.
   */
  const handleDateChange = async (date: Date | undefined) => {
    // If user cleared the date picker
    if (!date) {
      // setValue("nextTreatment.date", "");
      setValue("nextTreatment", null);
      setAvailableTimes([]);
      // Trigger validation so errors can show up if needed
      await trigger("nextTreatment.date");
      return;
    }

    // Format and set the date in the form
    const isoDate = date.toISOString().split("T")[0];
    setValue("nextTreatment.date", isoDate);

    // Trigger validation to see if it's valid
    const isValidDate = await trigger("nextTreatment.date");
    if (!isValidDate) {
      // If invalid (past date or other error), reset
      setValue("nextTreatment", null);
      setAvailableTimes([]);
      return;
    }

    // If valid, finalize nextTreatment and fetch times
    setValue("nextTreatment", { date: isoDate, time: "" });
    setValue("nextTreatmentRecallDate", null); // Clear recall date
    await loadAvailableTimes(isoDate);
  };

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
              initialValue={nextTreatment?.date}
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
              onChange={handleDateChange}
              onBlur={() => trigger("nextTreatment.date")}
            />
            {errors.nextTreatment?.date && (
              <p className="text-sm text-red-500">
                {errors.nextTreatment.date.message}
              </p>
            )}
          </div>

          {/* Available Times Section */}

          {nextTreatment?.date && !errors.nextTreatment?.date && (
            <div className="space-y-2 mt-4">
              <Label className="text-sm font-semibold text-right">
                בחר שעה
              </Label>
              <div className="h-64 relative">
                {isLoadingTimes ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {availableTimes.map((time) => (
                      <Badge
                        key={time}
                        className={`rounded-xl h-10 px-4 text-sm cursor-pointer ${
                          nextTreatment?.time === time
                            ? "bg-primary"
                            : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
                        }`}
                        onClick={() =>
                          setValue("nextTreatment", {
                            date: nextTreatment.date,
                            time,
                          })
                        }
                      >
                        {time}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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
