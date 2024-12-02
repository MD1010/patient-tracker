import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { usePatients } from '@/lib/store';
import { Download } from 'lucide-react';
import * as Excel from 'exceljs';
import { useQuery } from 'convex/react';
import { TreatmentDialog } from './TreatmentDialog';
import { WhatsAppButton } from './WhatsAppButton';
import { api } from '@/convex/_generated/api';


export function PatientModal() {
  const { selectedPatient, setSelectedPatient } = usePatients();

  const treatments = useQuery(
    api.treatments.get,
    selectedPatient ? { patientId: selectedPatient._id } : "skip"
  );

  const downloadReport = async () => {
    if (!selectedPatient || !treatments) return;

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('Patient Report');

    worksheet.addRow(['Patient Information']);
    worksheet.addRow(['Name', selectedPatient.name]);
    worksheet.addRow(['Email', selectedPatient.email]);
    worksheet.addRow(['Phone', selectedPatient.phone]);
    worksheet.addRow(['Date of Birth', selectedPatient.dateOfBirth]);
    worksheet.addRow([]);

    worksheet.addRow(['Treatments']);
    worksheet.addRow(['Date', 'Type', 'Description', 'Cost', 'Next Appointment']);
    treatments.forEach((treatment) => {
      worksheet.addRow([
        treatment.date,
        treatment.type,
        treatment.description,
        treatment.cost,
        treatment.nextAppointment || '',
      ]);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
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
      <DialogContent className="max-w-3xl rtl">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>פרטי מטופל - {selectedPatient.name}</span>
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

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium">דואר אלקטרוני</h4>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.email}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">טלפון</h4>
              <p className="text-sm text-muted-foreground">
                {selectedPatient.phone}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">תאריך לידה</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedPatient.dateOfBirth), 'dd/MM/yyyy')}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium">מטופל מתאריך</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(selectedPatient.createdAt), 'dd/MM/yyyy')}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <TreatmentDialog patientId={selectedPatient._id} />
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="treatments">
              <AccordionTrigger>היסטוריית טיפולים</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {treatments?.map((treatment) => (
                    <div
                      key={treatment._id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{treatment.type}</h4>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(treatment.date), 'dd/MM/yyyy')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {treatment.description}
                      </p>
                      <div className="flex justify-between items-center text-sm">
                        <span>עלות: ₪{treatment.cost}</span>
                        {treatment.nextAppointment && (
                          <span>
                            תור הבא:{' '}
                            {format(
                              new Date(treatment.nextAppointment),
                              'dd/MM/yyyy'
                            )}
                          </span>
                        )}
                      </div>
                      {treatment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">
                          הערות: {treatment.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </DialogContent>
    </Dialog>
  );
}