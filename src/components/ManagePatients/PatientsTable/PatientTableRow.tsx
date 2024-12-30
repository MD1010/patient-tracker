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
  columnsWidth: string[];
  patient: Doc<"patients"> & { lastTreatmentDate: string };
  onEdit: (patient: any) => void;
  onDelete: (id: Id<"patients">) => void;
  onNewTreatment: (patient: any) => void;
  onNextTretmentDate: (patient: any) => void;
  onRowClick: (patient: any) => void;
}

import { useState } from "react";

export function PatientTableRow({
  columnsWidth,
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
        className="py-3 px-4 text-center font-medium whitespace-nowrap"
        style={{
          width: columnsWidth[0],
        }}
      >
        {`${patient.firstName} ${patient.lastName}`}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap"
        style={{
          width: columnsWidth[1],
        }}
      >
        {patient.idNumber}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap mobile:hidden"
        style={{
          width: columnsWidth[2],
        }}
      >
        {patient.phone || patient.parent?.phone}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap hidden lg:table-cell"
        style={{
          width: columnsWidth[3],
        }}
      >
        {format(new Date(patient.dateOfBirth), "dd/MM/yyyy")}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap hidden lg:table-cell "
        style={{
          width: columnsWidth[4],
        }}
      >
        <Badge
          variant={patient.isAdult ? "blue" : "red"}
          className="px-2"
          style={{
            width: "auto",
          }}
        >
          {patient.isAdult ? "מבוגר" : "ילד"}
        </Badge>
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap hidden lg:table-cell"
        style={{
          width: columnsWidth[6],
        }}
      >
        {patient.lastTreatmentDate
          ? format(new Date(patient.lastTreatmentDate), "dd/MM/yyyy")
          : "-"}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-center whitespace-nowrap hidden lg:table-cell"
        style={{
          width: columnsWidth[7],
        }}
      >
        {patient.nextTreatment
          ? format(new Date(patient.nextTreatment.date), "dd/MM/yyyy")
          : "-"}
      </TableCell>
      <TableCell
        className="py-3 px-4 text-centerwhitespace-nowrap hidden lg:table-cell"
        style={{
          width: columnsWidth[8],
        }}
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
                <ClipboardCheckIcon
                  strokeWidth={3}
                  height={14}
                  width={16}
                  className="ml-2"
                />
                {patient.nextTreatment ? "עריכת תור עתידי" : "תור חדש"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2  px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewTreatment(patient);
                }}
              >
                <PlusIcon
                  strokeWidth={3}
                  height={20}
                  width={16}
                  className="ml-2"
                />
                טיפול חדש
              </DropdownMenuItem>
              <DropdownMenuItem
                className="py-2 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(patient);
                }}
              >
                <Pencil
                  strokeWidth={3}
                  height={14}
                  width={16}
                  className="ml-2"
                />
                ערוך מטופל
              </DropdownMenuItem>

              <Separator className="my-1" />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive py-2 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDialogOpen(true); // Open the dialog
                }}
              >
                <TrashIcon
                  strokeWidth={3}
                  height={14}
                  width={16}
                  className="ml-2"
                />
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
