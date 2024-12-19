import { Button } from "@/components/ui/button";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Doc } from "convex/_generated/dataModel";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface WhatsAppButtonProps {
  patient: Doc<"patients">;
}

export function WhatsAppButton({ patient }: WhatsAppButtonProps) {
  const getWhatsappUrl = () => {
    if (!patient || !patient.nextTreatment) return;

    try {
      // Format the phone number by removing non-digit characters
      const formattedPhone = patient.isAdult
        ? patient.phone?.replace(/\D/g, "").replace(/^0/, "+972")
        : patient.parent?.phone?.replace(/\D/g, "").replace(/^0/, "+972");
      // Encode a predefined message
      const formattedDate = new Date(patient.nextTreatment).toLocaleDateString(
        "he-IL"
      );
      const predefinedMessage = `היי ${patient.firstName}, רציתי להזכיר לך על התור הבא שלך לשיננית בתאריך ${formattedDate}.`;
      const encodedMessage = encodeURIComponent(predefinedMessage);

      // Construct the WhatsApp URL with the message
      const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;

      return whatsappUrl;
    } catch (error) {
      // Show error toast if there's an issue
      toast.error("שגיאה בשליחת ההודעה");
    }
  };

  return (
    <Link
      to={getWhatsappUrl() || ""}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
    >
      <Button variant="outline" size="icon" disabled={!patient.nextTreatment}>
        <FontAwesomeIcon icon={faWhatsapp} size="2x" />
      </Button>
    </Link>
  );
}
