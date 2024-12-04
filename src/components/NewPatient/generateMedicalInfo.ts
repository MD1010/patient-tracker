import { Doc } from "../../../convex/_generated/dataModel";

export const generateMedicalConditionReport = (patient: Doc<"patients">) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    conditions,
    smoking,
    otherAllergies,
    surgeries,
    medications,
  } = patient;

  const conditionDescriptions = {
    aids: "איידס",
    artificialValve: "שסתום מלאכותי",
    asthma: "אסתמה",
    bloodClottingProblems: "בעיות בקרישת דם",
    cancer: "סרטן",
    chemotherapy: "כימותרפיה",
    diabetes: "סוכרת",
    heartDefect: "מום לב",
    heartDisease: "מחלת לב",
    hepatitisB: "צהבת B",
    hepatitisC: "צהבת C",
    hypertension: "יתר לחץ דם",
    kidneyDisease: "מחלת כליות",
    neurologicalProblems: "בעיות נוירולוגיות",
    osteoporosis: "אוסטאופורוזיס",
    pacemaker: "קוצב לב",
    psychiatricProblems: "בעיות פסיכיאטריות",
    thyroidProblems: "בעיות בבלוטת התריס",
    tuberculosis: "שחפת",
  };

  // Process conditions
  const existingConditions = Object.entries(conditions)
    .filter(([_, hasCondition]) => hasCondition)
    .map(([key]) => (conditionDescriptions as any)[key]);

  // Start the report with the patient details
  let report = `${firstName} ${lastName}, נולד ב-${new Date(
    dateOfBirth
  ).toLocaleDateString("he-IL")}. `;

  // Add medical conditions if they exist
  if (existingConditions.length > 0) {
    report += `המטופל סובל מהבעיות הרפואיות הבאות: ${existingConditions.join(
      ", "
    )}. `;
  }

  // Add smoking status if applicable
  if (smoking) {
    report += "המטופל מעשן. ";
  }

  // Add allergies if they exist
  if (otherAllergies) {
    report += `אלרגיות ידועות: ${otherAllergies}. `;
  }

  // Add surgeries if they exist
  if (surgeries) {
    report += `ניתוחים שבוצעו בעבר: ${surgeries}. `;
  }

  // Add medication information if applicable
  const medicationInfo = [];
  if (medications.coumadin) medicationInfo.push("קומדין");
  if (medications.otherMedications) medicationInfo.push(medications.otherMedications);

  if (medicationInfo.length > 0) {
    report += `המטופל מטופל בתרופות הבאות: ${medicationInfo.join(", ")}. `;
  }

  // Add general note if no relevant details exist
  const hasRelevantInfo =
    existingConditions.length > 0 || smoking || otherAllergies || surgeries || medicationInfo.length > 0;

  if (!hasRelevantInfo) {
    report += "המטופל אינו סובל מבעיות רפואיות ידועות.";
  }

  return report;
};