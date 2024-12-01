import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { Id } from '../convex/_generated/dataModel';
import { toast } from 'sonner';
import { format } from 'date-fns';

const formSchema = z.object({
  type: z.string().min(2, 'נא להזין סוג טיפול'),
  description: z.string().min(5, 'נא להזין תיאור מפורט יותר'),
  cost: z.string().transform(Number),
  nextAppointment: z.string().optional(),
  notes: z.string().optional(),
});

interface TreatmentDialogProps {
  patientId: Id<'patients'>;
}

export function TreatmentDialog({ patientId }: TreatmentDialogProps) {
  const [open, setOpen] = useState(false);
  const addTreatment = useMutation(api.treatments.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: '',
      description: '',
      cost: '',
      nextAppointment: '',
      notes: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addTreatment({
        patientId,
        type: values.type,
        description: values.description,
        date: format(new Date(), 'yyyy-MM-dd'),
        cost: Number(values.cost),
        nextAppointment: values.nextAppointment,
        notes: values.notes,
      });
      toast.success('הטיפול נוסף בהצלחה');
      setOpen(false);
      form.reset();
    } catch (error) {
      toast.error('שגיאה בהוספת הטיפול');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>הוספת טיפול חדש</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rtl">
        <DialogHeader>
          <DialogTitle>הוספת טיפול חדש</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>סוג טיפול</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תיאור הטיפול</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>עלות</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nextAppointment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>תור הבא</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>הערות</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              הוספת טיפול
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}