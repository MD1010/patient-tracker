import { motion } from "framer-motion";
import { PatientData } from "./PatientData";
import { PatientTable } from "./PatientsTable/PatientsTable";

export function PatientDashboard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 !overflow-auto"
    >
      <h1 className="text-3xl font-bold mb-8 text-right">ניהול מטופלים</h1>
      <PatientTable />
      <PatientData />
    </motion.div>
  );
}
