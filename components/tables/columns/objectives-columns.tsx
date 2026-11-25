import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Objective {
  id: string;
  name: string;
  code: string;
  desc: string;
  priority: string;
  status: string;
}

export function getObjectiveColumns(t: any): Column<Objective>[] {
  return [
    {
      key: "name",
      header: t.name,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "code",
      header: t.code,
    },
    {
      key: "desc",
      header: t.desc,
    },
    {
      key: "priority",
      header: t.priority,
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
