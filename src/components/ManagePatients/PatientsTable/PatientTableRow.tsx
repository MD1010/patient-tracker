import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TableCell, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import {
  ClipboardCheckIcon,
  MoreVertical,
  Pencil,
  PlusIcon,
  TrashIcon,
} from "lucide-react";
import { Doc, Id } from "../../../../convex/_generated/dataModel";

interface PatientTableRowProps {
  patient: Doc<"patients"> & { lastTreatmentDate: string };
  columns: { key: string; label: string; className: string }[];
  onEdit: (patient: any) => void;
  onDelete: (id: Id<"patients">) => void;
  onNewTreatment: (patient: any) => void;
  onNextTretmentDate: (patient: any) => void;
  onRowClick: (patient: any) => void;
}

import { cn } from "@/lib/utils";
import { useState } from "react";

export function PatientTableRow({
  columns,
  patient,
  onEdit,
  onDelete,
  onNewTreatment,
  onNextTretmentDate,
  onRowClick,
}: PatientTableRowProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State to control the dialog

  return (
    <TableRow
      key={patient._id}
      className="cursor-pointer hover:bg-secondary/20 h-[3.5rem]"
      onClick={() => onRowClick(patient)}
    >
      <TableCell
        className={`${cn("py-3 font-medium whitespace-nowrap ", columns[0].className)}`}
      >
        {`${patient.firstName} ${patient.lastName}`}
      </TableCell>
      <TableCell
        className={`${cn("py-3 whitespace-nowrap ", columns[1].className)}`}
      >
        {patient.idNumber}
      </TableCell>
      <TableCell
        className={`${cn("py-3  whitespace-nowrap ", columns[2].className)}`}
      >
        {patient.phone || patient.parent?.phone}
      </TableCell>
      <TableCell
        className={`${cn("py-3  whitespace-nowrap  ", columns[3].className)}`}
      >
        {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}
      </TableCell>
      <TableCell
        className={`${cn("py-3  whitespace-nowrap  ", columns[4].className)}`}
      >
        <Badge variant={patient.isAdult ? "blue" : "red"} className="px-2">
          {patient.isAdult ? "מבוגר" : "ילד"}
        </Badge>
      </TableCell>
      <TableCell
        className={`${cn("py-3  whitespace-nowrap ", columns[5].className)}`}
      >
        {patient.lastTreatmentDate
          ? format(new Date(patient.lastTreatmentDate), "dd/MM/yyyy")
          : "-"}
      </TableCell>
      <TableCell
        className={`${cn("py-3  whitespace-nowrap  ", columns[6].className)}`}
      >
        {patient.nextTreatment
          ? format(new Date(patient.nextTreatment.date), "dd/MM/yyyy")
          : "-"}
      </TableCell>

      <TableCell
        className={`${cn("py-3  whitespace-nowrap", columns[7].className)}`}
      >
        {patient.nextTreatmentRecallDate
          ? format(new Date(patient.nextTreatmentRecallDate), "dd/MM/yyyy")
          : "-"}
      </TableCell>
      <TableCell
        className={`${cn("py-3  text-centerwhitespace-nowrap", columns[8].className)}`}
      >
        <div className="flex justify-end">
          <DropdownMenu dir="rtl">
            <DropdownMenuTrigger
              asChild
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem
                className="py-2 px-2 pl-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextTretmentDate(patient);
                }}
              >
                <ClipboardCheckIcon strokeWidth={2} className="ml-3 h-5 w-5" />
                <span>{patient.nextTreatment ? "עריכת תור עתידי" : "תור חדש"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2  px-2 pl-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewTreatment(patient);
                }}
              >
                <PlusIcon strokeWidth={2} className="h-5 w-5 ml-3" />
                טיפול חדש
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2 px-2 pl-6"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(patient);
                }}
              >
                <Pencil strokeWidth={2} className="h-5 w-5 ml-3" />
                ערוך מטופל
              </DropdownMenuItem>

              <Separator className="my-1" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive py-2 px-2 pl-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true); // Open the dialog
                }}
              >
                <TrashIcon strokeWidth={2} className="h-5 w-5 ml-3" />
                מחק מטופל
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
              <AlertDialogHeader>
                <AlertDialogTitle className="">מחיקת מטופל</AlertDialogTitle>
                <AlertDialogDescription className="ml-auto ">
                  האם אתה בטוח שברצונך למחוק את המטופל {patient.firstName}?
                  פעולה זו לא ניתנת לביטול.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex gap-3 mt-4">
                <AlertDialogCancel onClick={() => setIsDialogOpen(false)}>
                  ביטול
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    onDelete(patient._id);
                    setIsDialogOpen(false); // Close the dialog after deletion
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
  );
}
