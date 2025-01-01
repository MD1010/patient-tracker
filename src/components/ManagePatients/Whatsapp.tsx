import { Doc } from "convex/_generated/dataModel";
import { toast } from "sonner";

export const getWhatsappUrl = (patient: Doc<"patients">) => {
  if (!patient || !patient.nextTreatment) return;

  try {
    // Format the phone number by removing non-digit characters
    const formattedPhone = patient.isAdult
      ? patient.phone?.replace(/\D/g, "").replace(/^0/, "+972")
      : patient.parent?.phone?.replace(/\D/g, "").replace(/^0/, "+972");

    // Format the date and time
    const formattedDate = new Date(
      patient.nextTreatment.date
    ).toLocaleDateString("he-IL");
    const formattedTime = patient.nextTreatment.time || "לא ידוע";

    // Encode a predefined message with date and time
    const predefinedMessage = `היי ${patient.firstName}, רציתי להזכיר לך על התור הבא שלך לשיננית בתאריך ${formattedDate} בשעה ${formattedTime}.`;
    const encodedMessage = encodeURIComponent(predefinedMessage);

    // Construct the WhatsApp URL with the message
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
    console.log("whataurl", whatsappUrl);

    return whatsappUrl;
  } catch (error) {
    // Show error toast if there's an issue
    toast.error("שגיאה בשליחת ההודעה");
  }
};
