"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface Position {
  id: number;
  name: string;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export function getPositionTanStackColumns(): ColumnDef<Position>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (row.getValue("description") as string | null) || "—",
    },
  ];
}
