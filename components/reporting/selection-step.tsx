"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

export interface SelectionOption {
  id: number;
  title: string;
  subtitle?: string;
  meta?: string;
}

interface SelectionStepProps {
  title: string;
  description?: string;
  options: SelectionOption[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
  emptyMessage?: string;
  onSearch?: (query: string) => void;
}

export function SelectionStep({
  title,
  description,
  options,
  selectedId,
  onSelect,
  isLoading,
  emptyMessage = "No options available for your division.",
  onSearch,
}: SelectionStepProps) {
  const [search, setSearch] = useState("");
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const skipInitialSearch = useRef(true);

  useEffect(() => {
    if (!onSearchRef.current) return;
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }
    const timer = window.setTimeout(() => onSearchRef.current?.(search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const filtered = useMemo(() => {
    if (onSearch) return options;
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.subtitle?.toLowerCase().includes(q) ||
        o.meta?.toLowerCase().includes(q)
    );
  }, [options, search, onSearch]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-2 max-h-[360px] overflow-y-auto pr-1">
          {filtered.map((option) => {
            const isSelected = selectedId === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all hover:border-primary/50 hover:bg-accent/50",
                  isSelected && "border-primary bg-primary/5 ring-1 ring-primary/20"
                )}
              >
                <div
                  className={cn(
                    "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"
                  )}
                >
                  {isSelected && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug">{option.title}</p>
                  {option.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{option.subtitle}</p>
                  )}
                  {option.meta && (
                    <p className="text-xs font-mono text-muted-foreground mt-1">{option.meta}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
