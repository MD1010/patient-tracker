import { ClerkLoaded } from "@clerk/clerk-react";
import { Header } from "./components/Header";
import { PatientDashboard } from "./components/ManagePatients/PatientDashboard";
import { ModalProvider } from "./components/ModalProvider";
import useAppUser from "./hooks/use-user";
import { useUsersStore } from "./store/user-store";
import { useEffect } from "react";
import { useModal } from "./store/modal-store";
import { useQuery } from "convex/react";
import { useSearchParams } from "react-router-dom";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";

export const App = () => {
  const { setActiveUser } = useUsersStore();
  const user = useAppUser();
  const { openModal } = useModal();
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract query parameters
  const googleAuth = searchParams.get("googleAuth");
  const patientId = searchParams.get("patientId") as Id<"patients">;

  const patient = useQuery(api.patients.getOne, {
    patientId: patientId || undefined,
  });

  /**
 * 
 * {
  accessToken:
    "ya29.a0ARW5m76PrR1wI10OpWw9GHUS8Nize7VgiNrSOfQrdSxMPl4Vu6zze0WA7iJ-sZQ0AjZeWMzetFXKRHjndPTrKqqyUdFz0YuAVaEWQ_GMCrplWHyMkcn4f6mSzYNUz6-fpxtytWXExJ3E5CH8k147Gv8XTPw-EDLfOwGPkl9kaCgYKAXYSARISFQHGX2Mi7NZJoznrlOblXPxusiKFQQ0175",
  expiryDate: 1735967828352,
  refreshToken:
    "1//038XAr_M4Ys7ECgYIARAAGAMSNwF-L9IrcrL5asYS2URXztkHilFDcW5H7PSXCM5gbLKLg7CkCs5fndfGBwB1j7I3-mbnLkKlNqE",
}
 */
  useEffect(() => {
    if (googleAuth === "success" && patient) {
      setTimeout(() => {
        const currentParams = Object.fromEntries(searchParams.entries());
        delete currentParams.googleAuth;
        delete currentParams.patientId;
        setSearchParams(currentParams);
        openModal("addOrEditNextTreatment", { selectedPatient: patient });
      }, 400);
    }
  }, [googleAuth, patient]);

  useEffect(() => {
    if (user?.authToken) {
      setActiveUser(user);
    }
  }, [user?.authToken, user?.googleAccessToken]);

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
