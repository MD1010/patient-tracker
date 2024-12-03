import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { DatePicker } from "./ui/date-picker";
import { he } from "date-fns/locale";

export function AddTreatmentDialog({
  patientId,
}: {
  patientId: Id<"patients">;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({
    type: "",
    description: "",
    cost: "",
    nextAppointment: "",
    notes: "",
  });

  const addTreatment = useMutation(api.treatments.add);

  const handleSubmit = async () => {
    await addTreatment({
      patientId,
      cost: +form.cost,
      date: new Date().toISOString(),
      description: form.description,
      type: form.type,
      notes: form.notes,
      nextAppointment: form.nextAppointment,
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        הוסף טיפול
      </Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg px-12 pt-6 ">
          <DialogHeader>
            <DialogTitle className="text-right text-xl p-2">
              הוסף טיפול
            </DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4 flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <Input
              placeholder="סוג"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              required
            />
            <Textarea
              placeholder="תיאור"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <Textarea
              placeholder="הערות"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
            <Input
              type="number"
              placeholder="עלות"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              required
            />

            <DatePicker
              fromDate={new Date()}
              date={form.nextAppointment}
              onDateChange={(date) => {

                setForm({
                  ...form,
                  nextAppointment: date ? new Date(date).toISOString() : "",
                });
              }}
              locale={he}
              className={`w-full justify-start text-right h-10 p-2`}
            />
            
            <Button type="submit" className="w-full">
              שמור
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
