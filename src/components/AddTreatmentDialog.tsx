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
    date: new Date().toISOString(),
    nextAppointment: "",
  });

  const addTreatment = useMutation(api.treatments.add);

  const handleSubmit = async () => {
    await addTreatment({
      patientId,
      cost: +form.cost,
      date: form.date,
      description: form.description,
      type: form.type,
    });
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>הוסף טיפול</Button>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף טיפול</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
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
            <Input
              type="number"
              placeholder="עלות"
              value={form.cost}
              onChange={(e) => setForm({ ...form, cost: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="תאריך"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
            <Input
              type="date"
              placeholder="תור הבא"
              value={form.nextAppointment}
              onChange={(e) =>
                setForm({ ...form, nextAppointment: e.target.value })
              }
            />
            <Button type="submit">שמור</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
