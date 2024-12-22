import { Input } from "@/components/ui/input";
import { deleteSegment, formatDateInput } from "@/lib/date";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useCallback, useState } from "react";

interface DateInputProps {
  id?: string;
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  onBlur?: () => void;
  disabled?: boolean;
  dir?: "ltr" | "rtl";
  className?: string;
}

export function DateInput({
  id,
  value,
  onChange,
  onBlur,
  disabled,
  dir = "ltr",
  className,
  ...props
}: DateInputProps) {
  const [inputValue, setInputValue] = useState(
    value ? format(value, "dd/MM/yyyy") : ""
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = formatDateInput(e.target.value);
      setInputValue(newValue);

      if (newValue.length === 10) {
        const [day, month, year] = newValue.split("/").map(Number);
        const date = new Date(year, month - 1, day);
        onChange?.(date);
      } else {
        // set invalid date
        onChange?.(new Date(""));
      }
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const input = e.currentTarget;

      if (e.key === "Backspace") {
        e.preventDefault();

        const selectionStart = input.selectionStart || 0;
        const selectionEnd = input.selectionEnd || 0;

        // Handle select-all deletion
        if (selectionStart === 0 && selectionEnd === inputValue.length) {
          setInputValue("");
          onChange?.(undefined);
          return;
        }

        let newValue = inputValue;

        if (selectionStart !== selectionEnd) {
          // Delete the selected range
          newValue =
            inputValue.slice(0, selectionStart) +
            inputValue.slice(selectionEnd);
        } else if (selectionStart > 0) {
          // Handle single character deletion
          newValue = deleteSegment(inputValue, selectionStart);
        }

        // Update the input value
        setInputValue(newValue);

        // Fire onChange with the updated value
        if (newValue.length === 0) {
          onChange?.(undefined);
        } else {
          const [day, month, year] = newValue.split("/").map(Number);
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            onChange?.(date);
          } else {
            onChange?.(undefined);
          }
        }
      }
    },
    [inputValue, onChange]
  );

  const handleBlur = useCallback(() => {
    const [day, month, year] = inputValue.split("/").map((seg) => seg || "");

    if (year && year.length > 0 && year.length < 4) {
      const paddedYear = year.padStart(4, "0");
      const paddedValue = `${day}/${month}/${paddedYear}`;
      setInputValue(paddedValue);
    }
    if (+year < 1901) {
      onChange?.(new Date(""));
    }

    if (onBlur) {
      onBlur();
    }
  }, [inputValue, onChange, onBlur]);

  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        inputMode="numeric"
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder="הקלד תאריך"
        maxLength={10}
        disabled={disabled}
        dir="ltr"
        className={cn(
          dir === "rtl" ? "px-10 text-right placeholder:text-right" : "px-10",
          className
        )}
        {...props}
        value={inputValue}
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
