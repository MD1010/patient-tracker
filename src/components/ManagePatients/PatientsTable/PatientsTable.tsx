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
import { cn } from "@/lib/utils";
import { useModal } from "@/store/modal-store";
import { usePatients } from "@/store/patients-store";
import { Loader2, Search } from "lucide-react";
import { useState } from "react";
import { PatientTableRow } from "./PatientTableRow";
import { Doc } from "../../../../convex/_generated/dataModel";

export function PatientTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const { patients, isLoading, deletePatient } = usePatientActions();
  const { setSelectedPatient } = usePatients();
  const { openModal } = useModal();

  const filteredPatients = patients?.filter((patient) => {
    const searchLower = searchQuery.toLowerCase();

    // Check top-level properties
    const topLevelMatch = Object.values(patient).some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(searchLower)
    );

    // Check nested parent.phone property if it exists
    const parentPhoneMatch = patient.parent?.phone
      ? patient.parent.phone.toLowerCase().includes(searchLower)
      : false;

    return topLevelMatch || parentPhoneMatch;
  });

  const sortedPatients = filteredPatients?.slice().sort((a, b) => {
    if (!sortColumn) return 0;
  
    const getValue = (patient: any, column: string) => {
      if (column === "name") {
        return `${patient.firstName} ${patient.lastName}`.toLowerCase();
      }
      if (column === "dateOfBirth" || column === "lastTreatmentDate" || column === "nextTreatment") {
        return patient[column] ? new Date(patient[column]) : null;
      }
      return patient[column] ?? null; // Explicitly return null for undefined values
    };
  
    const aValue = getValue(a, sortColumn);
    const bValue = getValue(b, sortColumn);
  
    // Always sort null/undefined values to the end
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1; // Move aValue after bValue
    if (bValue == null) return -1; // Move bValue after aValue
  
    // Handle string comparison
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  
    // Handle date comparison
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
  
    // Handle numeric comparison
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
  
    // Fallback comparison for other types
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

  const handleEdit = (
    patient: Doc<"patients"> & { lastTreatmentDate: string }
  ) => {
    const { lastTreatmentDate, ...patientWithOutLastTreatment } = patient;
    openModal("addOrEditPatient", {
      patientToEdit: patientWithOutLastTreatment,
    });
  };

  const handleNewTreatment = (patient: Doc<"patients">) => {
    openModal("addOrEditTreatment", { patientId: patient._id });
  };

  const onNextTretmentDate = (patient: Doc<"patients">) => {
    openModal("addOrEditNextTreatment", { selectedPatient: patient });
  };

  const columns = [
    {
      label: "שם",
      key: "name",
      className: "text-center mobile:text-right mobile:px-4",
    },
    {
      label: "ת.ז",
      key: "idNumber",
      className: "text-center mobile:text-right",
    },
    { label: "טלפון", key: "phone", className: "text-center  mobile:hidden" },
    {
      label: "תאריך לידה",
      key: "dateOfBirth",
      className: "text-center hidden laptop:table-cell tablet:table-cell",
    },
    {
      label: "סוג מטופל",
      key: "isAdult",
      className: "text-center hidden lg:table-cell",
    },
    {
      label: "טיפול אחרון",
      key: "lastTreatmentDate",
      className: "text-center  hidden lg:table-cell",
    },
    {
      label: "טיפול עתידי",
      key: "nextTreatment",
      className: "text-center  hidden xl:table-cell",
    },
    {
      label: "תזכור עתידי",
      key: "nextTreatmentRecallDate",
      className: "text-center  hidden xl:table-cell",
    },
    {
      label: "",
      key: "",
      className: "text-center  hidden laptop:table-cell tablet:table-cell",
    },
  ];

  return (
    <div className="space-y-6 ">
      <div className="flex gap-2 mobile:block">
        <Input
          startIcon={<Search className="h-4 w-4 text-muted-foreground" />}
          placeholder="חיפוש מטופלים..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          // className="max-w-sm mobile:w-full"
          dir="rtl"
        />
      </div>

      <div className={cn("rounded-md", isLoading && "opacity-50")}>
        <div className="relative overflow-auto max-h-[calc(100vh-324px)] scrollbar-rtl">
          <Table>
            {/* TableHeader */}
            <TableHeader className="bg-background sticky z-50 -top-1 peer border border-l-0 border-r-0 group">
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={index}
                    onClick={() => column.key && handleSort(column.key)}
                    className={cn(
                      "text-center py-3 whitespace-nowrap font-extrabold",
                      column.className
                    )}
                  >
                    {column.label}
                    {column.key && sortColumn === column.key && (
                      <span className="mr-2 text-muted-foreground">
                        {sortDirection === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>

            {/* TableBody */}
            <TableBody>
              {/* Table rows */}
              {isLoading ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-80 text-center"
                  >
                    <div className="grid place-items-center h-full">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : sortedPatients?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="h-24 pointer-events-none hover:bg-transparent text-center font-semibold"
                  >
                    לא נמצאו מטופלים
                  </TableCell>
                </TableRow>
              ) : (
                sortedPatients?.map((patient) => (
                  <PatientTableRow
                    columns={columns}
                    key={patient._id}
                    patient={patient}
                    onEdit={handleEdit}
                    onDelete={deletePatient}
                    onNextTretmentDate={onNextTretmentDate}
                    onNewTreatment={handleNewTreatment}
                    onRowClick={setSelectedPatient}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
