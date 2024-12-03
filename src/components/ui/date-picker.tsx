"use client";

import * as React from "react";
import { format, Locale } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DatePicker({
  date,
  onDateChange,
  className,
  locale,
  toDate,
  fromDate,
}: {
  date: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
  locale?: Locale; // Pass locale to handle date formatting
  fromDate?: Date; // Pass locale to handle date formatting
  toDate?: Date; // Pass locale to handle date formatting
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setIsOpen(false); // Close popover after selection
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className // Apply custom styles passed as props
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PP", { locale }) : <span>בחר תאריך</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleDateSelect}
          locale={locale} // Pass locale to Calendar
          initialFocus
          toDate={toDate}
          fromDate={fromDate}
        />
      </PopoverContent>
    </Popover>
  );
}