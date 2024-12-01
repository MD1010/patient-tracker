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
import { generateRegistrationLink } from '@/lib/db';
import { QRCodeSVG } from 'qrcode.react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';

export function RegistrationLinkDialog() {
  const [open, setOpen] = useState(false);
  const [registrationLink, setRegistrationLink] = useState('');

  const generateLink = async () => {
    const link = await generateRegistrationLink();
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
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center">
            <QRCodeSVG value={registrationLink} size={200} />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            שלח את הקישור למטופל או סרוק את הקוד QR
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}