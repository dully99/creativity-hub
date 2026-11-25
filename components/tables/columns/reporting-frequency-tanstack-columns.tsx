"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ReportingFrequencyConfig } from "@/lib/api/reporting-frequency.service";

const WEEKDAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function getReportingFrequencyTanStackColumns(): ColumnDef<ReportingFrequencyConfig>[] {
  return [
    {
      accessorKey: "name",
      header: "Name / Scope",
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="space-y-0.5">
            <div className="font-medium">{item.name || item.scope_label || "—"}</div>
            {item.name ? (
              <div className="text-xs text-muted-foreground">{item.scope_label}</div>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "reporting_frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const item = row.original;
        return item.reporting_frequency_display
          || (item.reporting_frequency
            ? item.reporting_frequency.charAt(0).toUpperCase() + item.reporting_frequency.slice(1)
            : "—");
      },
    },
    {
      id: "window",
      header: "Open → Close",
      cell: ({ row }) => {
        const item = row.original;
        if (item.reporting_frequency !== "weekly") return "—";
        const open = item.weekly_reporting_open_day_label
          || (item.weekly_reporting_open_day != null ? WEEKDAY[item.weekly_reporting_open_day] : null);
        const close = item.weekly_reporting_close_day_label
          || (item.weekly_reporting_close_day != null ? WEEKDAY[item.weekly_reporting_close_day] : null);
        if (!open || !close) return "—";
        return `${open} → ${close}`;
      },
    },
    {
      id: "divisions",
      header: "Divisions / Units",
      cell: ({ row }) => {
        const item = row.original;
        if (item.applies_to_all) return "All";
        const names = item.division_names || [];
        if (!names.length) return "—";
        if (names.length <= 2) return names.join(", ");
        return `${names.slice(0, 2).join(", ")} +${names.length - 2}`;
      },
    },
    {
      accessorKey: "is_active",
      header: "Active",
      cell: ({ row }) => (row.original.is_active ? "Yes" : "No"),
    },
  ];
}
