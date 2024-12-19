import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { generateMedicalConditionReport } from "../common/generateMedicalInfo"; // Ensure correct path
import { Doc } from "../_generated/dataModel";
import { nutoSansFont } from "../../src/lib/fonts"; // Base64 font
import axios from "axios";

const base64ToUint8Array = (base64: string): Uint8Array => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

const toBase64 = (uint8Array: Uint8Array): string => {
  let binary = "";
  const len = uint8Array.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  return btoa(binary);
};

const createAndEncodePDF = async (
  patient: Doc<"patients">,
  treatments: Doc<"treatments">[]
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const hebrewFont = await pdfDoc.embedFont(base64ToUint8Array(nutoSansFont));

  let page = pdfDoc.addPage([600, 750]);
  let yOffset = 700;

  const drawRTLText = (
    text: string,
    y: number,
    size: number,
    x: number,
    bold = false
  ) => {
    const textWidth = hebrewFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: x - textWidth, // Align to the right edge of the provided x
      y,
      size,
      font: hebrewFont,
      color: rgb(0, 0, 0),
    });
  };

  const drawSectionHeader = (title: string) => {
    yOffset -= 30; // Increased spacing before section header
    drawRTLText(title, yOffset, 16, 550, true); // Bold and larger font size for the title
    yOffset -= 30; // Extra space after the title
    page.drawLine({
      start: { x: 50, y: yOffset },
      end: { x: 550, y: yOffset },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yOffset -= 20; // Increased space after the separator
  };

  const drawPersonalInfoGrid = () => {
    const infoFontSize = 12;
    const lineHeight = 40; // Increased line height for better readability

    const phoneLabel = patient.phone ? "טלפון" : "טלפון הורה";
    const phoneValue = patient.phone || patient.parent?.phone || "N/A";

    const personalInfo = [
      {
        label: "תאריך לידה",
        value: new Date(patient.dateOfBirth).toLocaleDateString("he-IL"),
      },
      { label: "מטופל מתאריך", value: new Date().toLocaleDateString("he-IL") },
      { label: phoneLabel, value: phoneValue },
      { label: "תעודת זהות", value: patient.idNumber },
    ];

    let currentYOffset = yOffset;
    const columnWidth = 250;

    // Draw info in a 2x2 grid
    for (let i = 0; i < personalInfo.length; i++) {
      const columnX = i % 2 === 0 ? 550 - columnWidth : 300; // Alternate columns
      if (i % 2 === 0 && i > 0) currentYOffset -= lineHeight; // Move to next row after two items

      drawRTLText(
        personalInfo[i].label,
        currentYOffset,
        infoFontSize,
        columnX,
        true
      ); // Bold for labels
      drawRTLText(
        personalInfo[i].value,
        currentYOffset - 20,
        infoFontSize,
        columnX
      ); // Proper spacing for values
    }

    yOffset = currentYOffset - 50; // Adjust for padding after the grid
  };

  const drawReportContent = (report: string) => {
    const sections = report.split(". ").map((s) => `${s.trim()}.`);
    const contentFontSize = 12;

    for (const section of sections) {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]); // Add a new page to the PDF document
        yOffset = 700;
      }
      drawRTLText(section, yOffset, contentFontSize, 550);
      yOffset -= 20; // Increased line spacing for better readability
    }
  };

  const drawTreatmentsTable = (treatments: Doc<"treatments">[]) => {
    if (treatments.length === 0) {
      drawRTLText("אין היסטוריית טיפולים", yOffset, 14, 550, true);
      yOffset -= 40;
      return;
    }

    const headers = ["תאריך", "סוג", "תיאור", "עלות", "הטיפול הבא"];
    const rowHeight = 30; // Increased row height for better visibility
    const fontSize = 12;

    // Draw table headers
    headers.forEach((header, index) => {
      const headerX = 550 - index * 100; // Position headers right to left
      drawRTLText(header, yOffset, fontSize, headerX, true);
    });

    yOffset -= rowHeight;

    // Draw table rows
    treatments.forEach((treatment) => {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]); // Add a new page to the PDF document
        yOffset = 700;
      }

      const rowValues = [
        new Date(treatment.date).toLocaleDateString("he-IL"),
        treatment.type,
        treatment.description,
        `${treatment.cost}₪`,
        treatment.nextAppointment
          ? new Date(treatment.nextAppointment).toLocaleDateString("he-IL")
          : "-",
      ];

      rowValues.forEach((value, index) => {
        const valueX = 550 - index * 100; // Position cells right to left
        drawRTLText(value, yOffset, fontSize, valueX);
      });

      yOffset -= rowHeight;
    });

    yOffset -= 30; // Space after the table
  };

  // Draw "פרטים כלליים" section with header and personal info grid
  drawSectionHeader("פרטים כלליים");
  drawPersonalInfoGrid();

  // Draw "דו\"ח רפואי" section
  const report = generateMedicalConditionReport(patient, {
    withInfoDetails: false,
  });
  drawSectionHeader('דו"ח רפואי');
  drawReportContent(report);

  // Draw "היסטוריית טיפולים" section
  drawSectionHeader("היסטוריית טיפולים");
  drawTreatmentsTable(treatments);

  // Serialize the PDF and return Base64
  const pdfBytes = await pdfDoc.save();
  return toBase64(pdfBytes);
};

export const sendEmailWithPDF = async ({
  patient,
  treatments,
}: {
  patient: Doc<"patients">;
  treatments: Doc<"treatments">[];
}) => {
  const pdfBase64 = await createAndEncodePDF(patient, treatments);

  const filename = `${patient.idNumber}.pdf`;

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
