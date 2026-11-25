import { Column } from "../data-table";
import { StatusBadge } from "../data-table";

export interface Task {
  id: string;
  name: string;
  code: string;
  activity: string;
  assignee: string;
  dueDate: string;
  status: string;
}

export function getTaskColumns(t: any): Column<Task>[] {
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
      key: "activity",
      header: t.activity,
    },
    {
      key: "assignee",
      header: t.assignee,
    },
    {
      key: "dueDate",
      header: t.dueDate,
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
