import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import * as z from "zod";

const formSchema = z.object({
  name: z.string().min(2, "נא להזין שם מלא"),
  email: z.string().email("כתובת אימייל לא תקינה"),
  phone: z.string().min(9, "מספר טלפון לא תקין"),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "תאריך לא תקין"),
  allergies: z.string().optional(),
  medications: z.string().optional(),
  medicalConditions: z.string().optional(),
  lastDentalVisit: z.string().optional(),
  concerns: z.string().optional(),
});

export function RegistrationForm() {
  const navigate = useNavigate();
  const addPatient = useMutation(api.patients.add);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      allergies: "",
      medications: "",
      medicalConditions: "",
      lastDentalVisit: "",
      concerns: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const medicalInfo = {
        allergies: values.allergies,
        medications: values.medications,
        medicalConditions: values.medicalConditions,
        lastDentalVisit: values.lastDentalVisit,
        concerns: values.concerns,
      };

      await addPatient({
        name: values.name,
        email: values.email,
        phone: values.phone,
        dateOfBirth: values.dateOfBirth,
        medicalInfo: JSON.stringify(medicalInfo),
      });

      form.reset();
      navigate("/registration-success");
    } catch (error) {
      toast.error("שגיאה בתהליך הרישום");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8" dir="rtl">
      <Helmet>
        <title>טופס רישום לשיננית</title>
      </Helmet>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">טופס רישום למרפאת שיניים</h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>שם מלא</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>דואר אלקטרוני</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>טלפון</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תאריך לידה</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        min="1900-01-01"
                        max={new Date().toISOString().split("T")[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">שאלון רפואי</h2>
              <FormField
                control={form.control}
                name="allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>אלרגיות</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תרופות קבועות</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="medicalConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>מצבים רפואיים</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastDentalVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ביקור אחרון אצל רופא שיניים</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        min="1900-01-01"
                        max={new Date().toISOString()}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="concerns"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>תלונות עיקריות / בעיות</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full">
              שליחת טופס
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
