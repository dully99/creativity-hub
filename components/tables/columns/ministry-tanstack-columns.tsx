"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Ministry } from "@/lib/api/ministry.service";
import { SortableHeader } from "../tanstack-data-table";

export const ministryColumns: ColumnDef<Ministry>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} title="Name" />,
    cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
  },
  {
    accessorKey: "code",
    header: ({ column }) => <SortableHeader column={column} title="Code" />,
    cell: ({ row }) => row.getValue("code"),
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
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
];

// Helper function to create translated columns
export function getMinistryTanStackColumns(t: any): ColumnDef<Ministry>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <SortableHeader column={column} title={t.name} />,
      cell: ({ row }) => <span className="font-medium">{row.getValue("name")}</span>,
    },
    {
      accessorKey: "code",
      header: ({ column }) => <SortableHeader column={column} title={t.code} />,
      cell: ({ row }) => row.getValue("code"),
    },
    {
      accessorKey: "description",
      header: t.desc,
      cell: ({ row }) => {
        const description = row.getValue("description") as string;
        return description || "—";
      },
    },
  ];
}
