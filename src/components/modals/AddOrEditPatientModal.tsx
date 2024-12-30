import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assumes you're using a modal component library
import { ModalData, useModal } from "@/store/modal-store";
import { MedicalRegistrationForm } from "../Patient/MedicalRegistrationForm";

export const AddOrEditPatientModal = ({}) => {
  const { isOpen, closeModal, type, data } = useModal();
  const { patientToEdit } = data as ModalData<"addOrEditPatient"> || {};
  

  const isModalOpen = isOpen && type === "addOrEditPatient";
  const formTitle = patientToEdit ? "עריכת מטופל" : "הוספת מטופל";

  return (
    <div className="flex flex-col items-center space-y-4 ">
      {isModalOpen && (
        <Dialog open={isOpen} onOpenChange={closeModal}>
          <DialogContent className='max-w-[38rem] gap-10'>
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
