import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "node_modules/convex/dist/esm-types/values/value";
import { toast } from "sonner";

export interface Patient {
  _id: Id<"patients">;

  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export function usePatientActions() {
  const fetchedPatients = useQuery(api.patients.get);
  
  const deletePatientMutation = useMutation(api.patients.deleteOne);

  const deletePatient = async (patientId: Id<"patients">) => {
    try {
      await deletePatientMutation({ patientId });
      toast.success("המטופל נמחק בהצלחה", { position: "bottom-right" });
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  return {
    patients: fetchedPatients,
    isLoading: fetchedPatients === undefined,
    deletePatient,
  };
}
