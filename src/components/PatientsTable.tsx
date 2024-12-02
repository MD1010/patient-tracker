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
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { patients, isLoading, deletePatient } = usePatientActions();
  const { setSelectedPatient } = usePatients();

  // Search functionality
  const filteredPatients = patients?.filter((patient) =>
    Object.values(patient).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Sort functionality
  const sortedPatients = filteredPatients?.sort((a, b) => {
    if (!sortColumn) return 0;
    const aValue = (a as any)[sortColumn];
    const bValue = (b as any)[sortColumn];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    return 0;
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
          <TableHeader>
            <TableRow>
              {[
                { label: "שם", key: "name" },
                { label: "דוא״ל", key: "email" },
                { label: "טלפון", key: "phone" },
                { label: "תאריך לידה", key: "dateOfBirth" },
                { label: "נוסף בתאריך", key: "createdAt" },
                { label: "פעולות", key: "" },
              ].map((column, index) => (
                <TableHead
                  key={index}
                  onClick={() => column.key && handleSort(column.key)}
                  className={cn(
                    "text-right cursor-pointer select-none pr-4",
                    column.key && "hover:text-primary"
                  )}
                  style={{
                    width: column.key === "" ? "10%" : "auto", // Actions column narrower
                  }}
                >
                  <div className="w-28 ">
                    {column.label}
                    {sortColumn === column.key && (
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
                <TableCell colSpan={6} className="h-24 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : sortedPatients?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  לא נמצאו מטופלים
                </TableCell>
              </TableRow>
            ) : (
              sortedPatients?.map((patient) => (
                <TableRow key={patient._id}>
                  <TableCell className="font-medium pr-4">{patient.name}</TableCell>
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
                            <AlertDialogTitle className="text-right">
                              מחיקת מטופל
                            </AlertDialogTitle>
                            <AlertDialogDescription className="ml-auto text-right">
                              האם אתה בטוח שברצונך למחוק את המטופל{" "}
                              {patient.name}? פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter className="flex gap-3 mt-4">
                            <AlertDialogCancel>ביטול</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deletePatient(patient._id)}
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
