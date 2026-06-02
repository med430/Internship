"use client";

// Single-date picker that emits an ISO string (or null). Matches the backend's @IsDateString fields.

import { useState } from "react";
import dayjs from "dayjs";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerField({
  label,
  value,
  onChange,
  placeholder = "Pick a date",
}: {
  label?: string;
  value: string | null;
  onChange: (iso: string | null) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const date = value ? new Date(value) : undefined;
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between font-normal">
            {date ? dayjs(date).format("MMM D, YYYY") : placeholder}
            <CalendarDays className="w-4 h-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0 w-auto" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => {
              onChange(d ? d.toISOString() : null);
              setOpen(false);
            }}
            initialFocus
          />
          {date && (
            <div className="p-2 border-t">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => {
                  onChange(null);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
