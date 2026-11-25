"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { User } from "@/lib/api/user.service";
import { SortableHeader } from "../tanstack-data-table";

export function getUsersTanStackColumns(t: any): ColumnDef<User>[] {
  return [
    {
      id: "fullName",
      accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      header: ({ column }) => <SortableHeader column={column} title={t.username} />,
      cell: ({ row }) => {
        const user = row.original;
        const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim();
        return <span className="font-medium">{fullName || "—"}</span>;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => <SortableHeader column={column} title={t.email} />,
      cell: ({ row }) => row.getValue("email"),
    },
    {
      accessorKey: "roles",
      header: t.role,
      cell: ({ row }) => {
        const roles = (row.getValue("roles") as string[] | undefined) ?? [];
        const user = row.original;

        if (roles.length > 0) {
          return (
            <div className="flex flex-wrap gap-1">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="font-normal">
                  {role}
                </Badge>
              ))}
            </div>
          );
        }

        if (user.is_superuser) return "Superuser";
        if (user.is_staff) return "Staff";
        return "User";
      },
    },
    {
      accessorKey: "is_active",
      header: t.status,
      cell: ({ row }) => {
        const isActive = row.getValue("is_active") as boolean | undefined;
        const active = isActive !== false;
        return (
          <Badge variant={active ? "default" : "secondary"}>
            {active ? t.active : t.inactive}
          </Badge>
        );
      },
    },
  ];
}
