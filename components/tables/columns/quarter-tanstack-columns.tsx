"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Quarter } from "@/lib/api/quarter.service";

export function getQuarterTanStackColumns(): ColumnDef<Quarter>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => row.getValue("name") as string || "—",
    },
    {
      accessorKey: "financial_year_name",
      header: "Financial Year",
      cell: ({ row }) => (row.getValue("financial_year_name") as string) || "—",
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => new Date(row.getValue("start_date") as string).toLocaleDateString(),
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => new Date(row.getValue("end_date") as string).toLocaleDateString(),
    },
    {
      accessorKey: "is_current",
      header: "Current",
      cell: ({ row }) => {
        const isCurrent = row.getValue("is_current") as boolean;
        return (
          <Badge variant={isCurrent ? "default" : "secondary"}>
            {isCurrent ? "Yes" : "No"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
  ];
}
