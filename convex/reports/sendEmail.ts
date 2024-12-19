import axios from "axios";
import { Doc } from "../_generated/dataModel";
import { createAndEncodePDF } from "./generatePdf";

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
