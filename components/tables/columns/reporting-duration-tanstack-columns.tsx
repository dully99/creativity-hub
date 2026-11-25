"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { ReportingDuration } from "@/lib/api/reporting-duration.service";
import { SortableHeader } from "../tanstack-data-table";

export function getReportingDurationTanStackColumns(): ColumnDef<ReportingDuration>[] {
  return [
    {
      accessorKey: "start_date",
      header: ({ column }) => <SortableHeader column={column} title="Start Date" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("start_date"));
        return <span className="font-medium">{date.toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: "end_date",
      header: ({ column }) => <SortableHeader column={column} title="End Date" />,
      cell: ({ row }) => {
        const date = new Date(row.getValue("end_date"));
        return <span className="font-medium">{date.toLocaleDateString()}</span>;
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description || "—";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = (row.getValue("status") as string)?.toLowerCase();
        const variant = status === "active" ? "default" : status === "closed" ? "outline" : "secondary";
        return (
          <Badge variant={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];
}
