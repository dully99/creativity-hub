"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Permission } from "@/lib/api/permission.service";
import { SortableHeader } from "../tanstack-data-table";

export function getPermissionsTanStackColumns(t: any): ColumnDef<Permission>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title={t.name} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "codename",
      header: ({ column }) => <SortableHeader column={column} title={t.desc} />,
      cell: ({ row }) => row.getValue("codename"),
    },
    {
      accessorKey: "app_label",
      header: ({ column }) => <SortableHeader column={column} title={t.module} />,
      cell: ({ row }) => {
        const appLabel = row.getValue("app_label") as string;
        return appLabel || "—";
      },
    },
  ];
}
