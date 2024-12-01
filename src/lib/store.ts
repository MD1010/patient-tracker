import { create } from 'zustand';
import type { Patient } from './types';

interface PatientsState {
  patients: Patient[];
  selectedPatient: Patient | null;
  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
}

export const usePatients = create<PatientsState>((set) => ({
  patients: [],
  selectedPatient: null,
  setPatients: (patients) => set({ patients: Array.isArray(patients) ? patients : [] }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
}));