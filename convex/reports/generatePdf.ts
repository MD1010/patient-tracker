import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";
import { nutoSansFont } from "../../src/lib/fonts/regular";
import { nutoSansSemiBold } from "../../src/lib/fonts/semi-bold";
import { Doc } from "../_generated/dataModel";
import { generateMedicalConditionReport } from "../common/generateMedicalInfo";
import { base64ToUint8Array, getClientDate, toBase64 } from "./utils";

export const generatePatientInfoPdf = async (
  patient: Doc<"patients">,
  treatments: Doc<"treatments">[],
  userTimeZone: string
): Promise<string> => {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const regularFont = await pdfDoc.embedFont(base64ToUint8Array(nutoSansFont));
  const semiBoldFont = await pdfDoc.embedFont(
    base64ToUint8Array(nutoSansSemiBold)
  );

  let page = pdfDoc.addPage([600, 750]);
  let yOffset = 700;
  
  // Define consistent padding for all sections
  const PAGE_PADDING = 50;
  const CONTENT_WIDTH = 600 - (PAGE_PADDING * 2);

  const drawRTLText = (
    text: string,
    y: number,
    size: number,
    x: number,
    bold = false
  ) => {
    const font = bold ? semiBoldFont : regularFont;

    // For RTL text, we need to reverse the entire text visually
    // This is a completely different approach - treating the entire string as RTL
    const hasHebrew = /[\u0590-\u05FF]/.test(text);
    
    if (!hasHebrew) {
      // For Latin-only text, draw normally
      const textWidth = font.widthOfTextAtSize(text, size);
      page.drawText(text, {
        x: Math.min(x - textWidth, 600 - PAGE_PADDING - textWidth),
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      return;
    }
    
    // For RTL text (Hebrew), we need to reverse the word order
    // Split the text into words
    const words = text.split(/\s+/);
    const reversedWords = [...words].reverse();
    
    // Calculate total width for alignment
    let totalWidth = 0;
    for (let i = 0; i < reversedWords.length; i++) {
      totalWidth += font.widthOfTextAtSize(reversedWords[i], size);
      if (i < reversedWords.length - 1) {
        totalWidth += font.widthOfTextAtSize(" ", size);
      }
    }
    
    // Start position (right-aligned)
    let currentX = Math.min(x, 600 - PAGE_PADDING);
    currentX -= totalWidth;
    
    // Draw each word in the reversed order
    for (let i = 0; i < reversedWords.length; i++) {
      const word = reversedWords[i];
      
      // Draw the word
      page.drawText(word, {
        x: currentX,
        y,
        size,
        font,
        color: rgb(0, 0, 0),
      });
      
      // Move to next position
      currentX += font.widthOfTextAtSize(word, size);
      
      // Add space after word if not the last word
      if (i < reversedWords.length - 1) {
        const spaceWidth = font.widthOfTextAtSize(" ", size);
        currentX += spaceWidth;
      }
    }
  };

  const drawSeparator = () => {
    yOffset += 10;
    page.drawLine({
      start: { x: PAGE_PADDING, y: yOffset },
      end: { x: 600 - PAGE_PADDING, y: yOffset },
      thickness: 0.7,
      color: rgb(0, 0, 0),
    });
    yOffset -= 40;
  };

  const drawSectionHeader = (title: string) => {
    drawRTLText(title, yOffset, 20, 600 - PAGE_PADDING, true);
    yOffset -= 40;
  };

  const drawPersonalInfo = () => {
    const infoFontSize = 12;
    const lineHeight = 25;
    const labelValueGap = 10;

    const phoneLabel = patient.phone ? "טלפון" : "טלפון הורה";
    const phoneValue = patient.phone || patient.parent?.phone || "N/A";

    const personalInfo = [
      { label: "שם מלא", value: `${patient.firstName} ${patient.lastName}` },
      { label: "תעודת זהות", value: patient.idNumber },
      {
        label: "תאריך לידה",
        value: getClientDate(patient.dateOfBirth, userTimeZone),
      },
      {
        label: "מטופל מתאריך",
        value: getClientDate(patient._creationTime, userTimeZone),
      },
      { label: phoneLabel, value: phoneValue },
    ];

    personalInfo.forEach((info) => {
      drawRTLText(info.label, yOffset, infoFontSize, 600 - PAGE_PADDING, true);
      drawRTLText(info.value, yOffset, infoFontSize, 600 - PAGE_PADDING - 200 - labelValueGap);
      yOffset -= lineHeight;
    });

    yOffset -= 20;
  };

  const drawReportContent = (report: string) => {
    const sections = report.split(". ").map((s) => `${s.trim()}`);
    const contentFontSize = 12;
    const maxWidth = CONTENT_WIDTH;

    for (const section of sections) {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]);
        yOffset = 700;
      }

      // Calculate how many characters can fit in the available width
      const charsPerLine = Math.floor((maxWidth / contentFontSize) * 2); // Approximate RTL text fitting
      const words = section.split(" ");
      let currentLine = "";
      let lines = [];

      // Break text into lines that fit within the width
      for (const word of words) {
        if ((currentLine + " " + word).length <= charsPerLine) {
          currentLine += (currentLine ? " " : "") + word;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);

      // Draw each line
      for (const line of lines) {
        drawRTLText(line, yOffset, contentFontSize, 600 - PAGE_PADDING);
        yOffset -= 20;
      }
    }

    yOffset -= 20;
  };

  const drawTreatmentsTable = (treatments: Doc<"treatments">[]) => {
    if (treatments.length === 0) {
      drawRTLText("אין היסטוריית טיפולים", yOffset, 14, 600 - PAGE_PADDING, false);
      yOffset -= 30;
      return;
    }

    const totalTableWidth = CONTENT_WIDTH;
    const columnWidths = [80, 80, 150, totalTableWidth - 310];
    const rowHeight = 25;
    const fontSize = 10;
    const headers = ["תאריך", "עלות", "סוג", "תיאור"];
    const separatorMarginBottom = 10;

    // Draw table headers with proper padding
    headers.forEach((header, index) => {
      const headerX =
        600 -
        PAGE_PADDING -
        columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
      drawRTLText(header, yOffset, fontSize + 2, headerX, true);
    });

    yOffset -= 30;

    // Draw table content with proper padding
    page.drawLine({
      start: { x: PAGE_PADDING, y: yOffset + 15 },
      end: { x: 600 - PAGE_PADDING, y: yOffset + 15 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8),
    });

    yOffset -= separatorMarginBottom;

    treatments.forEach((treatment, index) => {
      if (yOffset < 50) {
        page = pdfDoc.addPage([600, 750]);
        yOffset = 700;
      }

      const rowValues = [
        getClientDate(treatment.date, userTimeZone),
        `${treatment.cost}₪`,
      ];

      rowValues.forEach((value, index) => {
        const valueX =
          600 -
          PAGE_PADDING -
          columnWidths.slice(0, index).reduce((a, b) => a + b, 0);
        drawRTLText(value, yOffset, fontSize, valueX);
      });

      const type = treatment.type || "";
      const typeX =
        600 -
        PAGE_PADDING -
        columnWidths.slice(0, 2).reduce((a, b) => a + b, 0);

      const typeWidth = columnWidths[2];
      const typeCharsPerLine = Math.floor((typeWidth / fontSize) * 2);
      const typeLines = type.match(new RegExp(`.{1,${typeCharsPerLine}}`, 'g')) || [type];

      let currentYOffset = yOffset;
      typeLines.forEach((line) => {
        drawRTLText(line, currentYOffset, fontSize, typeX);
        currentYOffset -= 12;
      });

      const description = treatment.description || "";
      const descriptionX =
        600 -
        PAGE_PADDING -
        columnWidths.slice(0, 3).reduce((a, b) => a + b, 0);

      const descriptionWidth = columnWidths[3];
      const descriptionCharsPerLine = Math.floor((descriptionWidth / fontSize) * 2);
      const descriptionLines = description.match(new RegExp(`.{1,${descriptionCharsPerLine}}`, 'g')) || [description];

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

      if (index !== treatments.length - 1) {
        page.drawLine({
          start: { x: PAGE_PADDING, y: yOffset - maxColumnHeight + 2 },
          end: {
            x: 600 - PAGE_PADDING,
            y: yOffset - maxColumnHeight + 2,
          },
          thickness: 1,
          color: rgb(0.8, 0.8, 0.8),
        });
      }

      yOffset -= maxColumnHeight + separatorMarginBottom + 10;
    });

    yOffset -= 20;
  };

  // Draw sections
  drawSectionHeader("פרטים כלליים");
  drawPersonalInfo();
  drawSeparator();

  const report = generateMedicalConditionReport(patient, {
    withInfoDetails: false,
  });
  drawSectionHeader('דו"ח רפואי');
  drawReportContent(report);
  drawSeparator();

  drawSectionHeader("היסטוריית טיפולים");
  drawTreatmentsTable(treatments);

  const pdfBytes = await pdfDoc.save();
  return toBase64(pdfBytes);
};