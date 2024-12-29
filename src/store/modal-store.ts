import { Doc, Id } from "../../convex/_generated/dataModel";
import { create } from "zustand";

// Define a mapping of modal types to their respective data structures
type ModalConfig = {
  addOrEditPatient: { patientToEdit?: Doc<"patients"> };
  addOrEditTreatment: { treatmentToEdit?: Doc<"treatments">, patientId: Id<"patients"> };
  addOrEditNextTreatment: { selectedPatient: Doc<"patients"> };
};

// Derive the modal types and data types from the configuration
export type ModalType = keyof ModalConfig;
export type ModalData<T extends ModalType> = ModalConfig[T];

interface ModalStore {
  type: ModalType | null;
  data: ModalType extends ModalType ? ModalData<ModalType> | null : null;
  isOpen: boolean;
  openModal: <T extends ModalType>(type: T, data: ModalData<T>) => void;
  closeModal: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  isOpen: false,
  data: null,
  openModal: (type, data) => {
    set({
      type,
      isOpen: true,
      data,
    });
  },
  closeModal: () => set({ type: null, isOpen: false, data: null }),
}));