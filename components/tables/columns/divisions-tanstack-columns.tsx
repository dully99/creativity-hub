"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Department } from "@/lib/api/department.service";
import { User } from "@/lib/api/user.service";
import { SortableHeader } from "../tanstack-data-table";

export function getDivisionsTanStackColumns(t: any, users: User[] = []): ColumnDef<Department>[] {
  const getHeadName = (headId: number | undefined) => {
    if (!headId) return "No head of division";
    const head = users.find((u) => u.id === headId);
    if (head) return `${head.first_name} ${head.last_name}`;
    return "No head of division";
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
      accessorKey: "head_of_department",
      header: t.head,
      cell: ({ row }) => {
        const head = row.getValue("head_of_department") as number | undefined;
        return getHeadName(head);
      },
    },
  ];
}
