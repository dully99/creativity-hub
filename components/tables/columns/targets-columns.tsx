import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Target {
  id: string;
  name: string;
  code: string;
  objective: string;
  target: string;
  current: string;
  status: string;
}

export function getTargetColumns(t: any): Column<Target>[] {
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
      key: "objective",
      header: t.objective,
    },
    {
      key: "target",
      header: t.target,
    },
    {
      key: "current",
      header: t.current,
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
