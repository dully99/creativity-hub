"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PlanBudgetType } from "@/lib/api/plan-budget-type.service";

export function getPlanBudgetTypeTanStackColumns(): ColumnDef<PlanBudgetType>[] {
  return [
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const item = row.original;
        return item.type_display || item.type.charAt(0).toUpperCase() + item.type.slice(1);
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const description = row.getValue("description") as string | null;
        return description || "—";
      },
    },
  ];
}
