"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Section } from "@/lib/api/section.service";
import { User } from "@/lib/api/user.service";
import { Department } from "@/lib/api/department.service";
import { SortableHeader } from "../tanstack-data-table";

export function getSectionsTanStackColumns(
  t: any,
  users: User[] = [],
  divisions: Department[] = [],
): ColumnDef<Section>[] {
  const getHeadName = (headId: number | undefined) => {
    if (!headId) return "No head of section";
    const head = users.find((u) => u.id === headId);
    if (head) return `${head.first_name} ${head.last_name}`;
    return "No head of section";
  };

  const getDivisionName = (divisionId: number | undefined) => {
    if (!divisionId) return "No division";
    const division = divisions.find((d) => d.id === divisionId);
    return division?.name || "No division";
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
      accessorKey: "division",
      header: t.division,
      cell: ({ row }) => {
        const divisionId = row.getValue("division") as number | undefined;
        return row.original.division_name || getDivisionName(divisionId);
      },
    },
    {
      accessorKey: "head_of_section",
      header: "Head of Section",
      cell: ({ row }) => {
        const head = row.getValue("head_of_section") as number | undefined;
        return getHeadName(head);
      },
    },
  ];
}
