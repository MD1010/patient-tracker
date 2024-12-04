# patient-tracker


function generateMedicalConditionReport(data) {
    const { firstName, lastName, dateOfBirth, conditions, smoking, otherAllergies, surgeries, medications } = data;

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
        tuberculosis: "שחפת"
    };

    // Process conditions
    const existingConditions = Object.entries(conditions)
        .filter(([_, hasCondition]) => hasCondition)
        .map(([key]) => conditionDescriptions[key]);

    // Generate the report
    let report = `המטופל, ${firstName} ${lastName}, נולד ב-${new Date(dateOfBirth).toLocaleDateString("he-IL")}. `;
    if (existingConditions.length === 0) {
        report += "המטופל אינו סובל מבעיות רפואיות ידועות. ";
    } else {
        report += `המטופל סובל מהבעיות הרפואיות הבאות: ${existingConditions.join(", ")}. `;
    }

    // Add smoking status
    report += smoking ? "המטופל מעשן. " : "המטופל אינו מעשן. ";

    // Add allergies
    report += otherAllergies ? `אלרגיות ידועות: ${otherAllergies}. ` : "אין אלרגיות ידועות. ";

    // Add surgeries
    report += surgeries ? `ניתוחים שבוצעו בעבר: ${surgeries}. ` : "לא דווח על ניתוחים בעבר. ";

    // Add medication information
    const medicationInfo = [];
    if (medications.coumadin) medicationInfo.push("קומדין");
    if (medications.otherMedications) medicationInfo.push(medications.otherMedications);

    if (medicationInfo.length > 0) {
        report += `המטופל מטופל בתרופות הבאות: ${medicationInfo.join(", ")}. `;
    } else {
        report += "המטופל אינו מטופל בתרופות כלשהן. ";
    }

    return report;
}

// Example JSON input
const patientData = {
    anesthesia: false,
    cancerDetails: "",
    conditions: {
        aids: false,
        artificialValve: false,
        asthma: false,
        bloodClottingProblems: false,
        cancer: false,
        chemotherapy: false,
        diabetes: false,
        heartDefect: false,
        heartDisease: false,
        hepatitisB: false,
        hepatitisC: false,
        hypertension: false,
        kidneyDisease: false,
        neurologicalProblems: false,
        osteoporosis: false,
        pacemaker: false,
        psychiatricProblems: false,
        thyroidProblems: false,
        tuberculosis: false
    },
    createdAt: "2024-12-03T18:23:53.352Z",
    dateOfBirth: "2015-04-14T21:00:00.000Z",
    firstName: "יחלי׳ג",
    idNumber: "000000000",
    lastName: "כמחלד",
    lastTreatmentDate: "2024-11-30T22:00:00.000Z",
    medications: {
        coumadin: false,
        otherMedications: "",
        penicillinLatex: false
    },
    otherAllergies: "",
    phone: "0520000000",
    pregnancy: false,
    pregnancyWeek: "",
    smoking: false,
    surgeries: ""
};

// Generate and print the medical condition report
console.log(generateMedicalConditionReport(patientData));