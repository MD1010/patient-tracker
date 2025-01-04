import { ClerkLoaded } from "@clerk/clerk-react";
import { Header } from "./components/Header";
import { PatientDashboard } from "./components/ManagePatients/PatientDashboard";
import { ModalProvider } from "./components/ModalProvider";
import useAppUser from "./hooks/use-user";
import { useUsersStore } from "./store/user-store";
import { useEffect } from "react";

export const App = () => {
  const { setActiveUser } = useUsersStore();
  const user = useAppUser();

  useEffect(() => {
    if (user?.authToken) {
      setActiveUser(user);
    }
  }, [user?.authToken, user?.googleTokens]);

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
