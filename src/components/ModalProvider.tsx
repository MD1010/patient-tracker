import { useEffect, useState } from "react";
import { AddOrEditPatientModal } from "./modals/AddOrEditPatientModal";
import { AddOrEditTreatmentModal } from './modals/AddOrEditTreatmentModal';

export const ModalProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <AddOrEditPatientModal />
      <AddOrEditTreatmentModal />
    </>
  );
};
