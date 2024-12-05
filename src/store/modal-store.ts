import { Doc } from "../../convex/_generated/dataModel";
import { create } from "zustand";

export type ModalType = "addOrEditPatient";
type AddOrEditData = { patientToEdit: Doc<"patients"> };
export type ModalData = AddOrEditData;

interface ModalStore {
  type: ModalType | null;
  data?: ModalData | null;
  isOpen: boolean;
  openModal: (type: ModalType, data?: ModalData) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: null,
  openModal: (type: ModalType, data?: ModalData) =>
    set({ type, isOpen: true, data }),
  closeModal: () => set({ type: null, isOpen: false }),
}));
