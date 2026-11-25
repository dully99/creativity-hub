"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewDivisionModal } from "@/components/modals/view-division-modal";
import { getDivisionsTanStackColumns } from "@/components/tables/columns/divisions-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { departmentService, Department } from "@/lib/api/department.service";
import { ministryService, Ministry } from "@/lib/api/ministry.service";
import { userService, User } from "@/lib/api/user.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Divisions",
    description: "Manage organizational divisions",
    name: "Division Name",
    code: "Sub Vote",
    desc: "Description",
    head: "Division Head",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addDivision: "Add Division",
  },
  sw: {
    title: "Vitengo",
    description: "Simamia vitengo vya shirika",
    name: "Jina la Kitengo",
    code: "Sub Vote",
    desc: "Maelezo",
    head: "Mkuu wa Kitengo",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addDivision: "Ongeza Kitengo",
  },
};

export default function DivisionsPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [divisions, setDivisions] = useState<Department[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDivision, setEditingDivision] = useState<Department | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Department>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDivisionId, setViewingDivisionId] = useState<number>(0);

  const columns = getDivisionsTanStackColumns(t, users);

  useEffect(() => {
    fetchDivisions(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchMinistries();
    fetchUsers();
  }, []);

  const fetchDivisions = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await departmentService.getDepartments({ page, search: searchQuery });
      setDivisions(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load divisions");
      console.error("Error fetching divisions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMinistries = async () => {
    try {
      const response = await ministryService.getMinistries();
      setMinistries(response.results);
    } catch (error) {
      toast.error("Failed to load ministries");
      console.error("Error fetching ministries:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers();
      setUsers(response.results);
    } catch (error) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", error);
    }
  };

  const formFields: FormField[] = useMemo(() => [
    {
      name: "name",
      label: t.name,
      type: "text" as const,
      placeholder: "Enter division name",
      required: true,
    },
    {
      name: "code",
      label: t.code,
      type: "text" as const,
      placeholder: "Enter sub vote",
      required: true,
    },
    {
      name: "desc",
      label: t.desc,
      type: "textarea" as const,
      placeholder: "Enter description",
      required: false,
    },
    {
      name: "ministry",
      label: "Ministry",
      type: "select" as const,
      options: ministries.map((m) => ({ value: m.id.toString(), label: m.name })),
      placeholder: "Select ministry",
      required: true,
    },
    {
      name: "is_active",
      label: t.status,
      type: "select" as const,
      options: [
        { value: "true", label: t.active },
        { value: "false", label: t.inactive },
      ],
      required: true,
    },
  ], [t, ministries]);

  const handleAdd = () => {
    setEditingDivision(null);
    setIsModalOpen(true);
  };

  const handleEdit = (division: Department) => {
    setEditingDivision(division);
    setIsModalOpen(true);
  };

  const handleView = (division: Department) => {
    setViewingDivisionId(division.id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (division: Department) => confirmDelete(division);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await departmentService.deleteDepartment(deleteDialog.item.id);
      toast.success("Division deleted successfully");
      closeDelete();
      fetchDivisions(currentPage);
    } catch (error) {
      toast.error("Failed to delete division");
      closeDelete();
      console.error("Error deleting division:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    
    try {
      const payload = {
        name: data.name,
        code: data.code,
        description: data.desc || "",
        ministry: parseInt(data.ministry),
        head_of_department: data.head_of_department ? parseInt(data.head_of_department) : undefined,
        is_active: data.is_active === "true",
      };

      if (editingDivision) {
        await departmentService.updateDepartment(editingDivision.id, payload);
        toast.success("Division updated successfully");
      } else {
        await departmentService.createDepartment(payload);
        toast.success("Division created successfully");
      }
      
      fetchDivisions(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingDivision ? "Failed to update division" : "Failed to create division");
      console.error("Error submitting division:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingDivision) return undefined;
    
    return {
      name: editingDivision.name,
      code: editingDivision.code,
      desc: editingDivision.description || "",
      ministry: editingDivision.ministry?.toString() || "",
      head_of_department: editingDivision.head_of_department?.toString() || "",
      is_active: editingDivision.is_active ? "true" : "false",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={divisions}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              addButtonLabel={t.addDivision}
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
        title={editingDivision ? "Edit Division" : "Add Division"}
        description={editingDivision ? "Update division details" : "Create a new division"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        submitLabel={editingDivision ? "Update" : "Create"}
        isSubmitting={isSubmitting}
      />
      <ViewDivisionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        divisionId={viewingDivisionId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Division"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
