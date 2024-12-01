import { ThemeProvider } from 'next-themes';
import { PatientSearch } from '@/components/PatientSearch';
import { PatientList } from '@/components/PatientList';
import { PatientModal } from '@/components/PatientModal';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AddPatientDialog } from '@/components/AddPatientDialog';
import { Toaster } from '@/components/ui/sonner';
import { Stethoscope } from 'lucide-react';
import { translations } from '@/lib/translations';

function App() {
  return (
    <ThemeProvider defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background" dir="rtl">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 space-x-reverse">
                <Stethoscope className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold">{translations.appName}</h1>
              </div>
              <div className="flex items-center space-x-4 space-x-reverse">
                <AddPatientDialog />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <PatientSearch />
            <PatientList />
            <PatientModal />
          </div>
        </main>
      </div>
      <Toaster dir="rtl" position="top-left" />
    </ThemeProvider>
  );
}

export default App;