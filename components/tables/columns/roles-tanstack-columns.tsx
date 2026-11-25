"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/lib/api/role.service";
import { SortableHeader } from "../tanstack-data-table";

export function getRolesTanStackColumns(t: any): ColumnDef<Role>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title={t.name} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
  ];
}
