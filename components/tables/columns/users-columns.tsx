import { Column } from "../data-table";
import { StatusBadge } from "../data-table";
import type { User as ApiUser } from "@/lib/api/user.service";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export function getUserColumns(t: any): Column<User>[] {
  return [
    {
      key: "name",
      header: t.name,
      render: (value: string) => <span className="font-medium">{value}</span>,
    },
    {
      key: "email",
      header: t.email,
    },
    {
      key: "role",
      header: t.role,
      render: (value: string) => (
        <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 px-2 py-1 text-xs font-medium text-blue-700 dark:text-blue-400">
          {value}
        </span>
      ),
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

export function mapApiUserToTableUser(apiUser: ApiUser): User {
  // Determine role from roles array or fallback to staff/superuser flags
  let role = "User";
  
  if (apiUser.roles && apiUser.roles.length > 0) {
    // Use the first role from the roles array
    role = apiUser.roles[0];
  } else if (apiUser.is_superuser) {
    role = "Super Admin";
  } else if (apiUser.is_staff) {
    role = "Staff";
  }

  return {
    id: apiUser.id.toString(),
    name: `${apiUser.first_name} ${apiUser.last_name}`.trim() || apiUser.email,
    email: apiUser.email,
    role,
    status: (apiUser.is_active !== undefined ? apiUser.is_active : true) ? "active" : "inactive",
    is_staff: apiUser.is_staff,
    is_superuser: apiUser.is_superuser,
  };
}
