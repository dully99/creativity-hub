"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { DodosoReport } from "@/lib/api/dodoso.service";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string): string {
  if (!status) return "—";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function budgetTypeLabel(budgetType?: string): string {
  if (!budgetType) return "—";
  return budgetType.charAt(0).toUpperCase() + budgetType.slice(1);
}

function getTaskNames(report: DodosoReport): string[] {
  if (report.report_tasks?.length) {
    return report.report_tasks
      .map((task) => task.task_name)
      .filter((name): name is string => Boolean(name));
  }
  if (Array.isArray(report.task_name)) {
    return report.task_name.filter(Boolean);
  }
  if (typeof report.task_name === "string" && report.task_name.trim()) {
    return [report.task_name];
  }
  return [];
}

export function getSubmittedReportsTanStackColumns(
  options?: { variant?: "submitted" | "draft" }
): ColumnDef<DodosoReport>[] {
  const variant = options?.variant ?? "submitted";
  const dateColumn: ColumnDef<DodosoReport> =
    variant === "draft"
      ? {
          accessorKey: "updated_at",
          header: "Last Saved",
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-sm">
              {formatDate(row.original.updated_at || row.original.created_at)}
            </span>
          ),
        }
      : {
          accessorKey: "submitted_at",
          header: "Submitted",
          cell: ({ row }) => (
            <span className="whitespace-nowrap text-sm">
              {formatDate(row.original.submitted_at)}
            </span>
          ),
        };

  return [
    dateColumn,
    {
      accessorKey: "activity_quarter_name",
      header: "Quarter",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[140px]">
          <p className="truncate font-medium">
            {row.original.activity_quarter_name || "—"}
          </p>
          {row.original.activity_quarter_financial_year_name && (
            <p className="truncate text-xs text-muted-foreground">
              {row.original.activity_quarter_financial_year_name}
            </p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "activity_name",
      header: "Activity",
      cell: ({ row }) => (
        <div className="min-w-0 max-w-[220px]">
          <p className="truncate font-medium">
            {row.original.activity_name || "—"}
          </p>
          {row.original.activity_code && (
            <p className="truncate font-mono text-xs text-muted-foreground">
              {row.original.activity_code}
            </p>
          )}
        </div>
      ),
    },
    {
      id: "task_name",
      header: "Task Name",
      accessorFn: (row) => getTaskNames(row).join(", "),
      cell: ({ row }) => {
        const names = getTaskNames(row.original);
        if (names.length === 0) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        return (
          <div className="min-w-0 max-w-[260px] space-y-0.5">
            {names.map((name) => (
              <p key={name} className="truncate text-sm font-medium" title={name}>
                {name}
              </p>
            ))}
          </div>
        );
      },
    },
    {
      accessorKey: "objective_name",
      header: "Objective",
      cell: ({ row }) => (
        <span className="block max-w-[180px] truncate">
          {row.original.objective_name || "—"}
        </span>
      ),
    },
    {
      accessorKey: "budget_type",
      header: "Budget",
      cell: ({ row }) => (
        <Badge variant="outline">{budgetTypeLabel(row.original.budget_type)}</Badge>
      ),
    },
    {
      accessorKey: "activity_progress_percentage",
      header: "Progress",
      cell: ({ row }) => {
        const raw = row.original.activity_progress_percentage ?? 0;
        const percent = Math.min(100, Math.max(0, Number(raw) || 0));
        return (
          <div className="space-y-0.5">
            <span className="tabular-nums text-sm font-medium">{percent}%</span>
            <p className="text-xs text-muted-foreground">
              {formatStatus(row.original.activity_completion_status)}
            </p>
          </div>
        );
      },
    },
  ];
}
