import { deleteSegment, formatDateInput } from "@/lib/date";
import { cn } from "@/lib/utils";
import { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";

interface DateInputProps {
  id?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  className?: string;
}

export function DateInput({
  id,
  onChange,
  disabled,
  dir = "ltr",
  className,
}: DateInputProps) {
  const [inputValue, setInputValue] = useState("");

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = formatDateInput(e.target.value);
      setInputValue(newValue);

      if (newValue.length === 10) {
        const [day, month, year] = newValue.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          onChange?.(date);
        }
      } else if (newValue.length === 0) {
        onChange?.(undefined);
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;

      if (e.key === "Backspace" || e.key === "Delete") {
        if (
          input.selectionStart === 0 &&
          input.selectionEnd === inputValue.length
        ) {
          // If the user selects all and deletes, clear the entire input
          e.preventDefault();
          setInputValue("");
          onChange?.(undefined);
          return;
        }

        e.preventDefault();
        const newValue = deleteSegment(inputValue, input.selectionStart || 0);
        setInputValue(newValue);
        if (newValue.length === 0) {
          onChange?.(undefined);
        }
      }
    },
    [inputValue, onChange]
  );

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="תאריך לידה"
        maxLength={10}
        disabled={disabled}
        dir={dir}
        className={cn(dir === "rtl" && "px-10", className)}
      />
      <CalendarIcon
        className={cn(
          "absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground",
          dir === "ltr" ? "left-3" : "right-3"
        )}
      />
    </div>
  );
}
