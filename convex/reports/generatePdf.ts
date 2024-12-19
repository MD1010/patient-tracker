import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { Doc } from "../_generated/dataModel";
import { generateMedicalConditionReport } from "../common/generateMedicalInfo";
import { base64ToUint8Array, toBase64 } from "./utils";
import { nutoSansSemiBold } from "../../src/lib/fonts/semi-bold";
import { nutoSansFont } from "../../src/lib/fonts/regular";

export const generatePatientInfoPdf = async (
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

    yOffset -= 20; // Adjusted line spacing
  };

  const drawTreatmentsTable = (treatments: Doc<"treatments">[]) => {
    if (treatments.length === 0) {
      drawRTLText("אין היסטוריית טיפולים", yOffset, 14, 550, false);
      yOffset -= 30;
      return;
    }

    const pageWidth = 600;
    const tablePadding = 50;
    const totalTableWidth = pageWidth - 2 * tablePadding;
    const columnWidths = [80, 80, 150, totalTableWidth - 310];
    const rowHeight = 25;
    const fontSize = 10;
    const headers = ["תאריך", "עלות", "סוג", "תיאור"];
    const separatorMarginBottom = 10;

    // Draw table headers
    headers.forEach((header, index) => {
      const headerX =
        pageWidth -
        tablePadding -
        columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      drawRTLText(header, yOffset, fontSize + 2, headerX, true);
    });

    yOffset -= 30; // Space between headers and content

    // Separator after the headers
    page.drawLine({
      start: { x: tablePadding, y: yOffset + 15 }, // Reduced margin above
      end: { x: pageWidth - tablePadding, y: yOffset + 15 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yOffset -= separatorMarginBottom; // Reduced space after the header separator

    // Draw table rows
    treatments.forEach((treatment) => {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]);
        yOffset = 700;
      }

      const rowValues = [
        new Date(treatment.date).toLocaleDateString("he-IL"),
        `${treatment.cost}₪`,
      ];

      // Draw תאריך and עלות columns
      rowValues.forEach((value, index) => {
        const valueX =
          pageWidth -
          tablePadding -
          columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        drawRTLText(value, yOffset, fontSize, valueX);
      });

      // Handle סוג column with multi-line overflow
      const type = treatment.type || "";
      const typeLines = type.match(/.{1,15}/g) || [type];
      const typeX =
        pageWidth -
        tablePadding -
        columnWidths.slice(0, 2).reduce((a, b) => a + b, 0);

      let currentYOffset = yOffset;
      typeLines.forEach((line) => {
        drawRTLText(line, currentYOffset, fontSize, typeX);
        currentYOffset -= 12;
      });

      // Handle תיאור column with multi-line overflow
      const description = treatment.description || "";
      const descriptionLines = description.match(/.{1,30}/g) || [description];
      const descriptionX =
        pageWidth -
        tablePadding -
        columnWidths.slice(0, 3).reduce((a, b) => a + b, 0);

      let descriptionYOffset = yOffset;
      descriptionLines.forEach((line) => {
        drawRTLText(line, descriptionYOffset, fontSize, descriptionX);
        descriptionYOffset -= 12;
      });

      const maxColumnHeight = Math.max(
        rowHeight,
        descriptionLines.length * 12,
        typeLines.length * 12
      );

      // Separator after each row
      page.drawLine({
        start: { x: tablePadding, y: yOffset - maxColumnHeight },
        end: { x: pageWidth - tablePadding, y: yOffset - maxColumnHeight },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      yOffset -= maxColumnHeight + separatorMarginBottom + 5; // Adjusted for consistent spacing
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
