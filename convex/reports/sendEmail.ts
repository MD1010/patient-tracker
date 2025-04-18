import axios from "axios";
import { Doc } from "../_generated/dataModel";
import { generatePatientInfoPdf } from "./generatePdf";

export const sendEmailWithPDF = async ({
  patient,
  treatments,
  userTimeZone,
  user
}: {
  patient: Doc<"patients">;
  treatments: Doc<"treatments">[];
  user: Doc<"users">;
  userTimeZone: string;
}) => {
  const pdfBase64 = await generatePatientInfoPdf(
    patient,
    treatments,
    userTimeZone
  );

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
            Email: user.email,
            Name: "Michael",
          },
        ],
        Subject: ` ${patient.firstName} ${patient.lastName} ת.ז ${patient.idNumber}`,
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
