import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function AddPatientDialog() {
  const [open, setOpen] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');

  const generateLink = () => {
    const token = Math.random().toString(36).substring(2, 15);
    const link = `${window.location.origin}/register/${token}`;
    setRegistrationLink(link);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(registrationLink);
    toast.success('הקישור הועתק ללוח');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (newOpen) generateLink();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">יצירת טופס רישום</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rtl">
        <DialogHeader>
          <DialogTitle>טופס רישום למטופל חדש</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Input value={registrationLink} readOnly />
            <Button size="icon" variant="outline" onClick={copyLink}>
              העתק
            </Button>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            שלח את הקישור למטופל
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}