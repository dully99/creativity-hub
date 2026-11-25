"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { getRolesTanStackColumns } from "@/components/tables/columns/roles-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { roleService, Role } from "@/lib/api/role.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { AssignRolePermissionModal } from "@/components/modals/assign-role-permission-modal";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Roles",
    description: "Manage user roles and permissions",
    name: "Role Name",
    roleDescription: "Description",
    permissions: "Permissions",
    users: "Users",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addRole: "Add Role",
  },
  sw: {
    title: "Majukumu",
    description: "Simamia majukumu ya watumiaji na ruhusa",
    name: "Jina la Jukumu",
    roleDescription: "Maelezo",
    permissions: "Ruhusa",
    users: "Watumiaji",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addRole: "Ongeza Jukumu",
  },
};

export default function RolesPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [roles, setRoles] = useState<Role[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Role>();
  const [isAssignPermModalOpen, setIsAssignPermModalOpen] = useState(false);
  const [assigningPermRole, setAssigningPermRole] = useState<Role | null>(null);

  const columns = getRolesTanStackColumns(t);

  // Fetch roles on component mount
  useEffect(() => {
    fetchRoles(currentPage);
  }, [currentPage, searchQuery]);

  const fetchRoles = async (page = 1) => {
    try {
      setIsLoading(true);
      const data = await roleService.getRolesPaginated(page, searchQuery);
      setRoles(data.results);
      setTotalCount(data.count);
    } catch (error) {
      toast.error("Failed to load roles");
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: "name",
      label: t.name,
      type: "text",
      placeholder: "Enter role name",
      required: true,
    },
  ];

  const handleAdd = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDelete = (role: Role) => confirmDelete(role);

  const handleAssignPermissions = (role: Role) => {
    setAssigningPermRole(role);
    setIsAssignPermModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await roleService.deleteRole(deleteDialog.item.id);
      toast.success("Role deleted successfully");
      closeDelete();
      fetchRoles(currentPage);
    } catch (error) {
      toast.error("Failed to delete role");
      closeDelete();
      console.error("Error deleting role:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    
    try {
      if (editingRole) {
        // Update existing role
        await roleService.updateRole(editingRole.id, {
          name: data.name,
        });
        toast.success("Role updated successfully");
      } else {
        // Create new role
        await roleService.createRole({
          name: data.name,
        });
        toast.success("Role created successfully");
      }
      
      setIsModalOpen(false);
      fetchRoles(currentPage);
    } catch (error) {
      toast.error(editingRole ? "Failed to update role" : "Failed to create role");
      console.error("Error submitting role:", error);
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
              data={roles}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAssignPermissions={handleAssignPermissions}
              onAdd={handleAdd}
              addButtonLabel={t.addRole}
              searchKey="name"
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
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRole ? "Edit Role" : "Add Role"}
        description={editingRole ? "Update role details" : "Create a new role"}
        fields={formFields}
        initialData={editingRole || undefined}
        onSubmit={handleSubmit}
        submitLabel={editingRole ? "Update" : "Create"}
        isSubmitting={isSubmitting}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Role"
        entityName={deleteDialog.item?.name ?? ""}
      />
      <AssignRolePermissionModal
        isOpen={isAssignPermModalOpen}
        onClose={() => setIsAssignPermModalOpen(false)}
        roleId={assigningPermRole?.id ?? 0}
        roleName={assigningPermRole?.name ?? ""}
        onSuccess={fetchRoles}
      />
    </div>
  );
}
