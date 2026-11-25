import { Column } from "../data-table";
import { StatusBadge } from "../data-table";
import { Unit } from "@/lib/api/unit.service";

export interface UnitRow {
  id: string;
  name: string;
  code: string;
  division: string;
  desc: string;
  status: string;
  department?: number;
  head_of_unit?: number;
}

export function mapApiUnitToTableRow(unit: Unit): UnitRow {
  return {
    id: unit.id.toString(),
    name: unit.name,
    code: unit.code,
    division: unit.ministry_name || unit.ministry?.toString() || "N/A",
    desc: unit.description || "",
    status: unit.is_active ? "active" : "inactive",
    department: unit.ministry,
    head_of_unit: unit.head_of_unit,
  };
}

export function getUnitColumns(t: any): Column<UnitRow>[] {
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
      key: "division",
      header: t.division,
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
