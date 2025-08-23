import { api } from "../../convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Id } from "node_modules/convex/dist/esm-types/values/value";
import { toast } from "sonner";
import { useState, useMemo } from "react";

export interface Patient {
  _id: Id<"patients">;

  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
}

export function usePatientActions(searchQuery?: string) {
  const fetchedPatients = useQuery(api.patients.get, { searchQuery });
  const [displayedCount, setDisplayedCount] = useState(25);

  const deletePatientMutation = useMutation(api.patients.deleteOne);

  const deletePatient = async (patientId: Id<"patients">) => {
    try {
      await deletePatientMutation({ patientId });
      toast.success("המטופל נמחק בהצלחה", { position: "bottom-right" });
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  // Client-side pagination - now working on already filtered results from backend
  const patients = useMemo(() => {
    if (!fetchedPatients) return undefined;
    return fetchedPatients.slice(0, displayedCount);
  }, [fetchedPatients, displayedCount]);

  const loadMore = (count: number = 25) => {
    setDisplayedCount(prev => prev + count);
  };

  const canLoadMore = useMemo(() => {
    if (!fetchedPatients) return false;
    return displayedCount < fetchedPatients.length;
  }, [fetchedPatients, displayedCount]);

  // Reset displayed count when search query changes
  useMemo(() => {
    setDisplayedCount(25);
  }, [searchQuery]);

  return {
    patients,
    isLoading: fetchedPatients === undefined,
    loadMore,
    canLoadMore,
    deletePatient,
    totalCount: fetchedPatients?.length || 0,
  };
}
