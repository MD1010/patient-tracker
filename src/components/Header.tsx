import { useModal } from "@/store/modal-store";
import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "./ui/button";
import { BookText, BookUser, PlusIcon } from 'lucide-react';
import { IdCardIcon } from '@radix-ui/react-icons';

export function Header() {
  const { openModal } = useModal();
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
              onClick={() => openModal("addOrEditPatient")}
              className="flex items-center hover:shadow-sm "
            >
              <span className="font-bold -mx-1">הוספת מטופל</span>
              <PlusIcon strokeWidth={4}/>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
