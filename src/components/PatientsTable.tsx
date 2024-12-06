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
import { usePatients } from "@/store/patients-store";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { EditIcon, Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import { useModal } from "@/store/modal-store";
import { Badge } from "./ui/badge";

export function PatientTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { patients, isLoading, deletePatient } = usePatientActions();
  const { setSelectedPatient } = usePatients();
  const { openModal } = useModal();

  // Search functionality
  const filteredPatients = patients?.filter((patient) =>
    Object.values(patient).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
  );

  const sortedPatients = filteredPatients?.slice().sort((a, b) => {
    if (!sortColumn) return 0;

    const getValue = (patient: any, column: string) => {
      if (column === "name") {
        return `${patient.firstName} ${patient.lastName}`.toLowerCase();
      }
      return patient[column] ?? "";
    };

    const aValue = getValue(a, sortColumn);
    const bValue = getValue(b, sortColumn);

    // Handle null or undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return sortDirection === "asc" ? 1 : -1;
    if (bValue == null) return sortDirection === "asc" ? -1 : 1;

    // String sorting
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Date sorting
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Number sorting
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Default: treat values as strings
    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue));
  });
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <Input
          startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          placeholder="חיפוש מטופלים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-sm"
          dir="rtl"
        />
      </div>

      {/* Table */}
      <div className={cn("rounded-md border", isLoading && "opacity-50")}>
        <Table className="pr-4">
          <TableHeader className='bg-secondary/30'>
            <TableRow >
              {[
                { label: "שם", key: "name" },
                { label: "ת.ז", key: "idNumber" },
                { label: "טלפון", key: "phone" },
                { label: "תאריך לידה", key: "dateOfBirth" },
                { label: "סוג מטופל", key: "isAdult" },
                { label: "טיפול אחרון", key: "lastTreatmentDate" },
                { label: "טיפול עתידי", key: "nextTreatment" },
                { label: "", key: "" },
              ].map((column, index) => (
                <TableHead
                  key={index}
                  onClick={() => column.key && handleSort(column.key)}
                  className={cn(
                    "text-right cursor-pointer select-none pr-2",
                    column.key && "hover:text-primary"
                  )}
                  style={{
                    width: column.key === "" ? "10%" : "auto", // Actions column narrower
                  }}
                >
                  <div className="w-28">
                    {column.label}
                    {column.key && sortColumn === column.key && (
                      <span className="ml-1 text-muted-foreground">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : sortedPatients?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 md:text-center text-right pr-4"
                >
                  לא נמצאו מטופלים
                </TableCell>
              </TableRow>
            ) : (
              sortedPatients?.map((patient) => (
                <TableRow
                  key={patient._id}
                  className="cursor-pointer"
                  onClick={() => setSelectedPatient(patient)}
                >
                  <TableCell className="font-medium pr-4">{`${patient.firstName} ${patient.lastName}`}</TableCell>
                  <TableCell>{patient.idNumber}</TableCell>
                  <TableCell>{patient.phone}</TableCell>
                  <TableCell>
                    {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.isAdult ? "blue": "red"} className='px-2'>
                      {patient.isAdult ? "מבוגר" : "ילד"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {patient.lastTreatmentDate
                      ? format(
                          new Date(patient.lastTreatmentDate),
                          "dd/MM/yyyy"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {patient.nextTreatment
                      ? format(new Date(patient.nextTreatment), "dd/MM/yyyy")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal("addOrEditPatient", {
                            patientToEdit: patient,
                          });
                        }}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="outline" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-right">
                              מחיקת מטופל
                            </AlertDialogTitle>
                            <AlertDialogDescription className="ml-auto text-right">
                              האם אתה בטוח שברצונך למחוק את המטופל{" "}
                              {patient.firstName}? פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-3 mt-4">
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={(e) => {
                                e.stopPropagation();
                                deletePatient(patient._id);
                              }}
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
