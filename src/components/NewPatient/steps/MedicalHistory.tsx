import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../MedicalRegistrationForm';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';

interface MedicalHistoryProps {
  form: UseFormReturn<FormData>;
}

export function MedicalHistory({ form }: MedicalHistoryProps) {
  const { register, watch, setValue } = form;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="medications">תרופות קבועות</Label>
        <Textarea id="medications" {...register('medications')} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="surgeries">ניתוחים/אשפוזים</Label>
        <Textarea id="surgeries" {...register('surgeries')} />
      </div>

      <div className="flex items-center space-x-4">
        <Label htmlFor="coumadin">האם הנך נוטל קומדין</Label>
        <Switch
          id="coumadin"
          checked={watch('coumadin')}
          onCheckedChange={(checked) => setValue('coumadin', checked)}
        />
      </div>

      <div className="space-y-4">
        <Label>אלרגיות</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="penicillinLatex"
              checked={watch('penicillinLatex')}
              onCheckedChange={(checked) =>
                setValue('penicillinLatex', !!checked)
              }
            />
            <Label htmlFor="penicillinLatex">פניצילין / לטקס</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="anesthesia"
              checked={watch('anesthesia')}
              onCheckedChange={(checked) =>
                setValue('anesthesia', !!checked)
              }
            />
            <Label htmlFor="anesthesia">חומרי הרדמה</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="otherAllergies">אחר</Label>
            <Input id="otherAllergies" {...register('otherAllergies')} />
          </div>
        </div>
      </div>
    </div>
  );
}