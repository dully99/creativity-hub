"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewSectionModal } from "@/components/modals/view-section-modal";
import { getSectionsTanStackColumns } from "@/components/tables/columns/sections-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { sectionService, Section } from "@/lib/api/section.service";
import { departmentService, Department } from "@/lib/api/department.service";
import { userService, User } from "@/lib/api/user.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Sections",
    description: "Manage sections under divisions",
    name: "Section Name",
    code: "Code",
    division: "Division",
    desc: "Description",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addSection: "Add Section",
  },
  sw: {
    title: "Sehemu",
    description: "Simamia sehemu chini ya vitengo",
    name: "Jina la Sehemu",
    code: "Kodi",
    division: "Kitengo",
    desc: "Maelezo",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addSection: "Ongeza Sehemu",
  },
};

export default function SectionsPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [sections, setSections] = useState<Section[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [divisions, setDivisions] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Section>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingSectionId, setViewingSectionId] = useState<number>(0);

  const columns = getSectionsTanStackColumns(t, users, divisions);

  useEffect(() => {
    fetchSections(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDivisions();
    fetchUsers();
  }, []);

  const fetchSections = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await sectionService.getSections({ page, search: searchQuery });
      setSections(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load sections");
      console.error("Error fetching sections:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDivisions = async () => {
    try {
      const response = await departmentService.getDepartments();
      setDivisions(response.results);
    } catch (error) {
      toast.error("Failed to load divisions");
      console.error("Error fetching divisions:", error);
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
      placeholder: "Enter section name",
      required: true,
    },
    {
      name: "code",
      label: t.code,
      type: "text" as const,
      placeholder: "Enter code",
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
      name: "division",
      label: t.division,
      type: "select" as const,
      options: divisions.map((d) => ({ value: d.id.toString(), label: d.name })),
      placeholder: "Select division",
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
  ], [t, divisions]);

  const handleAdd = () => {
    setEditingSection(null);
    setIsModalOpen(true);
  };

  const handleEdit = (section: Section) => {
    setEditingSection(section);
    setIsModalOpen(true);
  };

  const handleView = (section: Section) => {
    setViewingSectionId(section.id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (section: Section) => confirmDelete(section);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await sectionService.deleteSection(deleteDialog.item.id);
      toast.success("Section deleted successfully");
      closeDelete();
      fetchSections(currentPage);
    } catch (error) {
      toast.error("Failed to delete section");
      closeDelete();
      console.error("Error deleting section:", error);
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
        division: parseInt(data.division),
        is_active: data.is_active === "true",
      };

      if (editingSection) {
        await sectionService.updateSection(editingSection.id, payload);
        toast.success("Section updated successfully");
      } else {
        await sectionService.createSection(payload);
        toast.success("Section created successfully");
      }

      fetchSections(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingSection ? "Failed to update section" : "Failed to create section");
      console.error("Error submitting section:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingSection) return undefined;

    return {
      name: editingSection.name,
      code: editingSection.code,
      desc: editingSection.description || "",
      division: editingSection.division?.toString() || "",
      is_active: editingSection.is_active ? "true" : "false",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={sections}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              addButtonLabel={t.addSection}
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
        title={editingSection ? "Edit Section" : "Add Section"}
        description={editingSection ? "Update section details" : "Create a new section under a division"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        submitLabel={editingSection ? "Update" : "Create"}
        isSubmitting={isSubmitting}
      />
      <ViewSectionModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        sectionId={viewingSectionId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Section"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
