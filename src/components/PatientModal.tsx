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
import { usePatients } from "@/lib/store";
import { useMutation, useQuery } from "convex/react";
import { format } from "date-fns";
import * as Excel from "exceljs";
import { motion } from "framer-motion";
import { Download, Loader2, Trash2 } from "lucide-react";
import { api } from "../../convex/_generated/api";
import { AddTreatmentDialog } from "./AddTreatmentDialog";
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
} from "./ui/alert-dialog";
import { WhatsAppButton } from "./WhatsAppButton";

export function PatientModal() {
  const { selectedPatient, setSelectedPatient } = usePatients();
  const deleteTreatment = useMutation(api.treatments.deleteOne);

  const treatments = useQuery(
    api.treatments.get,
    selectedPatient ? { patientId: selectedPatient._id } : "skip"
  );

  const downloadReport = async () => {
    if (!selectedPatient || !treatments) return;

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet(
      `${selectedPatient.firstName} ${selectedPatient.lastName} - פרטי מטופל`
    );

    worksheet.addRow(["נתוני לקוח"]);
    worksheet.addRow([
      "שם",
      `${selectedPatient.firstName} ${selectedPatient.lastName}`,
    ]);
    worksheet.addRow(["ת.ז", selectedPatient.idNumber]);
    worksheet.addRow(["טלפון", selectedPatient.phone]);
    worksheet.addRow(["תאריך לידה", selectedPatient.dateOfBirth]);
    worksheet.addRow([]);

    worksheet.addRow(["טיפולים"]);
    worksheet.addRow(["תאריך", "סוג", "תיאור", "עלות", "הטיפול הבא"]);
    treatments.forEach((treatment) => {
      worksheet.addRow([
        treatment.date,
        treatment.type,
        treatment.description,
        treatment.cost,
        treatment.nextAppointment || "",
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `פרטי מטופל-${selectedPatient.firstName}_${selectedPatient.lastName}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // const handleDeleteTreatment = async (treatmentId: string) => {
  //   const confirmed = confirm("האם אתה בטוח שברצונך למחוק טיפול זה?");
  //   if (confirmed) {
  //     await deleteTreatment({ treatmentId });
  //   }
  // };

  if (!selectedPatient) return null;

  return (
    <Dialog
      open={!!selectedPatient}
      onOpenChange={(open) => !open && setSelectedPatient(null)}
    >
      <DialogContent className="p-4 max-w-3xl h-[75%]">
        <DialogHeader className="pb-0 pt-8 pr-4">
          <DialogTitle className="flex justify-between w-full text-2xl">
            <span className="">
              פרטי מטופל - {selectedPatient.firstName}{" "}
              {selectedPatient.lastName}
            </span>
            <div className="flex justify-end items-center gap-2">
              <WhatsAppButton
                phone={selectedPatient.phone}
                patientId={selectedPatient._id}
              />
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

        <ScrollArea className="p-4 text-right">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              // className="space-y-6"
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
                    <h4 className="text-sm font-semibold">טלפון</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.phone}
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
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h1 className="text-sm font-semibold">מטופל מתאריך</h1>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        new Date(selectedPatient.createdAt),
                        "dd/MM/yyyy"
                      )}
                    </p>
                  </motion.div>
                </div>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="py-6 space-y-6"
            >
              <h4 className="text-xl font-bold ">עבר רפואי</h4>
              <Card className="p-4">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Porro
                nostrum, aperiam, molestias mollitia harum natus officiis facere
                quod voluptate, ab sed temporibus tempora. Rerum nesciunt in
                veniam nostrum dolore quod.
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Sticky Title */}
              <div className="flex justify-between items-center top-0 bg-background z-20 py-2">
                <AddTreatmentDialog patientId={selectedPatient._id} />
                <h1 className="text-xl font-bold">היסטוריית טיפולים</h1>
              </div>

              {/* Add margin to create space between title and accordion */}

              <Accordion
                type="single"
                collapsible
                  className="w-full overscroll-y-auto"
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
                      >
                        <AccordionItem
                          value={treatment._id}
                          className="border-b last:border-none"
                        >
                          
                          {/* Sticky Accordion Header */}
                          <AccordionTrigger className="sticky top-0 bg-background z-10">
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
                              <div className="col-span-1 break-words">
                                <h4 className="text-sm font-semibold text-right">
                                  עלות
                                </h4>
                                <p className="text-sm text-muted-foreground break-words">
                                  ₪{treatment.cost}
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
                                    variant="secondary"
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
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
