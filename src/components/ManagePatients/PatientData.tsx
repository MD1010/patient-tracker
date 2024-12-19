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
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePatients } from "@/store/patients-store";
import { useAction, useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import * as Excel from "exceljs";
import { motion } from "framer-motion";
import { Download, Loader2, Pencil, Trash2 } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { useCallback, useRef } from "react";
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
        const viewport = document.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
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
    if (!selectedPatient) return null;

    const pdfBase64 = await generatePdf({ patientId: selectedPatient?._id });
    if (!pdfBase64) return;

    const byteCharacters = atob(pdfBase64);
    const byteNumbers = Array.from(byteCharacters, (char) =>
      char.charCodeAt(0)
    );
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: "application/pdf" });

    // Create a temporary link element
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedPatient.idNumber}.pdf`;

    // Append the link to the document, trigger the download, and remove the link
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!selectedPatient) return null;

  return (
    <Dialog
      open={!!selectedPatient}
      onOpenChange={(open) => !open && setSelectedPatient(null)}
    >
      <DialogContent className="p-4 max-w-3xl h-[85%]">
        <DialogHeader className="pb-0 pt-8 pr-4">
          <DialogTitle className="flex justify-between w-full text-2xl">
            <span className="">
              פרטי מטופל - {selectedPatient.firstName}{" "}
              {selectedPatient.lastName}
            </span>
            <div className="flex justify-end items-center gap-2">
              {selectedPatient.phone || selectedPatient.parent?.phone ? (
                <WhatsAppButton
                  phone={
                    (selectedPatient.phone || selectedPatient.parent?.phone)!
                  }
                  patientId={selectedPatient._id}
                />
              ) : null}
              <Button
                variant="outline"
                size="icon"
                onClick={downloadReport}
                title="הורדת דוח"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="p-4 text-right h-full">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <h1 className="text-xl font-bold">פרטים כלליים</h1>
            <Card className="p-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div dir="rtl">
                {generateMedicalConditionReport(selectedPatient)}
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6 min-h-[250px]"
          >
            <div className="bg-background sticky -top-2 z-40 py-2">
              <h1 className="text-xl font-bold">היסטוריית טיפולים</h1>
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
                ? treatments
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((treatment, i) => (
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
                          <AccordionTrigger className="sticky top-10 bg-background z-20">
                            <div className="flex w-full gap-12 justify-end">
                              <span className="font-medium">
                                {treatment.type}
                              </span>
                              <span className="text-sm text-muted-foreground text-right">
                                {format(new Date(treatment.date), "dd/MM/yyyy")}
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

                              {treatment?.nextAppointment && (
                                <div className="col-span-2 break-words">
                                  <h4 className="text-sm font-semibold text-right">
                                    תור הבא
                                  </h4>
                                  <p className="text-sm text-muted-foreground break-words">
                                    {format(
                                      new Date(treatment?.nextAppointment),
                                      "dd/MM/yyyy"
                                    )}
                                  </p>
                                </div>
                              )}

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
                                      האם אתה בטוח שברצונך למחוק את הטיפול?
                                      פעולה זו לא ניתנת לביטול.
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
