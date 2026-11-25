"use client";

import * as React from "react";
import { ClockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  /** 24-hour "HH:mm" string. */
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  /** Minute granularity, defaults to 5. */
  minuteStep?: number;
  /** Show 12h (AM/PM) UI while still emitting 24h "HH:mm". Defaults to true. */
  use12Hours?: boolean;
  /** Optional id to associate a label. */
  id?: string;
  "aria-invalid"?: boolean;
}

function pad(n: number) {
  return n.toString().padStart(2, "0");
}

function parse24(value?: string): { hour: number; minute: number } | null {
  if (!value || !/^\d{1,2}:\d{2}$/.test(value)) return null;
  const [h, m] = value.split(":").map(Number);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return { hour: h, minute: m };
}

function formatDisplay(value: string | undefined, use12Hours: boolean) {
  const parsed = parse24(value);
  if (!parsed) return "";
  if (!use12Hours) return `${pad(parsed.hour)}:${pad(parsed.minute)}`;
  const period = parsed.hour >= 12 ? "PM" : "AM";
  const h12 = ((parsed.hour + 11) % 12) + 1;
  return `${pad(h12)}:${pad(parsed.minute)} ${period}`;
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
  minuteStep = 5,
  use12Hours = true,
  id,
  "aria-invalid": ariaInvalid,
}: TimePickerProps) {
  const [open, setOpen] = React.useState(false);

  const parsed = parse24(value);
  const period: "AM" | "PM" = parsed && parsed.hour >= 12 ? "PM" : "AM";
  const hour12 = parsed ? ((parsed.hour + 11) % 12) + 1 : undefined;

  const hourOptions = use12Hours
    ? Array.from({ length: 12 }, (_, i) => i + 1)
    : Array.from({ length: 24 }, (_, i) => i);
  const minuteOptions = Array.from(
    { length: Math.floor(60 / minuteStep) },
    (_, i) => i * minuteStep
  );

  const commit = (opts: {
    hour?: number;
    minute?: number;
    period?: "AM" | "PM";
  }) => {
    const nextMinute = opts.minute ?? parsed?.minute ?? 0;

    let nextHour24: number;
    if (use12Hours) {
      const h12 = opts.hour ?? hour12 ?? 12;
      const p = opts.period ?? period;
      const base = h12 % 12;
      nextHour24 = p === "PM" ? base + 12 : base;
    } else {
      nextHour24 = opts.hour ?? parsed?.hour ?? 0;
    }

    onChange?.(`${pad(nextHour24)}:${pad(nextMinute)}`);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={ariaInvalid}
          className={cn(
            "h-11 w-full justify-between px-3 font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {value ? formatDisplay(value, use12Hours) : placeholder}
          </span>
          <ClockIcon className="ml-2 size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="flex items-center gap-2">
          <Select
            value={
              use12Hours
                ? hour12 != null
                  ? String(hour12)
                  : undefined
                : parsed
                  ? pad(parsed.hour)
                  : undefined
            }
            onValueChange={(v) => commit({ hour: Number(v) })}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {hourOptions.map((h) => (
                <SelectItem
                  key={h}
                  value={use12Hours ? String(h) : pad(h)}
                >
                  {use12Hours ? pad(h) : pad(h)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <span className="text-muted-foreground">:</span>

          <Select
            value={parsed ? pad(parsed.minute) : undefined}
            onValueChange={(v) => commit({ minute: Number(v) })}
          >
            <SelectTrigger size="sm" className="w-[4.5rem]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {minuteOptions.map((m) => (
                <SelectItem key={m} value={pad(m)}>
                  {pad(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {use12Hours && (
            <Select
              value={period}
              onValueChange={(v) => commit({ period: v as "AM" | "PM" })}
            >
              <SelectTrigger size="sm" className="w-[4.5rem]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default TimePicker;
