import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
  status: string;
}

export function getPermissionColumns(t: any): Column<Permission>[] {
  return [
    {
      key: "name",
      header: t.name,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "description",
      header: t.desc,
    },
    {
      key: "module",
      header: t.module,
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
