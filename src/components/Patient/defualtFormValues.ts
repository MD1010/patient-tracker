import { Doc } from "../../../convex/_generated/dataModel";

type RequiredFields =
  | "_id"
  | "firstName"
  | "lastName"
  | "_creationTime"
  | "dateOfBirth"
  | "idNumber"
  | "isAdult";

export default {
  anesthesia: false,
  pregnancy: false,
  smoking: false,
  cancerDetails: "",
  conditions: {
    diabetes: false,
    osteoporosis: false,
    asthma: false,
    thyroidProblems: false,
    bloodClottingProblems: false,
    hepatitisB: false,
    hepatitisC: false,
    aids: false,
    hypertension: false,
    heartDisease: false,
    artificialValve: false,
    pacemaker: false,
    heartDefect: false,
    tuberculosis: false,
    kidneyDisease: false,
    neurologicalProblems: false,
    psychiatricProblems: false,
    chemotherapy: {
      hasUndergoneTreatment: false
    },
    cancer: false,
  },
  otherAllergies: "",
  surgeries: "",
  medications: {
    coumadin: false,
    otherMedications: "",
    penicillinLatex: false,
  },
  nextTreatment: null,
  phone: null,
  nextTreatmentRecallDate: null,
} satisfies Omit<Doc<"patients">, RequiredFields>;
