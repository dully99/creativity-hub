"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

const fieldClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

export function SearchableSelect({
  name,
  value,
  defaultValue,
  onChange,
  onSearch,
  options,
  placeholder = "Select",
  required,
}: {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSearch?: (query: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [internal, setInternal] = useState(defaultValue ?? "");
  const selected = value ?? internal;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || onSearch) return options;
    return options.filter((option) => option.label.toLowerCase().includes(q));
  }, [options, query, onSearch]);

  const selectedLabel = options.find((option) => option.value === selected)?.label ?? "";

  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;
  const skipInitialSearch = useRef(true);

  useEffect(() => {
    if (!onSearchRef.current) return;
    if (skipInitialSearch.current) {
      skipInitialSearch.current = false;
      return;
    }
    const timer = window.setTimeout(() => onSearchRef.current?.(query.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [query]);

  const choose = (next: string) => {
    setInternal(next);
    onChange?.(next);
    setOpen(false);
    setQuery("");
  };

  return (
    <div className="relative">
      {name ? <input type="hidden" name={name} value={selected} required={required} /> : null}
      <button
        type="button"
        className={`${fieldClass} justify-between text-left`}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selectedLabel ? "" : "text-muted-foreground"}>
          {selectedLabel || placeholder}
        </span>
      </button>
      {open ? (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-md">
          <div className="relative border-b p-2">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              placeholder="Search..."
              className={`${fieldClass} pl-8`}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-muted-foreground hover:bg-accent"
              onClick={() => choose("")}
            >
              {placeholder}
            </button>
            {visible.length === 0 ? (
              <p className="px-3 py-2 text-sm text-muted-foreground">No matches.</p>
            ) : (
              visible.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-accent ${
                    option.value === selected ? "bg-accent font-medium" : ""
                  }`}
                  onClick={() => choose(option.value)}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
