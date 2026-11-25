"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface Activity {
  id: number;
  target: number;
  target_name?: string;
  financial_year: number;
  financial_year_name?: string;
  section?: number | null;
  section_name?: string | null;
  name: string;
  code?: string;
  description?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export function getActivityTanStackColumns(): ColumnDef<Activity>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      accessorKey: "target_name",
      header: "Target",
      cell: ({ row }) => (row.getValue("target_name") as string) || "—",
    },
    {
      accessorKey: "section_name",
      header: "Section",
      cell: ({ row }) => (row.getValue("section_name") as string) || "—",
    },
    {
      accessorKey: "financial_year_name",
      header: "Financial Year",
      cell: ({ row }) => (row.getValue("financial_year_name") as string) || "—",
    },
  ];
}
