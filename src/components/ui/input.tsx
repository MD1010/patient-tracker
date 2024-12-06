import * as React from "react";
import { cn, formatCurrency, parseCurrencyInput } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  error?: boolean;
  variant?: "default" | "currency";
  currencySymbol?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, startIcon, endIcon, error, variant = "default", currencySymbol, onChange, value = "", dir = "ltr", ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string | undefined>(undefined);

    React.useEffect(() => {
      if (variant === "currency" && !!value) {
        const formattedValue = formatCurrency(value.toString());
        setDisplayValue(formattedValue || "");
      } else {
        setDisplayValue(value as string);
      }
    }, [value, variant]);

    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (variant === "currency") {
        const rawValue = parseCurrencyInput(newValue);
        setDisplayValue(formatCurrency(rawValue));
        onChange?.(Object.assign({}, e, { target: { ...e.target, value: rawValue } }));
      } else {
        setDisplayValue(newValue);
        onChange?.(e);
      }
    };

    const symbolClass = dir === "rtl" ? "left-3" : "right-3";
    const paddingClass = dir === "rtl" ? "pl-10" : "pr-10";
    const inputClass = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
      startIcon && !currencySymbol && "pl-10",
      endIcon && !currencySymbol && "pr-10",
      variant === "currency" && paddingClass,
      error && "border-destructive focus-visible:ring-destructive",
      "rtl:text-right",
      className
    );

    return (
      <div className="relative">
        {startIcon && !currencySymbol && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {startIcon}
          </div>
        )}

        <input
          type={type}
          className={inputClass}
          ref={ref}
          value={displayValue}
          onChange={handleCurrencyChange}
          dir={dir}
          {...props}
        />

        {endIcon && !currencySymbol && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {endIcon}
          </div>
        )}

        {variant === "currency" && currencySymbol && (
          <span className={`absolute ${symbolClass} top-1/2 -translate-y-1/2 text-gray-500`}>
            {currencySymbol}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };