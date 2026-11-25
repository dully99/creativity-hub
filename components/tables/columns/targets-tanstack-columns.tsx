"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Target } from "@/lib/api/target.service";

export type { Target };

export function getTargetTanStackColumns(): ColumnDef<Target>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      id: "objectives",
      header: "Objectives",
      cell: ({ row }) => {
        const names = row.original.objective_names;
        if (names && names.length > 0) {
          return <span className="text-sm">{names.join(", ")}</span>;
        }
        return (
          <span className="text-sm">{row.original.objective_name || "—"}</span>
        );
      },
    },
    {
      id: "responsible_division",
      header: "Responsible Division/Unit",
      cell: ({ row }) =>
        row.original.division_name ||
        row.original.responsible_division_name ||
        "—",
    },
  ];
}
