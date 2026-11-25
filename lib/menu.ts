import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  HelpCircle,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Shield,
  Users,
  Building2,
  Layers,
  Target,
  Activity,
  CheckSquare,
  UserCog,
  Landmark,
  Calendar,
  DollarSign,
  PieChart,
  Wallet,
  FolderKanban,
  Briefcase,
  FolderTree,
  ClipboardList,
  History,
  FileSpreadsheet,
  FileEdit,
  CalendarClock,
} from "lucide-react";

export interface NavSubItem {
  title: string;
  url: string;
}

export interface NavMainItem {
  title: string;
  url: string;
  icon: LucideIcon;
  isActive?: boolean;
  items?: NavSubItem[];
}

export interface NavSecondaryItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export interface NavProjectItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

export interface MenuConfig {
  navMain: NavMainItem[];
  navSecondary: NavSecondaryItem[];
  projects: NavProjectItem[];
}

export const APP_MENU: MenuConfig = {
  navMain: [
    {
      title: "Users",
      url: "/users",
      icon: Users,
    },
    {
      title: "Roles",
      url: "/roles",
      icon: UserCog,
    },
    {
      title: "Positions",
      url: "/positions",
      icon: Briefcase,
    },
    {
      title: "Permissions",
      url: "/permissions",
      icon: Shield,
    },
    {
      title: "Ministry",
      url: "/ministry",
      icon: Landmark,
    },
    {
      title: "Divisions",
      url: "/divisions",
      icon: Building2,
    },
    {
      title: "Sections",
      url: "/sections",
      icon: FolderTree,
    },
    {
      title: "Units",
      url: "/units",
      icon: Layers,
    },
    {
      title: "Reporting Durations",
      url: "/reporting-durations",
      icon: Calendar,
    },
    {
      title: "Financial Years",
      url: "/financial-years",
      icon: DollarSign,
    },
    {
      title: "Quarters",
      url: "/quarters",
      icon: PieChart,
    },
    {
      title: "Plan Budget Types",
      url: "/plan-budget-types",
      icon: Wallet,
    },
    {
      title: "Reporting Frequency",
      url: "/reporting-frequency",
      icon: CalendarClock,
    },
    {
      title: "Projects",
      url: "/projects",
      icon: FolderKanban,
    },
    {
      title: "Objectives",
      url: "/objectives",
      icon: Target,
    },
    {
      title: "Targets",
      url: "/targets",
      icon: Target,
    },
    {
      title: "Activities",
      url: "/activities",
      icon: Activity,
    },
    {
      title: "Tasks",
      url: "/tasks",
      icon: CheckSquare,
    },
    // {
    //   title: "Settings",
    //   url: "/settings",
    //   icon: Settings,
    // },
    {
      title: "Import Data",
      url: "/import",
      icon: FileSpreadsheet,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
    },
    {
      title: "Feedback",
      url: "#",
      icon: MessageSquare,
    },
  ],
  projects: [],
};

/** Focal person workspace — reporting only. */
export const FOCAL_MENU: MenuConfig = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Report Assessment",
      url: "/reporting",
      icon: ClipboardList,
    },
    {
      title: "Draft Reports",
      url: "/draft-reports",
      icon: FileEdit,
    },
    {
      title: "Submitted Reports",
      url: "/submitted-reports",
      icon: History,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
    },
  ],
  projects: [],
};

/** Executive / Permanent Secretary / Deputy PS — analytics dashboards. */
export const EXECUTIVE_MENU: MenuConfig = {
  navMain: [
    {
      title: "Executive Analytics",
      url: "/analytics",
      icon: BarChart3,
    },
  ],
  navSecondary: [
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircle,
    },
  ],
  projects: [],
};

export function getMenuForUser(
  roles: string[],
  isSuperuser = false,
  options?: { hasDraftReports?: boolean },
): MenuConfig {
  // Menu is driven by the active workspace role only (first entry / sole role).
  const activeRole = roles[0];
  if (isSuperuser || activeRole === "SuperAdmin") return APP_MENU;
  const adminRoles = new Set([
    "SuperAdmin",
    "DppAdmin",
    "DPPAdministrator",
    "PlanningOfficer",
    "MCIT",
  ]);
  const executiveRoles = new Set([
    "Executive",
    "PermanentSecretary",
    "DeputyPermanentSecretary",
  ]);
  if (activeRole && adminRoles.has(activeRole)) return APP_MENU;
  if (activeRole && executiveRoles.has(activeRole)) return EXECUTIVE_MENU;

  const menu: MenuConfig = {
    ...FOCAL_MENU,
    navMain: FOCAL_MENU.navMain.filter(
      (item) => item.url !== "/draft-reports" || options?.hasDraftReports
    ),
  };
  return menu;
}
