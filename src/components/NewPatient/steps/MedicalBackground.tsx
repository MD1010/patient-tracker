import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../MedicalRegistrationForm';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface MedicalBackgroundProps {
  form: UseFormReturn<FormData>;
}

export function MedicalBackground({ form }: MedicalBackgroundProps) {
  const { register, watch, setValue } = form;

  const conditions = [
    { id: 'diabetes', label: 'סכרת' },
    { id: 'osteoporosis', label: 'אוסטואופורוזיס' },
    { id: 'asthma', label: 'אסתמה' },
    { id: 'thyroidProblems', label: 'בעיות בבלוטת התריס' },
    { id: 'bloodClottingProblems', label: 'בעיות בקרישת דם' },
    { id: 'hepatitisB', label: 'צהבת B' },
    { id: 'hepatitisC', label: 'צהבת C' },
    { id: 'aids', label: 'איידס' },
    { id: 'hypertension', label: 'יתר לחץ דם' },
    { id: 'heartDisease', label: 'מחלות לב' },
    { id: 'artificialValve', label: 'מסתם מלאכותי' },
    { id: 'pacemaker', label: 'קוצב לב' },
    { id: 'heartDefect', label: 'מום לב' },
    { id: 'tuberculosis', label: 'שחפת' },
    { id: 'kidneyDisease', label: 'מחלות כליות' },
    { id: 'neurologicalProblems', label: 'בעיות נוירולוגיות' },
    { id: 'psychiatricProblems', label: 'בעיות פסיכיאטריות' },
    { id: 'cancer', label: 'סרטן' },
    { id: 'chemotherapy', label: 'כימותרפיה/הקרנות' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {conditions.map((condition) => (
          <div key={condition.id} className="flex items-center space-x-2">
            <Checkbox
              id={condition.id}
              checked={watch(condition.id as keyof FormData) as boolean}
              onCheckedChange={(checked) =>
                setValue(condition.id as keyof FormData, checked)
              }
            />
            <Label htmlFor={condition.id}>{condition.label}</Label>
          </div>
        ))}
      </div>

      {watch('cancer') && (
        <div className="space-y-2">
          <Label htmlFor="cancerDetails">פירוט סרטן</Label>
          <Input id="cancerDetails" {...register('cancerDetails')} />
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Label htmlFor="pregnancy">הריון</Label>
        <Switch
          id="pregnancy"
          checked={watch('pregnancy')}
          onCheckedChange={(checked) => setValue('pregnancy', checked)}
        />
        {watch('pregnancy') && (
          <div className="flex items-center space-x-2">
            <Label htmlFor="pregnancyWeek">שבוע</Label>
            <Input
              id="pregnancyWeek"
              className="w-20"
              {...register('pregnancyWeek')}
            />
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="smoking">עישון</Label>
        <Switch
          id="smoking"
          checked={watch('smoking')}
          onCheckedChange={(checked) => setValue('smoking', checked)}
        />
      </div>
    </div>
  );
}