import { useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { usePatients } from '@/lib/store';
import { format } from 'date-fns';
import { useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Loader2 } from 'lucide-react';

export function PatientList() {
  const { setPatients, setSelectedPatient, patients } = usePatients();
  const fetchedPatients = useQuery(api.patients.get);

  useEffect(() => {
    if (fetchedPatients) {
      setPatients(fetchedPatients);
    }
  }, [fetchedPatients, setPatients]);

  if (fetchedPatients === undefined) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!Array.isArray(patients) || patients.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">לא נמצאו מטופלים</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>שם</TableHead>
            <TableHead>דוא״ל</TableHead>
            <TableHead>טלפון</TableHead>
            <TableHead>תאריך לידה</TableHead>
            <TableHead>פעולות</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient._id}>
              <TableCell>{patient.name}</TableCell>
              <TableCell>{patient.email}</TableCell>
              <TableCell>{patient.phone}</TableCell>
              <TableCell>
                {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedPatient(patient)}
                >
                  הצג פרטים
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}