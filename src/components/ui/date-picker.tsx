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
  toYear,
  fromYear,
  fromDate,
}: {
  date: string | undefined;
  onDateChange: (date: Date | undefined) => void;
  className?: string;
  locale?: Locale;
  fromDate?: Date;
  fromYear?: number;
  toYear?: number;
  toDate?: Date;
}) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    onDateChange(selectedDate);
    setIsOpen(false); // Close popover after selection
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild >
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
      <PopoverContent className="w-auto p-0" side="top" sideOffset={10}  align='center'>
        <Calendar
          mode="single"
          onSelect={handleDateSelect}
          locale={locale} // Pass locale to Calendar
          initialFocus
          toDate={toDate}
          fromYear={fromYear}
          toYear={toYear}
          fromDate={fromDate}
        />
      </PopoverContent>
    </Popover>
  );
}
