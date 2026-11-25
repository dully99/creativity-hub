import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Activity {
  id: string;
  name: string;
  code: string;
  target: string;
  startDate: string;
  endDate: string;
  status: string;
}

export function getActivityColumns(t: any): Column<Activity>[] {
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
      key: "target",
      header: t.target,
    },
    {
      key: "startDate",
      header: t.startDate,
    },
    {
      key: "endDate",
      header: t.endDate,
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
