import * as React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { DayPicker, DayPickerProps, CaptionProps } from "react-day-picker";
import { format, Locale } from "date-fns";
import { he } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CalendarHeaderProps {
  displayMonth: Date;
  setMonth: (date: Date) => void;
  locale: Locale;
  years: number[];
}

function CalendarHeader({
  displayMonth,
  setMonth,
  locale,
  years,
}: CalendarHeaderProps) {
  const months = Array.from({ length: 12 }, (_, i) => new Date(2024, i, 1));

  return (
    <div className="flex justify-center items-center gap-2">
      <Select
        dir="rtl"
        value={displayMonth.getMonth().toString()}
        onValueChange={(value) => {
          const newMonth = new Date(displayMonth);
          newMonth.setMonth(parseInt(value));
          setMonth(newMonth);
        }}
      >
        <SelectTrigger className="h-7 w-full ">
          <SelectValue>{format(displayMonth, "LLLL", { locale })}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {months.map((m, index) => (
            <SelectItem key={index} value={index.toString()}>
              {format(m, "LLLL", { locale })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        dir="rtl"
        value={displayMonth.getFullYear().toString()}
        onValueChange={(value) => {
          const newMonth = new Date(displayMonth);
          newMonth.setFullYear(parseInt(value));
          setMonth(newMonth);
        }}
      >
        <SelectTrigger className="h-7 w-full">
          <SelectValue>{displayMonth.getFullYear()}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()} className="">
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

type CalendarProps = DayPickerProps & {
  fromYear?: number;
  toYear?: number;
  locale?: Locale;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = he,
  fromYear,
  toYear,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(() => {
    // Check if `props.selected` is a Date
    if (props.selected instanceof Date) {
      return props.selected;
    }
    // Default to the current date
    return new Date();
  });

  const currentYear = new Date().getFullYear();
  const startYear = fromYear || currentYear - 5;
  const endYear = toYear || currentYear + 5;
  const years = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 w-[280px]", className)}
      month={month}
      onMonthChange={setMonth}
      locale={locale}
      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex justify-between w-full",
        head_cell:
          "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2 justify-between",
        cell: cn(
          "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md w-8",
          props.mode === "range"
            ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
            : "[&:has([aria-selected])]:rounded-md"
        ),
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-7 w-7 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_start: "day-range-start",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeftIcon className="h-4 w-4" />,
        IconRight: () => <ChevronRightIcon className="h-4 w-4" />,
        Caption: (props: CaptionProps) => (
          <CalendarHeader
            displayMonth={props.displayMonth}
            setMonth={setMonth}
            locale={locale}
            years={years}
          />
        ),
      }}
      {...props}
    />
  );
}

Calendar.displayName = "Calendar";

export { Calendar };
