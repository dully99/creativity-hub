import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: number;
  users: number;
  status: string;
}

export function getRoleColumns(t: any): Column<Role>[] {
  return [
    {
      key: "name",
      header: t.name,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "description",
      header: t.description,
    },
    {
      key: "permissions",
      header: t.permissions,
      render: (value: number) => <span className="text-sm">{value} permissions</span>,
    },
    {
      key: "users",
      header: t.users,
      render: (value: number) => <span className="text-sm">{value} users</span>,
    },
    {
      key: "status",
      header: t.status,
      render: (value: string) => (
        <StatusBadge status={value} activeLabel={t.active} inactiveLabel={t.inactive} />
      ),
    },
  ];
}
