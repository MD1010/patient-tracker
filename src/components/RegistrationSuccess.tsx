import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function RegistrationSuccess() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-card p-8 rounded-lg shadow-lg text-center space-y-6"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        </motion.div>
        
        <h1 className="text-2xl font-bold">תודה על ההרשמה!</h1>
        <p className="text-muted-foreground">
          פרטיך נקלטו בהצלחה במערכת.
        </p>
        
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => window.close()}
        >
          סגור חלון
        </Button>
      </motion.div>
    </div>
  );
}