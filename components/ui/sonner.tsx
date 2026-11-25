"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToastClassnames, type ToasterProps } from "sonner";

function mergeToastClassNames(base: ToastClassnames, override?: ToastClassnames): ToastClassnames {
  if (!override) return base;
  const keys = new Set([...Object.keys(base), ...Object.keys(override)]) as Set<
    keyof ToastClassnames
  >;
  const out: ToastClassnames = { ...base };
  for (const key of keys) {
    const b = base[key];
    const o = override[key];
    out[key] = o != null ? (b != null ? cn(b, o) : o) : b;
  }
  return out;
}

const defaultToastClassNames: ToastClassnames = {
  toast: cn(
    "toast-custom flex w-[min(100%,calc(100vw-1.25rem))] max-w-md flex-row items-start gap-3 break-words rounded-lg border px-3 py-3 shadow-md sm:max-w-lg sm:gap-3 sm:px-4",
    "whitespace-normal [word-break:break-word]"
  ),
  title: "break-words text-sm font-medium leading-snug sm:text-[15px]",
  description: "break-words text-xs leading-relaxed opacity-90 sm:text-sm [&:not(:empty)]:mt-0.5",
  content: "min-w-0 flex-1 basis-0",
};

const Toaster = ({
  className,
  toastOptions,
  offset,
  mobileOffset,
  style: styleProp,
  ...props
}: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className={cn("toaster group w-full max-w-[100vw] px-2 sm:px-4", className)}
      offset={offset ?? 16}
      mobileOffset={
        mobileOffset ?? {
          top: "calc(0.75rem + env(safe-area-inset-top, 0px))",
        }
      }
      toastOptions={{
        ...toastOptions,
        classNames: mergeToastClassNames(defaultToastClassNames, toastOptions?.classNames),
        style: {
          ...toastOptions?.style,
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          ...styleProp,
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
