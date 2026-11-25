"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { getMinistryTanStackColumns } from "@/components/tables/columns/ministry-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { ministryService, Ministry } from "@/lib/api/ministry.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Ministries",
    description: "Manage government ministries (votes)",
    name: "Ministry Name",
    code: "Code",
    desc: "Description",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addMinistry: "Add Ministry",
  },
  sw: {
    title: "Wizara",
    description: "Simamia wizara za serikali",
    name: "Jina la Wizara",
    code: "Kodi",
    desc: "Maelezo",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addMinistry: "Ongeza Wizara",
  },
};

export default function MinistryPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMinistry, setEditingMinistry] = useState<Ministry | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Ministry>();

  const columns = getMinistryTanStackColumns(t);

  useEffect(() => {
    fetchMinistries(currentPage);
  }, [currentPage, searchQuery]);

  const fetchMinistries = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await ministryService.getMinistries({ page, search: searchQuery });
      setMinistries(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load ministries");
      console.error("Error fetching ministries:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = [
    {
      name: "name",
      label: t.name,
      type: "text" as const,
      placeholder: "Enter ministry name",
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
      name: "is_active",
      label: t.status,
      type: "select" as const,
      options: [
        { value: "true", label: t.active },
        { value: "false", label: t.inactive },
      ],
      required: true,
    },
  ];

  const handleAdd = () => {
    setEditingMinistry(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ministry: Ministry) => {
    setEditingMinistry(ministry);
    setIsModalOpen(true);
  };

  const handleDelete = (ministry: Ministry) => confirmDelete(ministry);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await ministryService.deleteMinistry(deleteDialog.item.id);
      toast.success("Ministry deleted successfully");
      closeDelete();
      fetchMinistries(currentPage);
    } catch (error) {
      toast.error("Failed to delete ministry");
      closeDelete();
      console.error("Error deleting ministry:", error);
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
        is_active: data.is_active === "true",
      };

      if (editingMinistry) {
        await ministryService.updateMinistry(editingMinistry.id, payload);
        toast.success("Ministry updated successfully");
      } else {
        await ministryService.createMinistry(payload);
        toast.success("Ministry created successfully");
      }
      
      fetchMinistries(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingMinistry ? "Failed to update ministry" : "Failed to create ministry");
      console.error("Error submitting ministry:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingMinistry) return undefined;
    
    return {
      name: editingMinistry.name,
      code: editingMinistry.code,
      desc: editingMinistry.description || "",
      is_active: editingMinistry.is_active ? "true" : "false",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={ministries}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              addButtonLabel={t.addMinistry}
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
        title={editingMinistry ? "Edit Ministry" : "Add Ministry"}
        description={editingMinistry ? "Update ministry details" : "Create a new ministry"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        submitLabel={editingMinistry ? "Update" : "Create"}
        isSubmitting={isSubmitting}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Ministry"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
