import { Column } from "../data-table";
import { StatusBadge } from "../data-table";
import { Department } from "@/lib/api/department.service";

export interface Division {
  id: string;
  name: string;
  code: string;
  desc: string;
  head: string;
  status: string;
  ministry?: number;
  head_of_department?: number;
}

export function mapApiDepartmentToTableDivision(department: Department): Division {
  const headId = department.head_of_department ?? department.head_of_division ?? undefined;
  return {
    id: department.id.toString(),
    name: department.name,
    code: department.code,
    desc: department.description || "",
    head: department.head_name || headId?.toString() || "N/A",
    status: department.is_active ? "active" : "inactive",
    ministry: department.ministry,
    head_of_department: headId,
  };
}

export function getDivisionColumns(t: any): Column<Division>[] {
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
      key: "head",
      header: t.head,
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
