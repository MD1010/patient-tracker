import { Button } from '@/components/ui/button';
import { Id } from 'convex/_generated/dataModel';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

interface WhatsAppButtonProps {
  phone: string;
  patientId: Id<'patients'>;
}

export function WhatsAppButton({ phone }: WhatsAppButtonProps) {
  const sendMessage = () => {
    try {
      const formattedPhone = phone.replace(/\D/g, '');
      const whatsappUrl = `https://wa.me/${formattedPhone}`;
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      toast.error('שגיאה בשליחת ההודעה');
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={sendMessage}
      className="h-8 w-8"
    >
      <MessageSquare className="h-4 w-4" />
    </Button>
  );
}