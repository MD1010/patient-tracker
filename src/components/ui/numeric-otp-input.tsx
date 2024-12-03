import { cn } from "@/lib/utils";
import React, { forwardRef, useRef } from "react";
import { Input } from "./input";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  isPhoneNumber?: boolean; // New optional prop for dashes
}

export const NumericOTPInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, error, isPhoneNumber: withDashes = false, ...props }) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Ensure the value is always 10 characters long with "_" placeholders
    const segments = value.padEnd(10, "_").split("");


    const handleSegmentChange = (index: number, newValue: string) => {
      if (/^\d$/.test(newValue)) {
        const newSegments = [...segments];
        newSegments[index] = newValue;
        const newPhone = newSegments.join("");
        onChange(newPhone);

        // Auto-advance to the next input field
        if (index < 9) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      const newSegments = [...segments];

      if (e.key === "Backspace") {
        if (newSegments[index] === "_" && index > 0) {
          // Navigate to the previous input and clear it
          newSegments[index - 1] = "_";
          inputRefs.current[index - 1]?.focus();
        } else {
          // Clear the current input
          newSegments[index] = "_";
        }
        onChange(newSegments.join(""));
      } else if (e.key === "ArrowLeft" && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (e.key === "ArrowRight" && index < 9) {
        inputRefs.current[index + 1]?.focus();
      }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 10);
      onChange(pastedData.padEnd(10, "_"));
    };

    return (
      <div dir="ltr" className={cn("flex gap-2 items-center rounded-md", className)}>
        <div className="flex gap-1">
          {/* First 3 digits (area code) */}
          <div className="flex gap-1.5">
            {segments.slice(0, 3).map((digit, i) => (
              <Input
                key={i}
                ref={(el) => (inputRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit === "_" ? "" : digit}
                onChange={(e) => handleSegmentChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                autoComplete="new-password"
                className={cn(
                  `w-7 h-8 text-center p-1 text-foreground font-semibold text-[1rem]`,
                  error && "ring-2 ring-destructive"
                )}
                {...props}
              />
            ))}
          </div>

          {/* Optional Dash */}
          {withDashes && <span className="text-muted-foreground mx-1">-</span>}

          {/* Middle 3 digits */}
          <div className="flex gap-1.5">
            {segments.slice(3, 10).map((digit, i) => (
              <Input
                key={i + 3}
                ref={(el) => (inputRefs.current[i + 3] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit === "_" ? "" : digit}
                onChange={(e) => handleSegmentChange(i + 3, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i + 3, e)}
                onPaste={handlePaste}
                autoComplete="new-password"
                className={cn(
                  `w-7 h-8 text-center p-1 text-foreground font-semibold text-[1rem]`,
                  error && "ring-2 ring-destructive"
                )}
                {...props}
              />
            ))}
          </div>

        
        </div>
      </div>
    );
  }
);

NumericOTPInput.displayName = "PhoneInput";