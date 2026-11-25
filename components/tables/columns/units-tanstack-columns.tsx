"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Unit } from "@/lib/api/unit.service";
import { User } from "@/lib/api/user.service";
import { SortableHeader } from "../tanstack-data-table";

export function getUnitsTanStackColumns(t: any, users: User[] = []): ColumnDef<Unit>[] {
  const getHeadName = (headId: number | undefined) => {
    if (!headId) return "No head of unit";
    const head = users.find((u) => u.id === headId);
    if (head) return `${head.first_name} ${head.last_name}`;
    return "No head of unit";
  };

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
      accessorKey: "ministry_name",
      header: t.ministry,
      cell: ({ row }) => row.getValue("ministry_name") || "No ministry",
    },
    {
      accessorKey: "head_of_unit",
      header: "Head of Unit",
      cell: ({ row }) => {
        const head = row.getValue("head_of_unit") as number | undefined;
        return getHeadName(head);
      },
    },
  ];
}
