import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePatients } from "@/store/patients-store";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ClipboardCheckIcon,
  Download,
  Loader2,
  Pencil,
  PlusIcon,
  Trash2,
} from "lucide-react";

import { formatCurrency, getClientTimeZone } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { generateMedicalConditionReport } from "../../../convex/common/generateMedicalInfo";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { WhatsAppButton } from "../WhatsAppButton";

export function PatientData() {
  const { selectedPatient, setSelectedPatient } = usePatients();
  const deleteTreatment = useMutation(api.treatments.deleteOne);
  const accordionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const { openModal } = useModal();
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);

  const fetchedPatient = useQuery(api.patients.getOne, {
    patientId: selectedPatient?._id,
  });

  useEffect(() => {
    if (fetchedPatient) {
      setSelectedPatient(fetchedPatient);
    }
  }, [fetchedPatient]);

  const treatments = useQuery(
    api.treatments.get,
    selectedPatient ? { patientId: selectedPatient._id } : "skip"
  );

  const generatePdf = useAction(api.patients.generatePatientInfo);

  const handleAccordionOpen = useCallback((id: string | null) => {
    if (!id || !accordionRefs.current[id]) return;

    // Wait for the next frame to ensure the DOM is updated
    requestAnimationFrame(() => {
      // Add a small delay to ensure content is expanded
      setTimeout(() => {
        const viewport = document.querySelector(".scroll");
        const itemElement = accordionRefs.current[id];

        if (!(viewport instanceof HTMLDivElement) || !itemElement) return;

        // Get the positions
        const viewportRect = viewport.getBoundingClientRect();
        const itemRect = itemElement.getBoundingClientRect();

        // Calculate the relative position of the item within the viewport
        const relativeTop = itemRect.top - viewportRect.top;

        // Calculate the target scroll position
        // Subtract some padding (e.g., 100px) to show some content above the item
        const targetScroll = viewport.scrollTop + relativeTop - 150;

        // Scroll to the target position
        viewport.scrollTo({
          top: targetScroll,
          behavior: "smooth",
        });
      }, 100);
    });
  }, []);

  const downloadReport = async () => {
    if (!selectedPatient) return;

    setIsDownloadingReport(true); // Start loading
    try {
      const pdfBase64 = await generatePdf({
        patientId: selectedPatient._id,
        userTimeZone: getClientTimeZone(),
      });
      if (!pdfBase64) return;

      const byteCharacters = atob(pdfBase64);
      const byteNumbers = Array.from(byteCharacters, (char) =>
        char.charCodeAt(0)
      );
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${selectedPatient.idNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsDownloadingReport(false); // Stop loading
    }
  };

  if (!selectedPatient) return null;

  return (
    <Dialog
      open={!!selectedPatient}
      onOpenChange={(open) => !open && setSelectedPatient(null)}
    >
      <DialogContent className={`p-4 max-w-3xl h-[85%]`}>
        {isDownloadingReport && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <Loader2 className="h-12 w-12 animate-spin" />
          </div>
        )}

        <DialogHeader className="pb-0 pt-8 pr-4">
          <DialogTitle className="flex justify-between w-full text-2xl">
            <span className="max-w-[50%] text-right">
              פרטי מטופל - {selectedPatient.firstName}
              {selectedPatient.lastName}
            </span>
            <div className="flex justify-end items-center gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  openModal("addOrEditNextTreatment", {
                    selectedPatient,
                  })
                }
                title={
                  selectedPatient.nextTreatment ? "עריכת תור עתידי" : "תור חדש"
                }
                disabled={isDownloadingReport} // Disable while loading
              >
                <ClipboardCheckIcon className="h-4 w-4" />
                <span className="hidden md:block">
                  {selectedPatient.nextTreatment
                    ? "עריכת תור עתידי"
                    : "תור חדש"}
                </span>
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() =>
                  openModal("addOrEditPatient", {
                    patientToEdit: selectedPatient,
                  })
                }
              >
                {/* <EditIcon className="h-4 w-4" /> */}
                <Pencil className="h-4 w-4" />
              </Button>
              {selectedPatient.phone || selectedPatient.parent?.phone ? (
                <WhatsAppButton patient={selectedPatient} />
              ) : null}
              <Button
                variant="outline"
                size="icon"
                onClick={downloadReport}
                title="הורדת דוח"
                disabled={isDownloadingReport} // Disable while loading
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="p-4 text-right h-full overflow-auto scrollbar-rtl scroll">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h1 className="text-xl font-bold">פרטים כלליים</h1>
            <Card className="p-4 mt-4">
              <div className="grid grid-cols-3 gap-4 mobile:grid-cols-2">
                <div>
                  <h4 className="text-sm font-semibold">תעודת זהות</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.idNumber}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">
                    {selectedPatient.isAdult ? "טלפון" : "טלפון ההורה"}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.phone || selectedPatient.parent?.phone}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold">תאריך לידה</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(selectedPatient.dateOfBirth),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>

                <div>
                  <h1 className="text-sm font-semibold">מטופל מתאריך</h1>
                  <p className="text-sm text-muted-foreground">
                    {format(
                      new Date(selectedPatient._creationTime),
                      "dd/MM/yyyy"
                    )}
                  </p>
                </div>

                <div>
                  <h1 className="text-sm font-semibold">מקור הגעה</h1>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.arrivalSource || "-"}
                  </p>
                </div>

                {selectedPatient.nextTreatment && (
                  <div>
                    <h1 className="text-sm font-semibold">הטיפול הבא</h1>
                    <p className="flex text-sm text-muted-foreground break-words">
                      {format(
                        new Date(selectedPatient.nextTreatment.date),
                        "dd/MM/yyyy"
                      )}
                      <div>
                        {selectedPatient.nextTreatment.time && (
                          <span className="mr-1 block">
                            {selectedPatient.nextTreatment.time}
                          </span>
                        )}
                      </div>
                    </p>
                  </div>
                )}

                {selectedPatient.nextTreatmentRecallDate && (
                  <div>
                    <h1 className="text-sm font-semibold">התזכור הבא</h1>
                    <p className="text-sm text-muted-foreground">
                      <div>
                        {format(
                          new Date(
                            selectedPatient.nextTreatmentRecallDate?.toString()
                          ),
                          "dd/MM/yyyy"
                        )}
                      </div>
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="py-6 space-y-6"
          >
            <h4 className="text-xl font-bold ">רקע רפואי</h4>
            <Card className="p-4">
              <div>{generateMedicalConditionReport(selectedPatient)}</div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6 min-h-[250px] mobile:min-h-[300px]"
          >
            <div className="bg-background sticky -top-6 z-40 py-2 flex justify-between">
              <h1 className="text-xl font-bold">היסטוריית טיפולים</h1>
              <Button
                variant="outline"
                onClick={() =>
                  openModal("addOrEditTreatment", {
                    patientId: selectedPatient._id,
                  })
                }
              >
                הוסף טיפול
                <PlusIcon strokeWidth={2} />
              </Button>
            </div>

            <Accordion
              type="single"
              onValueChange={handleAccordionOpen}
              collapsible
              className="w-full"
            >
              {treatments === undefined && (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              {treatments && treatments.length > 0
                ? treatments.map((treatment, i) => (
                    <motion.div
                      key={treatment._id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + i * 0.05 }}
                      ref={(el) => {
                        accordionRefs.current[treatment._id] = el;
                      }}
                    >
                      <AccordionItem
                        value={treatment._id}
                        className="border-b last:border-none"
                      >
                        <AccordionTrigger className="bg-background ">
                          <div className="flex w-full gap-12">
                            <span className="text-sm text-muted-foreground text-right">
                              {format(new Date(treatment.date), "dd/MM/yyyy")}
                            </span>
                            <span className="font-medium mobile:max-w-[10rem] break-words max-w-20rem text-right">
                              {treatment.type}
                            </span>
                          </div>
                        </AccordionTrigger>

                        <AccordionContent>
                          <Card className="p-4 flex flex-col gap-4 relative">
                            <Button
                              size="icon"
                              className="absolute top-2 left-12"
                              variant="outline"
                              onClick={() =>
                                openModal("addOrEditTreatment", {
                                  treatmentToEdit: treatment,
                                  patientId: treatment.patientId,
                                })
                              }
                            >
                              <Pencil strokeWidth={3} />
                            </Button>

                            <div className="col-span-1 break-words">
                              <h4 className="text-sm font-semibold text-right">
                                עלות
                              </h4>
                              <p className="text-sm text-muted-foreground break-words">
                                ₪{formatCurrency(treatment.cost)}
                              </p>
                            </div>

                            <div className="col-span-1 break-words">
                              <h4 className="text-sm font-semibold text-right">
                                תאריך הטיפול
                              </h4>
                              <p className="text-sm text-muted-foreground break-words">
                                {format(
                                  new Date(treatment?.date),
                                  "dd/MM/yyyy"
                                )}
                              </p>
                            </div>

                            <div className="col-span-1 break-words">
                              <h4 className="text-sm font-semibold text-right">
                                תיאור
                              </h4>
                              <p className="text-sm text-muted-foreground break-words">
                                {treatment.description || "-"}
                              </p>
                            </div>

                            {treatment.notes && (
                              <div className="col-span-2 break-words">
                                <h4 className="text-sm font-semibold text-right">
                                  הערות
                                </h4>
                                <p className="text-sm text-muted-foreground break-words">
                                  {treatment.notes}
                                </p>
                              </div>
                            )}

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="absolute top-2 left-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="text-right">
                                    מחיקת טיפול
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="ml-auto text-right">
                                    האם אתה בטוח שברצונך למחוק את הטיפול? פעולה
                                    זו לא ניתנת לביטול.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter className="flex gap-3 mt-4">
                                  <AlertDialogCancel>ביטול</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteTreatment({
                                        treatmentId: treatment._id,
                                      })
                                    }
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    מחק
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))
                : treatments !== undefined && (
                    <div className="text-center text-muted-foreground py-4 h-[200px] grid items-center">
                      <p>אין היסטוריית טיפולים</p>
                    </div>
                  )}
            </Accordion>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
