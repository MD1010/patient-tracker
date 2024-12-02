import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePatientActions } from "@/hooks/use-patient-actions";
import { usePatients } from "@/lib/store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";

export function PatientTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const { patients, isLoading, deletePatient } = usePatientActions();
  const { setSelectedPatient } = usePatients();

  const filteredPatients = patients?.filter((patient) =>
    Object.values(patient).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 justify-end">
        <Input
          placeholder="חיפוש מטופלים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          dir="rtl"
        />

        <Search className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className={cn("rounded-md border", isLoading && "opacity-50")}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">שם</TableHead>
              <TableHead className="text-right">דוא״ל</TableHead>
              <TableHead className="text-right">טלפון</TableHead>
              <TableHead className="text-right">תאריך לידה</TableHead>
              <TableHead className="text-right">נוסף בתאריך</TableHead>
              <TableHead className="text-right">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : filteredPatients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  לא נמצאו מטופלים
                </TableCell>
              </TableRow>
            ) : (
              filteredPatients?.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>{patient.email}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    {format(new Date(patient.createdAt), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPatient(patient)}
                      >
                        הצג פרטים
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>מחיקת מטופל</AlertDialogTitle>
                            <AlertDialogDescription>
                              האם אתה בטוח שברצונך למחוק את המטופל{" "}
                              {patient.name}? פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePatient()}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
