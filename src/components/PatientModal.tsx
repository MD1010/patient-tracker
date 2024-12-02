import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { usePatients } from "@/lib/store";
import { Download } from "lucide-react";
import * as Excel from "exceljs";
import { useQuery } from "convex/react";
import { TreatmentDialog } from "./TreatmentDialog";
import { WhatsAppButton } from "./WhatsAppButton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { api } from "../../convex/_generated/api";

export function PatientModal() {
  const { selectedPatient, setSelectedPatient } = usePatients();

  const treatments = useQuery(
    api.treatments.get,
    selectedPatient ? { patientId: selectedPatient._id } : "skip"
  );

  const downloadReport = async () => {
    if (!selectedPatient || !treatments) return;

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet("Patient Report");

    worksheet.addRow(["Patient Information"]);
    worksheet.addRow(["Name", selectedPatient.name]);
    worksheet.addRow(["Email", selectedPatient.email]);
    worksheet.addRow(["Phone", selectedPatient.phone]);
    worksheet.addRow(["Date of Birth", selectedPatient.dateOfBirth]);
    worksheet.addRow([]);

    worksheet.addRow(["Treatments"]);
    worksheet.addRow([
      "Date",
      "Type",
      "Description",
      "Cost",
      "Next Appointment",
    ]);
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
    a.download = `patient-${selectedPatient._id}-report.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!selectedPatient) return null;

  return (
    <Dialog
      open={!!selectedPatient}
      onOpenChange={(open) => !open && setSelectedPatient(null)}
    >
      <DialogContent className="max-w-3xl rtl max-h-[90vh] p-0">
        <DialogHeader className="p-6 ml-8 pb-0">
          <DialogTitle className="flex justify-between items-center text-2xl">
            <span className="m-auto">פרטי מטופל - {selectedPatient.name}</span>
            <div className="flex items-center gap-2">
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

        <ScrollArea className="p-6 text-right">
          <div className="space-y-6">
            {/* Patient Details */}
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold">דואר אלקטרוני</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedPatient.email}
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
                <div>
                  <h4 className="text-sm font-semibold">מטופל מתאריך</h4>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedPatient.createdAt), "dd/MM/yyyy")}
                  </p>
                </div>
              </div>
            </Card>

            {/* Treatment History Section */}
            <ScrollArea className="max-h-[400px] overflow-y-auto">
              <h1 className="font-bold p-2 py-4">היסטוריית טיפולים</h1>
              <Accordion type="single" collapsible className="w-full">
                {treatments && treatments.length > 0 ? (
                  treatments.map((treatment) => (
                    <AccordionItem
                      key={treatment._id}
                      value={treatment._id}
                      className="border-b last:border-none"
                    >
                      <AccordionTrigger className="p-2 py-4 flex justify-between">
                        <div className="flex w-full gap-10 justify-end">
                          <span className="font-medium">{treatment.type}</span>
                          <span className="text-sm text-muted-foreground text-right">
                            {format(new Date(treatment.date), "dd/MM/yyyy")}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card className="p-4 grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-semibold">תיאור</h4>
                            <p className="text-sm text-muted-foreground">
                              {treatment.description || "N/A"}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold">עלות</h4>
                            <p className="text-sm text-muted-foreground">
                              ₪{treatment.cost}
                            </p>
                          </div>
                          <div>
                            {treatment.nextAppointment && (
                              <>
                                <h4 className="text-sm font-semibold">
                                  תור הבא
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {format(
                                    new Date(treatment.nextAppointment),
                                    "dd/MM/yyyy"
                                  )}
                                </p>
                              </>
                            )}
                          </div>
                          {treatment.notes && (
                            <div>
                              <h4 className="text-sm font-semibold">הערות</h4>
                              <p className="text-sm text-muted-foreground">
                                {treatment.notes}
                              </p>
                            </div>
                          )}
                        </Card>
                      </AccordionContent>
                    </AccordionItem>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    אין היסטוריית טיפולים
                  </p>
                )}
              </Accordion>
            </ScrollArea>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
