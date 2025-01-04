import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useUsersStore } from "@/store/user-store";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { addMonths, format } from "date-fns";
import {
  Loader2,
  RotateCw
} from "lucide-react";
import { FC, MouseEventHandler, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";

type NewTreatmentFormData = {
  nextTreatment: {
    date: string;
    time: string;
  } | null;
  nextTreatmentRecallDate: string | null;
};

type Props = {
  patient: Doc<"patients"> & { lastTreatmentDate?: string };
};

const fetchAvailableTimes = async (
  userId: string,
  authToken: string,
  date: string
): Promise<string[]> => {
  // Make a call to your Vercel serverless endpoint:
  // /api/timeslots?userId=...&date=...&startOfDay=...&endOfDay=...&duration=...
  const query = new URLSearchParams({
    userId,
    date,
    startOfDay: "08:00",
    endOfDay: "20:00",
    duration: "45",
  });
  const res = await fetch(
    `http://localhost:3002/api/timeslots?${query.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`, // If needed, or do nothing if your endpoint doesn't require it
      },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch timeslots");
  }
  return res.json(); // returns string[] of free start times
};

export const NextTreatmentForm: FC<Props> = ({ patient }) => {
  const updatePatient = useMutation(api.patients.edit);
  const { closeModal } = useModal();

  const [activeTab, setActiveTab] = useState("nextTreatment");
  const [isLoadingTimes, setIsLoadingTimes] = useState(false);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { activeUser } = useUsersStore();

  // Query Convex to see if we have Google tokens stored for this user

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

  /**
   * If the user does not have a token,
   * we display a "connect" button instead of the rest of the form.
   */

  const hasGoogleToken = !!activeUser?.googleAccessToken;

  /**
   * If the form is valid in either tab, allow submission.
   */
  const isFormValid =
    (activeTab === "nextTreatment" &&
      nextTreatment?.date &&
      nextTreatment?.time &&
      !errors.nextTreatment) ||
    (activeTab === "nextRecall" &&
      nextTreatmentRecallDate &&
      !errors.nextTreatmentRecallDate);

  /**
   * On mount, if there's a future nextTreatment.date,
   * automatically load available times.
   */
  useEffect(() => {
    if (hasGoogleToken && nextTreatment?.date) {
      const dateObj = new Date(nextTreatment.date);
      const now = new Date();
      if (!isNaN(dateObj.getTime()) && dateObj.getTime() > now.getTime()) {
        loadAvailableTimes(nextTreatment.date);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGoogleToken]);

  /**
   * Load available times from our Vercel endpoint
   */
  const loadAvailableTimes = async (dateString: string) => {
    if (!activeUser || !activeUser.authToken) return;

    const { authToken, userId } = activeUser;

    setIsLoadingTimes(true);
    try {
      const times = await fetchAvailableTimes(userId, authToken, dateString);
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
   * Handle date picker change
   */
  const handleDateChange = async (date: Date | undefined) => {
    if (!hasGoogleToken) return; // If no token, do nothing

    // If user cleared the date
    if (!date) {
      setValue("nextTreatment", null);
      setAvailableTimes([]);
      await trigger("nextTreatment.date");
      return;
    }

    if (date.toString() === "Invalid Date") return;

    const stringDate = format(new Date(date), "yyyy-MM-dd");
    console.log(stringDate);

    setValue("nextTreatment.date", stringDate);

    // Validate
    const isValidDate = await trigger("nextTreatment.date");
    if (!isValidDate) {
      // Reset if invalid
      setValue("nextTreatment", null);
      setAvailableTimes([]);
      return;
    }

    // If valid, load times
    setValue("nextTreatment", { date: stringDate, time: "" });
    setValue("nextTreatmentRecallDate", null);
    await loadAvailableTimes(stringDate);
  };

  /**
   * Form submission
   */
  const onSubmit: SubmitHandler<NewTreatmentFormData> = async (data) => {
    try {
      if (
        activeTab === "nextTreatment" &&
        (!data.nextTreatment?.date || !data.nextTreatment?.time)
      ) {
        toast.error("יש למלא את כל השדות", { position: "bottom-right" });
        return;
      }

      const { lastTreatmentDate, ...patientWithOutLastTreatment } = patient;
      setIsLoading(true);
      await updatePatient({
        ...patientWithOutLastTreatment,
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

  const handleConnectGoogleCalendar: MouseEventHandler<HTMLButtonElement> = (
    e
  ) => {
    e.preventDefault();
    if (!activeUser) return;
    // window.open(`http://localhost:3002/api/auth/google/start?usearrId=${userId}`, "_blank")
    // Start your OAuth flow: direct user to your /api/auth/google/start
    window.location.href = `http://localhost:3002/api/auth/google/start?userId=${activeUser.userId}&patientId=${patient._id}`;
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
                    // Clear next treatment
                    setValue("nextTreatment", null);
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
          {hasGoogleToken && (
            <>
              <Label className="text-sm font-semibold text-right">
                בחר תאריך לטיפול הבא
              </Label>
              <div className="space-y-3">
                {/* Date Input with Refresh Icon */}
                <div className="relative">
                  <DateInput
                    dir="rtl"
                    initialValue={nextTreatment?.date}
                    placeholder="הכנס תאריך"
                    value={nextTreatment?.date || ""}
                    className={cn(
                      "relative pl-10", // Add padding to the left for the icon
                      errors.nextTreatment?.date
                        ? "border-red-500 shadow-sm"
                        : ""
                    )}
                    {...register("nextTreatment.date", {
                      required: activeTab === "nextTreatment" && "שדה חובה",
                      validate: (value) => {
                        if (activeTab !== "nextTreatment") return true;
                        if (!value) return "שדה חובה";
                        if (new Date(value).getTime() <= new Date().getTime()) {
                          return "יש לבחור תאריך עתידי";
                        }
                        return true;
                      },
                    })}
                    onChange={handleDateChange}
                    onBlur={() => trigger("nextTreatment.date")}
                  />
                  {/* Refresh Icon */}
                  <Button
                    type="button"
                    variant="link"
                    size="icon"
                    className="absolute left-1 top-1/2 transform -translate-y-1/2"
                    onClick={() => {
                      if (nextTreatment?.date) {
                        loadAvailableTimes(nextTreatment.date);
                      } else {
                        toast.error("יש לבחור תאריך לפני רענון הזמנים");
                      }
                    }}
                    disabled={isLoadingTimes}
                  >
                    <RotateCw
                      className={`h-5 w-5 text-foreground`}
                    />
                  </Button>
                </div>

                {/* Error Message */}
                <div className="h-2">
                  {errors.nextTreatment?.date && (
                    <p className="text-sm text-red-500">
                      {errors.nextTreatment.date.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Available Times Section */}
          <div className="h-64 flex flex-col relative -translate-y-4">
            {!hasGoogleToken ? (
              <div className="mt-8 w-full">
                <Button
                  variant="outline"
                  onClick={handleConnectGoogleCalendar}
                  className="w-full"
                >
                  התחבר ליומן
                </Button>
              </div>
            ) : isLoadingTimes ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : availableTimes.length ? (
              nextTreatment?.date &&
              !errors.nextTreatment?.date && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-right">
                    בחר שעה
                  </Label>
                  <div className="relative">
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
                  </div>
                </div>
              )
            ) : isFormValid &&  (
              <div className="h-full flex flex-col items-center justify-center">
                <div>אין זמן פנוי בתאריך זה</div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Button
        type="submit"
        className="w-full mt-auto"
        disabled={!isFormValid || !hasGoogleToken}
        isLoading={isLoading}
        variant="submit"
      >
        {activeTab === "nextTreatment" ? "שמור תאריך לטיפול הבא" : "שמור תזכור"}
      </Button>
    </form>
  );
};
