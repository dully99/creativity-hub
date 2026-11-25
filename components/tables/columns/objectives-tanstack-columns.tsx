"use client";

import { ColumnDef } from "@tanstack/react-table";

export interface ObjectiveDivision {
  id: number;
  name: string;
  code?: string;
  type?: string;
}

export interface Objective {
  id: number;
  plan_budget_type: number;
  plan_budget_type_name?: string;
  project: number | null;
  project_name?: string | null;
  project_names?: string[];
  project_ids?: number[];
  reporting_duration: number;
  reporting_duration_name?: string;
  responsible_divisions: ObjectiveDivision[];
  name: string;
  code?: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: number;
  updated_by?: number;
}

export function getObjectiveTanStackColumns(): ColumnDef<Objective>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.getValue("name") as string}</span>
      ),
    },
    {
      id: "projects",
      header: "Projects",
      cell: ({ row }) => {
        const names = row.original.project_names;
        if (names && names.length > 0) {
          return <span className="text-sm">{names.join(", ")}</span>;
        }
        return (
          <span className="text-sm">{row.original.project_name || "—"}</span>
        );
      },
    },
    {
      accessorKey: "reporting_duration_name",
      header: "Reporting Period",
      cell: ({ row }) =>
        (row.getValue("reporting_duration_name") as string | null) || "—",
    },
  ];
}
