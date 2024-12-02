import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../MedicalRegistrationForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

interface PersonalDetailsProps {
  form: UseFormReturn<FormData>;
}

export function PersonalDetails({ form }: PersonalDetailsProps) {
  const { register, setValue, watch } = form;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="firstName">שם פרטי</Label>
          <Input id="firstName" {...register('firstName', { required: true })} />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">שם משפחה</Label>
          <Input id="lastName" {...register('lastName', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label>תאריך לידה</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-right"
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {watch('dateOfBirth') ? (
                  format(watch('dateOfBirth')!, 'PP', { locale: he })
                ) : (
                  <span>בחר תאריך</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch('dateOfBirth')}
                onSelect={(date) => setValue('dateOfBirth', date)}
                locale={he}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="idNumber">תעודת זהות</Label>
          <Input
            id="idNumber"
            {...register('idNumber', {
              required: true,
              pattern: /^\d{9}$/,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">טלפון</Label>
          <Input
            id="phone"
            {...register('phone', {
              required: true,
              pattern: /^[0-9-]+$/,
            })}
          />
        </div>

        <div className="space-y-2">
          <Label>תאריך טיפול אחרון</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-right"
              >
                <CalendarIcon className="ml-2 h-4 w-4" />
                {watch('lastTreatmentDate') ? (
                  format(watch('lastTreatmentDate')!, 'PP', { locale: he })
                ) : (
                  <span>בחר תאריך</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={watch('lastTreatmentDate')}
                onSelect={(date) => setValue('lastTreatmentDate', date)}
                locale={he}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
}