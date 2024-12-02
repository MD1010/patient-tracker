import { Id } from '../../convex/_generated/dataModel';

export interface Patient {
  _id: Id<'patients'>;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  createdAt: string;
  medicalInfo?: string;
}

export interface Treatment {
  _id: Id<'treatments'>;
  patientId: Id<'patients'>;
  type: string;
  description: string;
  date: string;
  cost: number;
  nextAppointment?: string;
  notes?: string;
  createdAt: string;
}