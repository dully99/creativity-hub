"use client";

import { Input } from "@/components/ui/input";
import { formatAmountWithCommas, parseAmountNumber, sanitizeAmountDigits } from "@/lib/amount-input";
import { cn } from "@/lib/utils";
import * as React from "react";

export interface AmountInputProps
  extends Omit<React.ComponentProps<"input">, "value" | "onChange" | "type" | "inputMode"> {
  value: string;
  onValueChange: (rawValue: string) => void;
  /** When set, values above this amount are rejected and onMaxExceeded may fire. */
  max?: number;
  onMaxExceeded?: () => void;
}

export const AmountInput = React.forwardRef<HTMLInputElement, AmountInputProps>(
  ({ value, onValueChange, max, onMaxExceeded, className, onFocus, onBlur, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement | null>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      const input = innerRef.current;
      if (!input) return;

      const preventWheelChange = (event: WheelEvent) => {
        event.preventDefault();
      };

      input.addEventListener("wheel", preventWheelChange, { passive: false });
      return () => input.removeEventListener("wheel", preventWheelChange);
    }, []);

    return (
      <Input
        {...props}
        ref={innerRef}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        value={formatAmountWithCommas(value)}
        onChange={(event) => {
          const nextValue = sanitizeAmountDigits(event.target.value);
          if (max !== undefined && nextValue !== "") {
            const amount = parseAmountNumber(nextValue);
            if (Number.isFinite(amount) && amount > max) {
              onMaxExceeded?.();
              return;
            }
          }
          onValueChange(nextValue);
        }}
        className={cn(
          "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          className
        )}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    );
  }
);

AmountInput.displayName = "AmountInput";
