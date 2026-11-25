"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Division } from "@/lib/api/division.service";
import { Role } from "@/lib/api/role.service";
import { User } from "@/lib/api/user.service";
import { getOrgAssignmentMode, type OrgAssignmentMode } from "@/lib/auth-roles";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingUser: User | null;
  divisions: Division[];
  roles?: Role[];
  onSubmit: (data: Record<string, unknown>) => void;
  isSubmitting?: boolean;
  labels: {
    firstName: string;
    lastName: string;
    email: string;
    gender: string;
    jobTitle: string;
    unitDivision: string;
    section: string;
    role?: string;
  };
}

const inputClass =
  "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pr-8`;

function getParentId(item: Division) {
  return item.parent ?? item.parent_id ?? null;
}

function orgHint(mode: OrgAssignmentMode): string | null {
  if (mode === "none") {
    return "This role uses the executive dashboard and does not need a division, unit, or section.";
  }
  if (mode === "division") {
    return "Assign a division or unit only. Section is not required for heads of division/unit.";
  }
  return null;
}

export function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  divisions,
  roles = [],
  onSubmit,
  isSubmitting = false,
  labels,
}: UserFormModalProps) {
  const [unitDivisionId, setUnitDivisionId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [roleId, setRoleId] = useState("");

  const unitsAndDivisions = useMemo(
    () => divisions.filter((d) => d.division_type === "department" || d.division_type === "unit"),
    [divisions]
  );

  const sections = useMemo(
    () => divisions.filter((d) => d.division_type === "section"),
    [divisions]
  );

  const selectedRoleName = useMemo(() => {
    if (editingUser?.roles?.length) return editingUser.roles[0];
    return roles.find((r) => r.id.toString() === roleId)?.name ?? "";
  }, [editingUser, roles, roleId]);

  const orgMode = getOrgAssignmentMode(selectedRoleName);
  const needsOrg = orgMode !== "none";
  const allowsSection = orgMode === "section";

  const selectedUnitDivision = useMemo(
    () => unitsAndDivisions.find((d) => d.id.toString() === unitDivisionId),
    [unitsAndDivisions, unitDivisionId]
  );

  const availableSections = useMemo(() => {
    if (!allowsSection) return [];
    if (!unitDivisionId || selectedUnitDivision?.division_type !== "department") {
      return [];
    }
    return sections.filter((s) => getParentId(s)?.toString() === unitDivisionId);
  }, [allowsSection, sections, unitDivisionId, selectedUnitDivision]);

  const showSectionField = allowsSection && availableSections.length > 0;

  useEffect(() => {
    if (!isOpen) return;

    if (!editingUser) {
      setRoleId("");
      setUnitDivisionId("");
      setSectionId("");
      return;
    }

    const matchedRole = roles.find((r) => editingUser.roles?.includes(r.name));
    setRoleId(matchedRole ? matchedRole.id.toString() : "");

    if (!editingUser.division) {
      setUnitDivisionId("");
      setSectionId("");
      return;
    }

    const assigned = divisions.find((d) => d.id === editingUser.division);
    if (!assigned) {
      setUnitDivisionId("");
      setSectionId("");
      return;
    }

    if (assigned.division_type === "section") {
      setUnitDivisionId(getParentId(assigned)?.toString() ?? "");
      setSectionId(assigned.id.toString());
      return;
    }

    setUnitDivisionId(assigned.id.toString());
    setSectionId("");
  }, [isOpen, editingUser, divisions, roles]);

  useEffect(() => {
    if (!needsOrg) {
      setUnitDivisionId("");
      setSectionId("");
      return;
    }
    if (!allowsSection) {
      setSectionId("");
    }
  }, [needsOrg, allowsSection, roleId]);

  const handleUnitDivisionChange = (value: string) => {
    setUnitDivisionId(value);
    setSectionId("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    let divisionValue: string | undefined;
    if (!needsOrg) {
      divisionValue = undefined;
    } else if (showSectionField && sectionId) {
      divisionValue = sectionId;
    } else {
      divisionValue = unitDivisionId || undefined;
    }

    onSubmit({
      first_name: formData.get("first_name"),
      last_name: formData.get("last_name"),
      email: formData.get("email"),
      gender: formData.get("gender") || undefined,
      job_title: formData.get("job_title") || undefined,
      division: needsOrg ? divisionValue : null,
      ...(editingUser
        ? {}
        : {
            role_id: roleId ? parseInt(roleId, 10) : undefined,
          }),
    });
  };

  const hint = orgHint(orgMode);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] max-h-[90vh] flex flex-col">
        <DialogHeader className="pb-3">
          <DialogTitle className="text-lg font-semibold">
            {editingUser ? "Edit User" : "Add User"}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {editingUser ? "Update user details" : "Create a new user"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="grid grid-cols-1 gap-y-3 py-2 overflow-y-auto flex-1 pr-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">
                {labels.firstName} <span className="text-red-500">*</span>
              </label>
              <input
                name="first_name"
                type="text"
                required
                placeholder="Enter first name"
                defaultValue={editingUser?.first_name ?? ""}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">
                {labels.lastName} <span className="text-red-500">*</span>
              </label>
              <input
                name="last_name"
                type="text"
                required
                placeholder="Enter last name"
                defaultValue={editingUser?.last_name ?? ""}
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">
                {labels.email} <span className="text-red-500">*</span>
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="Enter email address"
                defaultValue={editingUser?.email ?? ""}
                className={inputClass}
              />
            </div>
            {!editingUser && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    {labels.role ?? "Role"} <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={roleId}
                    onChange={(e) => setRoleId(e.target.value)}
                    required
                    className={selectClass}
                  >
                    <option value="">Select role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {hint ? (
                    <p className="text-xs text-muted-foreground">{hint}</p>
                  ) : null}
                </div>
              </>
            )}
            {editingUser && hint ? (
              <p className="text-xs text-muted-foreground rounded-md border bg-muted/40 px-3 py-2">
                {hint}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">{labels.gender}</label>
              <select name="gender" defaultValue={editingUser?.gender ?? ""} className={selectClass}>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium leading-none">{labels.jobTitle}</label>
              <input
                name="job_title"
                type="text"
                placeholder="Enter job title"
                defaultValue={editingUser?.job_title ?? ""}
                className={inputClass}
              />
            </div>
            {needsOrg && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  {labels.unitDivision} <span className="text-red-500">*</span>
                </label>
                <select
                  value={unitDivisionId}
                  onChange={(e) => handleUnitDivisionChange(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select Unit/Division</option>
                  {unitsAndDivisions.map((d) => (
                    <option key={d.id} value={d.id.toString()}>
                      {d.code ? `${d.code} — ` : ""}
                      {d.name}
                      {d.division_type === "unit" ? " (Unit)" : " (Division)"}
                    </option>
                  ))}
                </select>
              </div>
            )}
            {showSectionField && (
              <div className="space-y-1.5">
                <label className="text-sm font-medium leading-none">
                  {labels.section} <span className="text-red-500">*</span>
                </label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  required
                  className={selectClass}
                >
                  <option value="">Select Section</option>
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.code ? `${s.code} — ` : ""}
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter className="pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="h-9">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 bg-black hover:bg-black/90 text-white"
            >
              {isSubmitting ? "Saving..." : editingUser ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
