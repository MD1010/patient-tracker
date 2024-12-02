import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"; // Assumes you're using a modal component library
import { useState } from "react";
import { PlusIcon } from "lucide-react";
import { MedicalRegistrationForm } from './MedicalRegistrationForm';

export function AddNewPatient() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen((prev) => !prev);

  return (
    <div className="flex flex-col items-center space-y-4">
      <Button
        variant="outline"
        onClick={toggleModal}
        className="flex items-center"
      >
        <span className="ml-1">הוספת מטופל</span>
        <PlusIcon className="w-4 h-4" />
      </Button>
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className='text-right pr-6 mt-4'>הוספת מטופל</DialogTitle>
              <DialogClose onClick={toggleModal} />
            </DialogHeader>
            <MedicalRegistrationForm />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
