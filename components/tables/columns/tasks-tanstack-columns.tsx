"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface Task {
  id: number;
  activity: number;
  activity_name?: string;
  name: string;
  code?: string;
  description?: string | null;
  status: string;
  progress?: number;
  reporting_frequency?: string;
  data_type?: string;
  target_value?: number | null;
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  implementation_quarters?: Array<number | { id: number; name?: string }>;
  implementation_quarters_names?: string[];
  is_active?: boolean;
  allow_late_report?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export function getTaskTanStackColumns(): ColumnDef<Task>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      accessorKey: "activity_name",
      header: "Activity",
      cell: ({ row }) => (row.getValue("activity_name") as string) || "—",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant =
          status === "completed" ? "default" :
          status === "in_progress" ? "secondary" :
          status === "cancelled" ? "destructive" : "outline";
        return (
          <Badge variant={variant}>
            {status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
          </Badge>
        );
      },
    },
  ];
}
