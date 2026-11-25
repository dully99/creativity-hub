import { Column } from "../data-table";
import { StatusBadge } from "../data-table";
import { Ministry } from "@/lib/api/ministry.service";

export interface MinistryTable {
  id: string;
  name: string;
  code: string;
  desc: string;
  status: string;
}

export function mapApiMinistryToTable(ministry: Ministry): MinistryTable {
  return {
    id: ministry.id.toString(),
    name: ministry.name,
    code: ministry.code,
    desc: ministry.description || "",
    status: ministry.is_active ? "active" : "inactive",
  };
}

export function getMinistryColumns(t: any): Column<MinistryTable>[] {
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
      key: "status",
      header: t.status,
      render: (value: string) => (
        <StatusBadge status={value} activeLabel={t.active} inactiveLabel={t.inactive} />
      ),
    },
  ];
}
