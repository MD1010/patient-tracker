import { Doc } from "../_generated/dataModel";

type MedicalReportOptions = {
  withInfoDetails?: boolean;
};

export const generateMedicalConditionReport = (
  patient: Doc<"patients">,
  { withInfoDetails = true }: MedicalReportOptions = {}
) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    conditions,
    smoking,
    otherAllergies,
    surgeries,
    medications,
    pregnancy,
    pregnancyWeek,
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

  const negativePhrases = [
    "אין",
    "לא ידוע",
    "לא נוטל",
    "ללא",
    "לא בוצע",
    "לא רלוונטי",
    "אין מידע",
  ];

  // Process conditions
  const existingConditions = Object.entries(conditions || {})
    .filter(([key, hasCondition]) => {
      if (key === "chemotherapy") {
        return (
          hasCondition &&
          conditions[key].hasOwnProperty("hasUndergoneTreatment") &&
          conditions[key].hasUndergoneTreatment === true
        );
      }
      return hasCondition;
    })
    .map(([key]) => (conditionDescriptions as any)[key]);

  // Start the report with the patient details
  let report = withInfoDetails
    ? `${firstName} ${lastName}, נולד ב-${new Date(
        dateOfBirth
      ).toLocaleDateString("he-IL")}. `
    : "";

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

  // Add allergies if they exist and are not negative
  if (
    otherAllergies &&
    !negativePhrases.some((phrase) => otherAllergies.includes(phrase))
  ) {
    report += `אלרגיות ידועות: ${otherAllergies}. `;
  }

  // Add surgeries if they exist and are not negative
  if (
    surgeries &&
    !negativePhrases.some((phrase) => surgeries.includes(phrase))
  ) {
    report += `ניתוחים שבוצעו בעבר: ${surgeries}. `;
  }

  // Add pregnancy information if applicable
  if (pregnancy) {
    if (pregnancyWeek) {
      report += `המטופלת בהריון, שבוע ${pregnancyWeek}. `;
    } else {
      report += "המטופלת בהריון. ";
    }
  }

  // Add medication information if applicable and not negative
  const medicationInfo = [];
  if (medications?.coumadin) medicationInfo.push("קומדין");

  if (
    medications?.otherMedications &&
    !negativePhrases.some((phrase) =>
      medications?.otherMedications.includes(phrase)
    )
  ) {
    medicationInfo.push(medications.otherMedications);
  }

  if (patient?.anesthesia) {
    medicationInfo.push("חומרי הרדמה");
  }

  if (medicationInfo.length > 0) {
    report += `המטופל נוטל את התרופות הבאות: ${medicationInfo.join(", ")}. `;
  }

  if (medications?.penicillinLatex) {
    report += "ישנה רגישות לפניצילין/לטקס. ";
  }

  // Add general note if no relevant details exist
  const hasRelevantInfo =
    existingConditions.length > 0 ||
    smoking ||
    (otherAllergies &&
      !negativePhrases.some((phrase) => otherAllergies.includes(phrase))) ||
    (surgeries &&
      !negativePhrases.some((phrase) => surgeries.includes(phrase))) ||
    medicationInfo.length > 0 ||
    pregnancy;

  if (!hasRelevantInfo) {
    report += "המטופל אינו סובל מבעיות רפואיות ידועות.";
  }

  return report;
};
