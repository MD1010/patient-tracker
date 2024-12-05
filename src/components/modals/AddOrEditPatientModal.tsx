import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assumes you're using a modal component library
import { useModal } from "@/store/modal-store";
import { MedicalRegistrationForm } from "../NewPatient/MedicalRegistrationForm";

export const AddOrEditPatientModal = ({}) => {
  const { isOpen, closeModal, type, data } = useModal();
  const { patientToEdit } = data || {};

  const isModalOpen = isOpen && type === "addOrEditPatient";
  const formTitle = patientToEdit ? "עריכת מטופל" : "הוספת מטופל";

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
            <MedicalRegistrationForm patient={patientToEdit} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
