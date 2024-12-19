import { Toaster } from "@/components/ui/sonner";
import { useAction } from "convex/react";
import { ThemeProvider } from "next-themes";
import { api } from "../convex/_generated/api";
import { Header } from "./components/Header";
import { PatientDashboard } from "./components/ManagePatients/PatientDashboard";
import { ModalProvider } from "./components/ModalProvider";
import { Button } from "./components/ui/button";

function App() {
  const sendEmail = useAction(api.patients.sendEmailWithAttachment);

  return (
    <ThemeProvider enableSystem defaultTheme="dark" attribute="class">
      <div className="min-h-screen bg-background" dir="rtl">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <PatientDashboard />
          <ModalProvider />
        </main>
      </div>
      <Toaster dir="rtl" position="top-left" />
    </ThemeProvider>
  );
}

export default App;
