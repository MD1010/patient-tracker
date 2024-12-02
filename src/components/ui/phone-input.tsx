import React, { useRef, useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface PhoneInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, className, error, ...props }, ref) => {
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Split phone number into segments
    const segments = value.padEnd(10, "_").split("");

    const handleSegmentChange = (index: number, newValue: string) => {
      if (/^\d$/.test(newValue)) {
        const newSegments = [...segments];
        newSegments[index] = newValue;
        const newPhone = newSegments.join("");
        onChange(newPhone);

        // Auto-advance to next input
        if (index < 9) {
          inputRefs.current[index + 1]?.focus();
        }
      }
    };

    const handleKeyDown = (
      index: number,
      e: React.KeyboardEvent<HTMLInputElement>
    ) => {
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
      const pastedData = e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 10);
      onChange(pastedData.padEnd(10, "_"));
    };

    return (
      <div
        dir="ltr"
        className={cn(
          "flex gap-2 items-center rounded-md",
          error && "ring-2 ring-destructive",
          className
        )}
      >
        <div className="flex gap-0.5">
          {/* Area code */}
          <div className="flex gap-0.5">
            {segments.slice(0, 3).map((digit, i) => (
              <Input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                  if (i === 0) {
                    if (typeof ref === "function") {
                      ref(el);
                    } else if (ref) {
                      ref.current = el;
                    }
                  }
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit === "_" ? "" : digit}
                onChange={(e) => handleSegmentChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-6 h-8 text-center p-1 text-foreground font-semibold text-[1rem]"
                {...props}
              />
            ))}
          </div>
          <span className="text-muted-foreground mx-1">-</span>
          {/* First segment */}
          <div className="flex gap-1">
            {segments.slice(3, 6).map((digit, i) => (
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
                className="w-6 h-8 text-center p-1 text-foreground font-semibold text-[1rem]"
                {...props}
              />
            ))}
          </div>
          {/* Second segment */}
          <div className="flex gap-1">
            {segments.slice(6, 10).map((digit, i) => (
              <Input
                key={i + 6}
                ref={(el) => (inputRefs.current[i + 6] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit === "_" ? "" : digit}
                onChange={(e) => handleSegmentChange(i + 6, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i + 6, e)}
                onPaste={handlePaste}
                className="w-6 h-8 text-center p-1 text-foreground font-semibold text-[1rem]"
                {...props}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
);

PhoneInput.displayName = "PhoneInput";
