
import { motion } from 'framer-motion';
import { PatientTable } from './PatientsTable/PatientsTable';
import { PatientData } from './PatientData';

export function PatientDashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
       <h1 className="text-3xl font-bold mb-8 text-right">ניהול מטופלים</h1>
       <PatientTable />
      <PatientData />
    </motion.div>
  );
}