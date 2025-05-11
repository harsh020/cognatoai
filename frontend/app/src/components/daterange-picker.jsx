"use client"

import * as React from "react"
import {addDays, endOfDay, format, startOfDay} from "date-fns"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {useEffect} from "react";

export default function DateRangePicker({ className, startDate, endDate, onChange, inclusive=true }) {
  const [date, setDate] = React.useState({
    from: startDate,
    to: endDate,
  });

  useEffect(() => {
    setDate({
      from: startDate,
      to: endDate
    })
  }, [startDate, endDate]);


  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>dd/mm/yyyy - dd/mm/yyyy</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(value) => {
              setDate((d) => setDate(value));
              let start = value.from;
              let end = value.to;
              if(inclusive) {
                if(start) start = startOfDay(value.from);
                if(end) end = endOfDay(value.to);
              }
              if(onChange) onChange(start, end);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
