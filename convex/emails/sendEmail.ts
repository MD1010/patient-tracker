// import Mailjet from "node-mailjet";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { Doc } from "../_generated/dataModel";
import axios from "axios";
import { nutoSansFont } from "../../src/lib/fonts";
// // Helper function to create Base64 from Uint8Array
// const toBase64 = (uint8Array: Uint8Array): string => {
//   let binary = "";
//   const len = uint8Array.byteLength;
//   for (let i = 0; i < len; i++) {
//     binary += String.fromCharCode(uint8Array[i]);
//   }
//   return btoa(binary);
// };

// // Function to create and encode the PDF
// const createAndEncodePDF = async (patient: Doc<"patients">): Promise<string> => {
//   const {
//     firstName,
//     lastName,
//     dateOfBirth,
//     conditions,
//     smoking,
//     otherAllergies,
//     surgeries,
//     medications,
//     parent,
//     phone,
//   } = patient;

//   const conditionDescriptions: Record<string, string> = {
//     aids: "איידס",
//     artificialValve: "שסתום מלאכותי",
//     asthma: "אסתמה",
//     bloodClottingProblems: "בעיות בקרישת דם",
//     cancer: "סרטן",
//     chemotherapy: "כימותרפיה",
//     diabetes: "סוכרת",
//     heartDefect: "מום לב",
//     heartDisease: "מחלת לב",
//     hepatitisB: "צהבת B",
//     hepatitisC: "צהבת C",
//     hypertension: "יתר לחץ דם",
//     kidneyDisease: "מחלת כליות",
//     neurologicalProblems: "בעיות נוירולוגיות",
//     osteoporosis: "אוסטאופורוזיס",
//     pacemaker: "קוצב לב",
//     psychiatricProblems: "בעיות פסיכיאטריות",
//     thyroidProblems: "בעיות בבלוטת התריס",
//     tuberculosis: "שחפת",
//   };

//   const existingConditions = Object.entries(conditions || {})
//     .filter(([_, hasCondition]) => hasCondition)
//     .map(([key]) => conditionDescriptions[key])
//     .join(", ");

//   const medicationList: string[] = [];
//   if (medications?.coumadin) medicationList.push("קומדין");
//   if (medications?.penicillinLatex) medicationList.push("פניצילין/לטקס");

//   // Create a new PDF document
//   const pdfDoc = await PDFDocument.create();
//   const page = pdfDoc.addPage([600, 750]);
//   const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

//   const fontSize = 12;
//   let yOffset = 700;

//   // Helper function to draw text
//   const drawText = (text: string, isRightAligned = false) => {
//     page.drawText(text, {
//       x: isRightAligned ? 400 : 50,
//       y: yOffset,
//       size: fontSize,
//       font,
//       color: rgb(0, 0, 0),
//     });
//     yOffset -= fontSize + 5;
//   };

//   // General Information Section
//   drawText("פרטים כלליים", true);
//   drawText(`שם המטופל: ${firstName} ${lastName}`, true);
//   drawText(
//     `תאריך לידה: ${new Date(dateOfBirth).toLocaleDateString("he-IL")}`,
//     true
//   );
//   if (parent) {
//     drawText(`הורה: ${parent.name}, טלפון: ${parent.phone}`, true);
//   } else {
//     drawText(`טלפון: ${phone}`, true);
//   }

//   // Medical Information Section
//   drawText("מידע רפואי", true);
//   if (existingConditions) {
//     drawText(`מצבים רפואיים: ${existingConditions}`, true);
//   }
//   if (smoking) {
//     drawText("המטופל מעשן.", true);
//   }
//   if (otherAllergies) {
//     drawText(`אלרגיות ידועות: ${otherAllergies}`, true);
//   }
//   if (surgeries) {
//     drawText(`ניתוחים שבוצעו בעבר: ${surgeries}`, true);
//   }
//   if (medicationList.length > 0) {
//     drawText(`תרופות: ${medicationList.join(", ")}`, true);
//   }

//   // Serialize the PDF to Uint8Array
//   const pdfBytes = await pdfDoc.save();

//   // Convert the Uint8Array to Base64
//   return toBase64(pdfBytes);
// };

// Helper function to create Base64 from Uint8Array
const toBase64 = (uint8Array: Uint8Array): string => {
  let binary = "";
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

const base64ToUint8Array = (base64: Base64URLString) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

// Function to create and encode the PDF
const createAndEncodePDF = async (
  patient: Doc<"patients">
): Promise<string> => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  // Register fontkit
  pdfDoc.registerFontkit(fontkit);
  const hebrewFont = await pdfDoc.embedFont(base64ToUint8Array(nutoSansFont));
  const page = pdfDoc.addPage([600, 750]);
  // const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Draw "Hello World" on the PDF
  page.drawText("שלום עולם", {
    x: 50,
    y: 700,
    size: 24,
    font: hebrewFont,
    color: rgb(0, 0, 0),
  });

  // Serialize the PDF to Uint8Array
  const pdfBytes = await pdfDoc.save();

  // Convert the Uint8Array to Base64
  return toBase64(pdfBytes);
};

export const sendEmailWithPDF = async ({
  patient,
}: {
  patient: Doc<"patients">;
}) => {
  const pdfBase64 = await createAndEncodePDF(patient);
  // console.log(pdfBase64);

  const filename = `${patient.idNumber}_medical_report.pdf`;

  // const mailjetClient = new Mailjet({
  //   apiKey: process.env.MAILJET_API_KEY,
  //   apiSecret: process.env.MAILJET_API_SECRET,
  // });

  const emailData = {
    Messages: [
      {
        From: {
          Email: "my.patient.tracker@gmail.com",
          Name: "ניהול מטופלים",
        },
        To: [
          {
            Email: "michaelkatom10@gmail.com",
            Name: "Michael",
          },
        ],
        Subject: ` פלוני אלמוני ת.ז ${patient.idNumber}`,
        TextPart: " ",
        Attachments: [
          {
            ContentType: "application/pdf",
            Filename: filename,
            Base64Content: pdfBase64,
          },
        ],
      },
    ],
  };
  try {
    console.log("Sending email...");
    const response = await axios.post(
      "https://api.mailjet.com/v3.1/send",
      emailData,
      {
        auth: {
          username: process.env.MAILJET_API_KEY!,
          password: process.env.MAILJET_API_SECRET!,
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Email sent successfully:", response.data);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};
