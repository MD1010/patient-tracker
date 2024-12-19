import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { generateMedicalConditionReport } from "../common/generateMedicalInfo"; // Ensure correct path
import { Doc } from "../_generated/dataModel";
import { nutoSansFont } from "../../src/lib/fonts/regular"; // Base64 font
import { nutoSansSemiBold } from "../../src/lib/fonts/semi-bold"; // Base64 font
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
  const regularFont = await pdfDoc.embedFont(base64ToUint8Array(nutoSansFont));
  const semiBoldFont = await pdfDoc.embedFont(
    base64ToUint8Array(nutoSansSemiBold)
  );

  let page = pdfDoc.addPage([600, 750]);
  let yOffset = 700;

  const drawRTLText = (
    text: string,
    y: number,
    size: number,
    x: number,
    bold = false
  ) => {
    const textWidth = regularFont.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: x - textWidth, // Align to the right edge of the provided x
      y,
      size,
      font: bold ? semiBoldFont : regularFont,
      color: rgb(0, 0, 0),
    });
  };

  const drawSeparator = () => {
    yOffset += 10; // Increased margin below the separator
    page.drawLine({
      start: { x: 0, y: yOffset },
      end: { x: 1000, y: yOffset },
      thickness: 0.7,
      color: rgb(0, 0, 0),
    });
    yOffset -= 40; // Increased margin below the separator
  };

  const drawSectionHeader = (title: string) => {
    drawRTLText(title, yOffset, 20, 550, true); // Bolder and larger font size for the title
    yOffset -= 40; // Space after the title
  };

  const drawPersonalInfo = () => {
    const infoFontSize = 12;
    const lineHeight = 25; // Adjusted line height for better readability
    const labelValueGap = 10; // Reduced gap between labels and values

    const phoneLabel = patient.phone ? "טלפון" : "טלפון הורה";
    const phoneValue = patient.phone || patient.parent?.phone || "N/A";

    const personalInfo = [
      { label: "שם מלא", value: `${patient.firstName} ${patient.lastName}` },
      { label: "תעודת זהות", value: patient.idNumber },
      {
        label: "תאריך לידה",
        value: new Date(patient.dateOfBirth).toLocaleDateString("he-IL"),
      },
      { label: "מטופל מתאריך", value: new Date().toLocaleDateString("he-IL") },
      { label: phoneLabel, value: phoneValue },
    ];

    personalInfo.forEach((info) => {
      drawRTLText(info.label, yOffset, infoFontSize, 550, true); // Bold for labels
      drawRTLText(info.value, yOffset, infoFontSize, 550 - 200 - labelValueGap); // Align values closer to labels
      yOffset -= lineHeight; // Move to the next row
    });

    yOffset -= 20; // Extra padding after the section
  };

  const drawReportContent = (report: string) => {
    const sections = report.split(". ").map((s) => `${s.trim()}`);
    const contentFontSize = 12;

    for (const section of sections) {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]); // Add a new page to the PDF document
        yOffset = 700;
      }
      drawRTLText(section, yOffset, contentFontSize, 550);
      yOffset -= 20; // Adjusted line spacing
    }
  };

  const drawTreatmentsTable = (treatments: Doc<"treatments">[]) => {
    if (treatments.length === 0) {
      drawRTLText("אין היסטוריית טיפולים", yOffset, 14, 550, true);
      yOffset -= 30;
      return;
    }

    const pageWidth = 600; // Total page width
    const tablePadding = 50; // Equal padding for left and right sides
    const totalTableWidth = pageWidth - 2 * tablePadding; // Total width of the table
    const columnWidths = [80, 100, 100, totalTableWidth - 280]; // Dynamically calculate תיאור column width
    const rowHeight = 20; // Row height
    const fontSize = 10; // Font size for table content
    const headers = ["תאריך", "סוג", "עלות", "תיאור"]; // Table headers

    // Draw table headers
    headers.forEach((header, index) => {
      const headerX =
        pageWidth -
        tablePadding -
        columnWidths.slice(0, index).reduce((a, b) => a + b, 0); // Align headers with padding
      drawRTLText(header, yOffset, fontSize + 2, headerX, true);
    });

    yOffset -= 30; // Space between headers and content

    // Draw table rows
    treatments.forEach((treatment) => {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]); // Add a new page to the PDF document
        yOffset = 700;
      }

      const rowValues = [
        new Date(treatment.date).toLocaleDateString("he-IL"),
        treatment.type,
        `${treatment.cost}₪`,
      ];

      // Draw columns other than תיאור
      rowValues.forEach((value, index) => {
        const valueX =
          pageWidth -
          tablePadding -
          columnWidths.slice(0, index).reduce((a, b) => a + b, 0); // Align cells with padding
        drawRTLText(value, yOffset, fontSize, valueX);
      });

      // Handle תיאור column with multi-line overflow
      const description = treatment.description || "";
      const descriptionLines = description.match(/.{1,40}/g) || [description]; // Break description into lines
      const descriptionX =
        pageWidth -
        tablePadding -
        columnWidths.slice(0, 3).reduce((a, b) => a + b, 0); // Align description with padding

      descriptionLines.forEach((line) => {
        drawRTLText(line, yOffset, fontSize, descriptionX);
        yOffset -= 12; // Adjust for multi-line overflow
      });

      // Adjust row height based on the tallest column (e.g., תיאור)
      yOffset -= Math.max(rowHeight, descriptionLines.length * 12);
    });

    yOffset -= 20; // Space after the table
  };

  // Draw "פרטים כלליים" section with header and personal info
  drawSectionHeader("פרטים כלליים");
  drawPersonalInfo();
  drawSeparator();

  // Draw "דו\"ח רפואי" section
  const report = generateMedicalConditionReport(patient, {
    withInfoDetails: false,
  });
  drawSectionHeader('דו"ח רפואי');
  drawReportContent(report);
  drawSeparator();

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
