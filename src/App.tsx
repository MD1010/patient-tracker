import { ClerkLoaded } from '@clerk/clerk-react';
import { Header } from "./components/Header";
import { PatientDashboard } from "./components/ManagePatients/PatientDashboard";
import { ModalProvider } from "./components/ModalProvider";

export const App = () => {
  return (
    <ClerkLoaded>
      <Header />
      <main className="container mx-auto p-8">
        <PatientDashboard />
        <ModalProvider />
      </main>
    </ClerkLoaded>
  );
};
