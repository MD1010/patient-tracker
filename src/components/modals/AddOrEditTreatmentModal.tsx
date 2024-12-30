import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalData, useModal } from "@/store/modal-store";
import { TreatmentForm } from "../Treatment/TreatmentForm";

export const AddOrEditTreatmentModal = ({}) => {
  const { isOpen, closeModal, type, data } = useModal();
  const { treatmentToEdit, patientId } =
    (data as ModalData<"addOrEditTreatment">) || {};

  const isModalOpen = isOpen && type === "addOrEditTreatment";
  const formTitle = treatmentToEdit ? "עריכת טיפול" : "הוספת טיפול";

  return (
    <div className="flex flex-col items-center space-y-4">
      {isModalOpen && (
        <Dialog open={isOpen} onOpenChange={closeModal}>
          <DialogContent className='max-w-lg flex flex-col '>
            <DialogHeader>
              <DialogTitle className="text-right p-4 px-0">
                {formTitle}
              </DialogTitle>
              <DialogClose onClick={closeModal} />
            </DialogHeader>
            <TreatmentForm treatment={treatmentToEdit} patientId={patientId}/>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
