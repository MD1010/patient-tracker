import * as React from "react";
import { Input } from "@/components/ui/input"; // Import the Input from ShadCN
import { cn, formatCurrency, parseCurrencyInput } from "@/lib/utils";

export interface CurrencyInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  currencySymbol?: string;
  value?: string | number;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error?: boolean;
  dir?: "ltr" | "rtl";
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      className,
      currencySymbol = "$",
      value = "",
      onChange,
      dir = "ltr",
      error,
      ...props
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = React.useState<string>("");

    React.useEffect(() => {
      if (value !== undefined) {
        const formattedValue = formatCurrency(value.toString());
        setDisplayValue(formattedValue || "");
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = parseCurrencyInput(e.target.value);
      if (rawValue) setDisplayValue(formatCurrency(rawValue));
      if (onChange) {
        e.target.value = rawValue; // Update the event's value with the raw value
        onChange(e); // Pass the updated event to the parent
      }
    };

    const symbolClass = dir === "rtl" ? "left-3" : "right-3";
    const paddingClass = dir === "rtl" ? "pl-10" : "pr-10";

    return (
      <div className="relative">
        <Input
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          className={cn(
            "pr-10", // Default padding for currency symbol
            dir === "rtl" && "text-right",
            paddingClass,
            error && "border-destructive focus:ring-destructive",
            className
          )}
          {...props}
        />
        <span
          className={`absolute ${symbolClass} top-1/2 -translate-y-1/2 text-muted-foreground`}
        >
          {currencySymbol}
        </span>
      </div>
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

export { CurrencyInput };
