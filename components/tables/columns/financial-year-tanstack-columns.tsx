"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { FinancialYear } from "@/lib/api/financial-year.service";

export function getFinancialYearTanStackColumns(translations: {
  title: string;
}): ColumnDef<FinancialYear>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const name = row.getValue("name") as string;
        return name || "—";
      },
    },
    {
      accessorKey: "start_date",
      header: "Start Date",
      cell: ({ row }) => {
        const startDate = row.getValue("start_date") as string;
        return new Date(startDate).toLocaleDateString();
      },
    },
    {
      accessorKey: "end_date",
      header: "End Date",
      cell: ({ row }) => {
        const endDate = row.getValue("end_date") as string;
        return new Date(endDate).toLocaleDateString();
      },
    },
    {
      accessorKey: "reporting_frequency",
      header: "Frequency",
      cell: ({ row }) => {
        const frequency = row.getValue("reporting_frequency") as string;
        return frequency.charAt(0).toUpperCase() + frequency.slice(1);
      },
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
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status") as string;
        const variant = status === "active" ? "default" : status === "draft" ? "secondary" : "outline";
        return (
          <Badge variant={variant}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        );
      },
    },
  ];
}
