/** Canonical Django group / role names used by the app. */
export const ROLES = {
  SUPER_ADMIN: "SuperAdmin",
  DPP_ADMIN: "DppAdmin",
  DPP_ADMINISTRATOR: "DPPAdministrator",
  PLANNING_OFFICER: "PlanningOfficer",
  FOCAL_PERSON: "Focalperson",
  HEAD_OF_UNIT: "HeadOfUnit",
  DEPARTMENT_DIRECTOR: "DepartmentDirector",
  EXECUTIVE: "Executive",
  PERMANENT_SECRETARY: "PermanentSecretary",
  DEPUTY_PERMANENT_SECRETARY: "DeputyPermanentSecretary",
  MCIT: "MCIT",
} as const;

const ADMIN_ROLES = new Set<string>([
  ROLES.SUPER_ADMIN,
  ROLES.DPP_ADMIN,
  ROLES.DPP_ADMINISTRATOR,
  ROLES.PLANNING_OFFICER,
  ROLES.MCIT,
]);

const EXECUTIVE_ROLES = new Set<string>([
  ROLES.EXECUTIVE,
  ROLES.PERMANENT_SECRETARY,
  ROLES.DEPUTY_PERMANENT_SECRETARY,
]);

/** Roles that only use executive dashboards — no division/unit/section. */
const NO_ORG_ROLES = new Set<string>([
  ROLES.EXECUTIVE,
  ROLES.PERMANENT_SECRETARY,
  ROLES.DEPUTY_PERMANENT_SECRETARY,
  ROLES.SUPER_ADMIN,
  ROLES.DPP_ADMIN,
  ROLES.DPP_ADMINISTRATOR,
  ROLES.PLANNING_OFFICER,
  ROLES.MCIT,
]);

/** Heads of division/unit — division or unit only, never a section. */
const DIVISION_ONLY_ROLES = new Set<string>([
  ROLES.DEPARTMENT_DIRECTOR,
  ROLES.HEAD_OF_UNIT,
]);

/** Focal reporters — may be assigned to a section under a division. */
const SECTION_ROLES = new Set<string>([ROLES.FOCAL_PERSON]);

const FOCAL_ROLES = new Set<string>([
  ROLES.FOCAL_PERSON,
  ROLES.HEAD_OF_UNIT,
  ROLES.DEPARTMENT_DIRECTOR,
]);

export type OrgAssignmentMode = "none" | "division" | "section";

/**
 * Org fields needed when creating/editing a user for the given role(s).
 * - none: Permanent Secretary, Deputy Permanent Secretary, Executive, admins (no division)
 * - division: Head of Division / Head of Unit (no section)
 * - section: Focal person (division + section when available)
 */
export function getOrgAssignmentMode(
  roles: string[] | string | null | undefined
): OrgAssignmentMode {
  const list = Array.isArray(roles) ? roles : roles ? [roles] : [];
  if (list.length === 0) return "division";
  if (list.some((r) => NO_ORG_ROLES.has(r))) return "none";
  if (list.some((r) => SECTION_ROLES.has(r))) return "section";
  if (list.some((r) => DIVISION_ONLY_ROLES.has(r))) return "division";
  return "division";
}

export function roleRequiresDivision(roles: string[] | string | null | undefined): boolean {
  return getOrgAssignmentMode(roles) !== "none";
}

export function roleAllowsSection(roles: string[] | string | null | undefined): boolean {
  return getOrgAssignmentMode(roles) === "section";
}

export interface AuthUserLike {
  roles?: string[];
  role?: string;
  is_superuser?: boolean;
}

/** All roles assigned to the user (membership). */
export function getUserRoles(user: AuthUserLike | null | undefined): string[] {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length > 0) return user.roles;
  if (user.role && user.role !== "user") return [user.role];
  return [];
}

/** Currently selected workspace role (drives menu / home). */
export function getActiveRole(user: AuthUserLike | null | undefined): string {
  if (!user) return "user";
  if (user.role && user.role !== "user") return user.role;
  return getUserRoles(user)[0] || "user";
}

export function canSwitchRole(user: AuthUserLike | null | undefined): boolean {
  return getUserRoles(user).length >= 2;
}

/**
 * Workspace checks use the active role only so Switch Role changes the UI.
 * Superuser with active role SuperAdmin is admin; if they switch to Focalperson,
 * they get the focal workspace.
 */
export function isAdminUser(user: AuthUserLike | null | undefined): boolean {
  if (!user) return false;
  return ADMIN_ROLES.has(getActiveRole(user));
}

export function isExecutiveUser(user: AuthUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAdminUser(user)) return false;
  return EXECUTIVE_ROLES.has(getActiveRole(user));
}

export function canViewExecutiveAnalytics(user: AuthUserLike | null | undefined): boolean {
  if (!user) return false;
  const roles = getUserRoles(user);
  if (user.is_superuser) return true;
  return (
    roles.some((role) => ADMIN_ROLES.has(role)) ||
    roles.some((role) => EXECUTIVE_ROLES.has(role))
  );
}

export function isFocalUser(user: AuthUserLike | null | undefined): boolean {
  if (!user) return false;
  if (isAdminUser(user) || isExecutiveUser(user)) return false;
  const active = getActiveRole(user);
  if (FOCAL_ROLES.has(active)) return true;
  return !ADMIN_ROLES.has(active) && !EXECUTIVE_ROLES.has(active);
}

/** Post-login / home route for the signed-in user (based on active role). */
export function getHomePathForUser(user: AuthUserLike | null | undefined): string {
  if (!user) return "/login";
  if (isExecutiveUser(user)) return "/analytics";
  if (isFocalUser(user)) return "/dashboard";
  return "/users";
}

/** Admin-only paths that focal/executive users should not open. */
export function isAdminOnlyPath(pathname: string): boolean {
  const adminPrefixes = [
    "/users",
    "/roles",
    "/positions",
    "/permissions",
    "/ministry",
    "/divisions",
    "/sections",
    "/units",
    "/reporting-durations",
    "/financial-years",
    "/quarters",
    "/plan-budget-types",
    "/reporting-frequency",
    "/projects",
    "/objectives",
    "/targets",
    "/activities",
    "/tasks",
    "/settings",
  ];
  return adminPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/** Paths reserved for focal reporting workflow. */
export function isFocalOnlyPath(pathname: string): boolean {
  const focalPrefixes = ["/dashboard", "/reporting", "/submitted-reports", "/draft-reports"];
  return focalPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
