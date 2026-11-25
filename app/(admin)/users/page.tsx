"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { UserFormModal } from "@/components/modals/user-form-modal";
import { InviteEmailDialog } from "@/components/modals/invite-email-dialog";
import { ResetUserPasswordModal } from "@/components/modals/reset-user-password-modal";
import { AssignRoleModal } from "@/components/modals/assign-role-modal";
import { RemoveRoleModal } from "@/components/modals/remove-role-modal";
import { AssignPermissionModal } from "@/components/modals/assign-permission-modal";
import { AssignDepartmentModal } from "@/components/modals/assign-department-modal";
import { AssignUnitModal } from "@/components/modals/assign-unit-modal";
import { getUsersTanStackColumns } from "@/components/tables/columns/users-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { userService, User } from "@/lib/api/user.service";
import { divisionService, Division } from "@/lib/api/division.service";
import { roleService, Role } from "@/lib/api/role.service";
import { ErrorDialog } from "@/components/modals/error-dialog";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useErrorDialog } from "@/hooks/use-error-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Users",
    description: "Manage team members and access",
    name: "Name",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    role: "Role",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addUser: "Add User",
    gender: "Gender",
    jobTitle: "Job Title",
    unitDivision: "Unit/Division",
    section: "Section",
  },
  sw: {
    title: "Watumiaji",
    description: "Simamia wanachama wa timu na ufikiaji",
    name: "Jina",
    firstName: "Jina la Kwanza",
    lastName: "Jina la Mwisho",
    email: "Barua pepe",
    role: "Jukumu",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addUser: "Ongeza Mtumiaji",
    gender: "Jinsia",
    jobTitle: "Cheo cha Kazi",
    unitDivision: "Kitengo/Idara",
    section: "Sehemu",
  },
};

export default function UsersPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<{
    email: string;
    emailSent: boolean;
    expiresHours: number;
  } | null>(null);
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { confirm, closeConfirm, runConfirm, confirmDialog } = useConfirmDialog();
  const [isAssignRoleModalOpen, setIsAssignRoleModalOpen] = useState(false);
  const [assigningUser, setAssigningUser] = useState<User | null>(null);
  const [isRemoveRoleModalOpen, setIsRemoveRoleModalOpen] = useState(false);
  const [removingRoleUser, setRemovingRoleUser] = useState<User | null>(null);
  const [isAssignPermissionModalOpen, setIsAssignPermissionModalOpen] = useState(false);
  const [assigningPermissionsUser, setAssigningPermissionsUser] = useState<User | null>(null);
  const [isAssignDepartmentModalOpen, setIsAssignDepartmentModalOpen] = useState(false);
  const [assigningDepartmentUser, setAssigningDepartmentUser] = useState<User | null>(null);
  const [isAssignUnitModalOpen, setIsAssignUnitModalOpen] = useState(false);
  const [assigningUnitUser, setAssigningUnitUser] = useState<User | null>(null);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<User | null>(null);

  const columns = getUsersTanStackColumns(t);

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchDropdowns = async () => {
    try {
      const [divRes, roleRes] = await Promise.all([
        divisionService.getDivisions(),
        roleService.getRoles(),
      ]);
      setDivisions(divRes);
      setRoles(roleRes);
    } catch (error) {
      console.error("Error fetching dropdowns:", error);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await userService.getUsers({ page, search: searchQuery });
      setUsers(response.results);
      setTotalCount(response.count);
    } catch (error) {
      showError("Failed to load users. Please try again.", "Load Failed");
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAssignRole = (user: User) => {
    setAssigningUser(user);
    setIsAssignRoleModalOpen(true);
  };

  const handleRemoveRole = (user: User) => {
    setRemovingRoleUser(user);
    setIsRemoveRoleModalOpen(true);
  };

  const handleAssignPermissions = (user: User) => {
    setAssigningPermissionsUser(user);
    setIsAssignPermissionModalOpen(true);
  };

  const handleAssignDepartment = (user: User) => {
    setAssigningDepartmentUser(user);
    setIsAssignDepartmentModalOpen(true);
  };

  const handleAssignUnit = (user: User) => {
    setAssigningUnitUser(user);
    setIsAssignUnitModalOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setResetPasswordUser(user);
    setIsResetPasswordModalOpen(true);
  };

  const handleDeactivate = (user: User) => {
    const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
    confirm({
      title: "Deactivate User",
      description: `Deactivate "${name}"? They will no longer be able to sign in.`,
      confirmLabel: "Deactivate",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await userService.deactivateUser(user.id);
          toast.success("User deactivated successfully");
          fetchUsers(currentPage);
        } catch (error) {
          showError("Failed to deactivate user. Please try again.", "Deactivate Failed");
          console.error("Error deactivating user:", error);
          throw new Error("deactivate failed");
        }
      },
    });
  };

  const handleActivate = (user: User) => {
    const name = `${user.first_name} ${user.last_name}`.trim() || user.email;
    confirm({
      title: "Activate User",
      description: `Activate "${name}"? They will be able to sign in again.`,
      confirmLabel: "Activate",
      onConfirm: async () => {
        try {
          await userService.activateUser(user.id);
          toast.success("User activated successfully");
          fetchUsers(currentPage);
        } catch (error) {
          showError("Failed to activate user. Please try again.", "Activate Failed");
          console.error("Error activating user:", error);
          throw new Error("activate failed");
        }
      },
    });
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const userData = {
          first_name: data.first_name as string,
          last_name: data.last_name as string,
          email: data.email as string,
          gender: (data.gender || undefined) as "M" | "F" | "O" | undefined,
          job_title: (data.job_title || undefined) as string | undefined,
          division:
            data.division === null || data.division === undefined || data.division === ""
              ? null
              : parseInt(String(data.division), 10),
        };
        await userService.updateUser(editingUser.id, userData);
        toast.success("User updated successfully");
        setIsModalOpen(false);
      } else {
        if (!data.role_id) {
          showError("Please select a role for the user.", "Create Failed");
          return;
        }
        const created = await userService.createUser({
          first_name: data.first_name as string,
          last_name: data.last_name as string,
          email: data.email as string,
          gender: (data.gender || undefined) as "M" | "F" | "O" | undefined,
          job_title: (data.job_title || undefined) as string | undefined,
          role_id: Number(data.role_id),
          division:
            data.division === null || data.division === undefined || data.division === ""
              ? null
              : parseInt(String(data.division), 10),
        });
        setIsModalOpen(false);
        setCreatedInvite({
          email: created.email,
          emailSent: !!created.password_email_sent,
          expiresHours: created.invite_expires_hours ?? 48,
        });
        toast.success(
          created.password_email_sent
            ? "User created. A set-password link was emailed."
            : "User created. They must set a password from the emailed link or an admin reset."
        );
      }

      fetchUsers(currentPage);
    } catch (error) {
      showError(
        error instanceof Error && error.message
          ? error.message
          : editingUser
            ? "Failed to update user. Please try again."
            : "Failed to create user. Please try again.",
        editingUser ? "Update Failed" : "Create Failed"
      );
      console.error("Error submitting user:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={users}
              onEdit={handleEdit}
              onAssignRole={handleAssignRole}
              onRemoveRole={handleRemoveRole}
              onAssignPermissions={handleAssignPermissions}
              onAssignDepartment={handleAssignDepartment}
              onAssignUnit={handleAssignUnit}
              onResetPassword={handleResetPassword}
              onDeactivate={handleDeactivate}
              onActivate={handleActivate}
              onAdd={handleAdd}
              addButtonLabel={t.addUser}
              searchKey="fullName"
              searchPlaceholder={`Search ${t.title.toLowerCase()}...`}
              totalCount={totalCount}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              onSearchChange={(value) => {
                setSearchQuery(value);
                setCurrentPage(1);
              }}
            
              isLoading={isLoading}
            />
        </CardContent>
      </Card>
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        divisions={divisions}
        roles={roles}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        labels={{
          firstName: t.firstName,
          lastName: t.lastName,
          email: t.email,
          gender: t.gender,
          jobTitle: t.jobTitle,
          unitDivision: t.unitDivision,
          section: t.section,
          role: t.role,
        }}
      />
      <InviteEmailDialog
        isOpen={!!createdInvite}
        onClose={() => setCreatedInvite(null)}
        email={createdInvite?.email ?? ""}
        emailSent={createdInvite?.emailSent}
        expiresHours={createdInvite?.expiresHours}
      />
      
      <AssignRoleModal
        isOpen={isAssignRoleModalOpen}
        onClose={() => setIsAssignRoleModalOpen(false)}
        userId={assigningUser ? assigningUser.id : 0}
        userName={assigningUser ? `${assigningUser.first_name} ${assigningUser.last_name}` : ""}
        currentRoles={assigningUser?.roles || []}
        onSuccess={() => fetchUsers(currentPage)}
      />

      <RemoveRoleModal
        isOpen={isRemoveRoleModalOpen}
        onClose={() => setIsRemoveRoleModalOpen(false)}
        userId={removingRoleUser ? removingRoleUser.id : 0}
        userName={removingRoleUser ? `${removingRoleUser.first_name} ${removingRoleUser.last_name}`.trim() || removingRoleUser.email : ""}
        currentRoles={removingRoleUser?.roles || []}
        onSuccess={() => fetchUsers(currentPage)}
      />

      <AssignPermissionModal
        isOpen={isAssignPermissionModalOpen}
        onClose={() => setIsAssignPermissionModalOpen(false)}
        userId={assigningPermissionsUser ? assigningPermissionsUser.id : 0}
        userName={assigningPermissionsUser ? `${assigningPermissionsUser.first_name} ${assigningPermissionsUser.last_name}` : ""}
        currentPermissions={assigningPermissionsUser?.permissions || []}
        onSuccess={() => fetchUsers(currentPage)}
      />

      <AssignDepartmentModal
        isOpen={isAssignDepartmentModalOpen}
        onClose={() => setIsAssignDepartmentModalOpen(false)}
        userId={assigningDepartmentUser ? assigningDepartmentUser.id : 0}
        userName={assigningDepartmentUser ? `${assigningDepartmentUser.first_name} ${assigningDepartmentUser.last_name}` : ""}
        onSuccess={() => fetchUsers(currentPage)}
      />

      <AssignUnitModal
        isOpen={isAssignUnitModalOpen}
        onClose={() => setIsAssignUnitModalOpen(false)}
        userId={assigningUnitUser ? assigningUnitUser.id : 0}
        userName={assigningUnitUser ? `${assigningUnitUser.first_name} ${assigningUnitUser.last_name}` : ""}
        onSuccess={() => fetchUsers(currentPage)}
      />
      <ResetUserPasswordModal
        isOpen={isResetPasswordModalOpen}
        onClose={() => {
          setIsResetPasswordModalOpen(false);
          setResetPasswordUser(null);
        }}
        userId={resetPasswordUser?.id ?? 0}
        userName={
          resetPasswordUser
            ? `${resetPasswordUser.first_name} ${resetPasswordUser.last_name}`.trim()
            : ""
        }
        userEmail={resetPasswordUser?.email ?? ""}
        onSuccess={() => fetchUsers(currentPage)}
      />
      <ErrorDialog
        isOpen={errorDialog.open}
        onClose={closeError}
        title={errorDialog.title}
        message={errorDialog.message}
      />
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={runConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
        icon={confirmDialog.icon}
      />
    </div>
  );
}
