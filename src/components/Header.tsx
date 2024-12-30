import { useModal } from "@/store/modal-store";
import { useClerk } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { LogOutIcon, PlusIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";

export function Header() {
  const { openModal } = useModal();
  const { signOut } = useClerk();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* <Stethoscope className="h-8 w-8 text-primary" /> */}
            {/* <h1 className="text-2xl font-bold"></h1> */}
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <Button
              variant="default"
              onClick={() => openModal("addOrEditPatient", {})}
              className="flex items-center hover:shadow-sm "
            >
              <span className="font-bold -mx-1">הוספת מטופל</span>
              <PlusIcon strokeWidth={4} />
            </Button>
            <ThemeToggle />

            {/* <SignOutButton> */}
            <Button variant={"outline"} size={"icon"} onClick={handleSignOut}>
              <LogOutIcon />
            </Button>
            {/* </SignOutButton> */}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
