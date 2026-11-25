"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Project, ProjectDivision } from "@/lib/api/project.service";

function formatDivisions(value: Project["responsible_divisions"]): string {
  if (!value?.length) return "—";
  return value
    .map((item) => {
      if (typeof item === "number") return String(item);
      const div = item as ProjectDivision;
      const type = div.type ? ` (${div.type})` : "";
      return `${div.name}${type}`;
    })
    .join(", ");
}

export function getProjectTanStackColumns(): ColumnDef<Project>[] {
  return [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (row.getValue("name") as string) || "—",
    },
    {
      accessorKey: "reporting_duration_name",
      header: "Reporting Duration",
      cell: ({ row }) => (row.getValue("reporting_duration_name") as string) || "—",
    },
    {
      accessorKey: "responsible_divisions",
      header: "Division/Unit",
      cell: ({ row }) => formatDivisions(row.getValue("responsible_divisions")),
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
    },
  ];
}
