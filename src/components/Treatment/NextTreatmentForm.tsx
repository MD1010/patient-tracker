import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DateInput } from "@/components/ui/date-input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, getClientTimeZone } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useUsersStore } from "@/store/user-store";
import { Doc } from "convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { addMonths, format } from "date-fns";
import { Loader2, RotateCw, TrashIcon } from "lucide-react";
import { FC, MouseEventHandler, useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

const VITE_VERCEL_SERVERLESS_API_URL = import.meta.env
  .VITE_VERCEL_SERVERLESS_API_URL;

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
  patientId: string,
  authToken: string,
  date: string,
  userTimeZone: string
): Promise<string[]> => {
  const query = new URLSearchParams({
    patientId,
    userId,
    date,
    startOfDay: "07:00",
    endOfDay: "20:15",
    duration: "45",
    userTimeZone,
  });

  const res = await fetch(
    `${VITE_VERCEL_SERVERLESS_API_URL}/timeslots?${query.toString()}`,
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

const saveTreatmentInCalendar = async ({
  patient,
  userId,
  authToken,
  date,
  time,
}: {
  patient: Doc<"patients"> & { lastTreatmentDate?: string };
  userId: string;
  authToken: string;
  date: string;
  time: string;
}): Promise<string[]> => {
  const body = {
    patientId: patient._id,
    userId,
    date,
    time,
    summary: `טיפול - ${patient.firstName} ${patient.lastName}`,
    description: (patient.phone || patient.parent?.phone)!,
    userTimeZone: getClientTimeZone(),
  };

  const res = await fetch(`${VITE_VERCEL_SERVERLESS_API_URL}/schedule`, {
    method: "POST", // Use POST instead of GET
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error("Failed to schedule or update meeting");
  }

  return res.json();
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
    activeTab === "nextRecall";

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
      const times = await fetchAvailableTimes(
        userId,
        patient._id,
        authToken,
        dateString,
        getClientTimeZone()
      );
      console.log('Received times:', times);
      setAvailableTimes(times);
    } catch (error) {
      toast.error("ארעה שגיאה", {
        position: "bottom-right",
        style: {
          backgroundColor: "#dc2626",
          width: 150,
        },
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
      if (data.nextTreatment && activeUser) {
        await saveTreatmentInCalendar({
          patient,
          userId: activeUser?.userId,
          authToken: activeUser?.authToken,
          date: data.nextTreatment.date,
          time: data.nextTreatment.time,
        });
      }

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
    window.location.href = `${VITE_VERCEL_SERVERLESS_API_URL}/auth/google/start?userId=${activeUser.userId}&patientId=${patient._id}`;
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
              // Generate the recall date and normalize it to YYYY-MM-DD
              const recallDate = addMonths(new Date(), months);
              const normalizedRecallDate = format(recallDate, "yyyy-MM-dd"); // Always use YYYY-MM-DD

              // Get the current recall date and normalize it to YYYY-MM-DD
              const currentRecallDate = watch("nextTreatmentRecallDate")
                ? format(
                    new Date(watch("nextTreatmentRecallDate") || ""),
                    "yyyy-MM-dd"
                  )
                : null;

              return (
                <Badge
                  key={months}
                  className={`rounded-xl h-9 px-4 text-sm cursor-pointer ${
                    currentRecallDate === normalizedRecallDate
                      ? "bg-primary"
                      : "bg-secondary/50 text-primary hover:bg-secondary hover:text-primary"
                  }`}
                  onClick={() => {
                    if (currentRecallDate === normalizedRecallDate) {
                      // Clear the selection if already selected
                      setValue("nextTreatmentRecallDate", null);
                    } else {
                      // Otherwise, set the new recall date
                      setValue("nextTreatmentRecallDate", normalizedRecallDate);
                    }

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
                      if (
                        nextTreatment?.date &&
                        new Date(nextTreatment.date).getTime() <
                          new Date().getTime()
                      ) {
                        toast.error("יש לבחור תאריך שלא חלף", {
                          position: "bottom-right",
                        });
                      } else if (nextTreatment?.date) {
                        loadAvailableTimes(nextTreatment.date);
                      } else {
                        toast.error("יש לבחור תאריך לפני רענון הזמנים", {
                          position: "bottom-right",
                        });
                      }
                    }}
                    disabled={isLoadingTimes}
                  >
                    <RotateCw className={`h-5 w-5 text-foreground`} />
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
          <div className="h-64 flex flex-col relative -translate-y-4 mobile:h-96 se:h-64">
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
                <div className="flex items-start gap-12 h-full">
                  {/* First Column - Time Selection */}
                  <div className="w-[40%] h-full">
                    <Label className="text-sm font-semibold text-right block mb-4">
                      בחר שעה
                    </Label>
                    <div className="relative h-[calc(100%-2rem)] overflow-auto scrollbar-rtl">
                      <div className="flex flex-col gap-2 mr-4">
                        {availableTimes.map((time) => (
                          <Badge
                            key={time}
                            className={`rounded-xl h-10 w-full px-4 cursor-pointer text-center justify-center text-md ${
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

                  {/* Middle Column - Divider with "או" */}
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="h-full w-[1px] bg-border relative">
                      <div className="absolute top-1/2 -translate-y-1/2 translate-x-1/2 bg-background py-2">
                        <span className="text-lg whitespace-nowrap">או</span>
                      </div>
                    </div>
                  </div>

                  {/* Third Column - Manual Input */}
                  <div className="flex-1 justify-center h-full items-center">
                    <Label className="text-sm font-semibold text-right block mb-4">
                      הכנס ידנית
                    </Label>
                    <Input
                      type="time"
                      value={nextTreatment?.time || ""}
                      className="w-full flex-row-reverse text-md"
                      onChange={(e) => {
                        const inputTime = e.target.value;
                        // Store the time as-is, since it's in the user's local timezone
                        setValue("nextTreatment", {
                          ...nextTreatment,
                          time: inputTime,
                        });
                      }}
                    />
                  </div>
                </div>
              )
            ) : (
              isFormValid && (
                <div className="h-full flex flex-col items-center justify-center">
                  <div>אין זמן פנוי בתאריך זה</div>
                </div>
              )
            )}
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-4 w-full mt-auto ">
        {/* Submit Button */}
        <Button
          type="submit"
          className="flex-1"
          disabled={
            !isFormValid ||
            !hasGoogleToken ||
            isLoading ||
            (activeTab === "nextTreatment" && isLoadingTimes)
          }
          isLoading={isLoading}
          variant="submit"
        >
          {activeTab === "nextTreatment"
            ? "שמור תאריך לטיפול הבא"
            : "שמור תזכור"}
        </Button>

        {/* Delete Button */}
        {(activeTab === "nextTreatment" &&
          (!patient.nextTreatment?.date || !patient.nextTreatment?.time)) ||
        activeTab === "nextRecall" ? null : (
          <Button
            disabled={
              isLoading || (activeTab === "nextTreatment" && isLoadingTimes)
            }
            type="button"
            className="text-red-500/80 border-none hover:bg-red-500/90 mobile:p-6"
            variant="outline"
            onClick={handleSubmit(async () => {
              try {
                if (activeTab === "nextTreatment") {
                  // Reset nextTreatment fields
                  await updatePatient({
                    ...patient,
                    nextTreatment: null,
                  });
                  toast.success("תאריך הטיפול הבא בוטל", {
                    position: "bottom-right",
                  });
                }

                // Close the modal after submission
                closeModal();
              } catch (error) {
                console.error("Error deleting treatment or recall:", error);
                toast.error("שגיאה בעת ביטול הטיפול או התזכור", {
                  position: "bottom-right",
                  style: {
                    backgroundColor: "#dc2626",
                    width: 150,
                  },
                });
              }
            })}
          >
            <TrashIcon strokeWidth={2} className="h-4 w-4" />
            {activeTab === "nextTreatment" ? "בטל טיפול הבא" : null}
          </Button>
        )}
      </div>
    </form>
  );
};
