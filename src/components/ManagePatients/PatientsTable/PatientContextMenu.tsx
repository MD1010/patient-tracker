import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface PatientContextMenuProps {
  children: React.ReactNode;
  onEdit: () => void;
  onNewTreatment: () => void;
  onDelete: () => void;
}

export function PatientContextMenu({
  children,
  onEdit,
  onNewTreatment,
  onDelete,
}: PatientContextMenuProps) {
  return (
    <ContextMenu dir='rtl'>
      <ContextMenuTrigger><div className='flex flex-col w-full'>{children}</div></ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem className="text-right" onClick={onNewTreatment}>
          טיפול חדש
        </ContextMenuItem>
        <ContextMenuItem className="text-right" onClick={onEdit}>
          ערוך מטופל
        </ContextMenuItem>
        <ContextMenuItem
          className="text-destructive focus:text-destructive text-right"
          onClick={onDelete}
        >
          מחק מטופל
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}