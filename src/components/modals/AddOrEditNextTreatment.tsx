import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ModalData, useModal } from "@/store/modal-store";
import { NextTreatmentForm } from "../Treatment/NextTreatmentForm";

export const AddOrEditNextTreatment = ({}) => {
  const { isOpen, closeModal, type, data } = useModal();
  const { selectedPatient } =
    (data as ModalData<"addOrEditNextTreatment">) || {};

  const isModalOpen = isOpen && type === "addOrEditNextTreatment";
  const formTitle = selectedPatient?.nextTreatment ? "עריכת מועד הטיפול הבא" : "קביעת מועד הטיפול הבא";

  return (
    <div className="flex flex-col items-center space-y-4">
      {isModalOpen && (
        <Dialog open={isOpen} onOpenChange={closeModal}>
          <DialogContent className="max-w-xl mobile:max-w-full">
            <DialogHeader>
              <DialogTitle className="text-right p-4 px-0">
                {formTitle}
              </DialogTitle>
              <DialogClose onClick={closeModal} />
            </DialogHeader>
            <NextTreatmentForm patient={selectedPatient} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
