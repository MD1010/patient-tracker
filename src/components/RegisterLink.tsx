import { Button } from "@/components/ui/button";
import { ClipboardIcon } from '@radix-ui/react-icons';
import { toast } from "sonner";

export function GenerateAddNewPatientFormLink() {
  const generateLink = () => {
    const link = `${window.location.origin}/register`;
    navigator.clipboard.writeText(link);
    toast.success("הקישור נוצר והועתק ללוח");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="outline"
        onClick={generateLink}
        className="flex items-center"
      >
       קישור לרישום
        <ClipboardIcon className="mr-2 h-4 w-4" />
      </Button>
    </div>
  );
}
