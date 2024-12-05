import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assumes you're using a modal component library
import { useModal } from "@/store/modal-store";
import { Doc } from "../../../convex/_generated/dataModel";
import { MedicalRegistrationForm } from "../NewPatient/MedicalRegistrationForm";

export const AddOrEditPatientModal = ({
  patient,
}: {
  patient?: Doc<"patients">;
}) => {
  const { isOpen, closeModal, type } = useModal();
  
  const isModalOpen = isOpen && type === "addOrEditPatient";
  const formTitle = patient ? "עריכת מטופל" : "הוספת מטופל";

  return (
    <div className="flex flex-col items-center space-y-4">
      {isModalOpen && (
        <Dialog open={isOpen} onOpenChange={closeModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-right pr-6 mt-4">
                {formTitle}
              </DialogTitle>
              <DialogClose onClick={closeModal} />
            </DialogHeader>
            <MedicalRegistrationForm patient={patient} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
