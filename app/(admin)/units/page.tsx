"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewUnitModal } from "@/components/modals/view-unit-modal";
import { getUnitsTanStackColumns } from "@/components/tables/columns/units-tanstack-columns";
import { useLanguageStore } from "@/store/useLanguageStore";
import { unitService, Unit } from "@/lib/api/unit.service";
import { ministryService, Ministry } from "@/lib/api/ministry.service";
import { userService, User } from "@/lib/api/user.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const translations = {
  en: {
    title: "Units",
    description: "Manage standalone organizational units (not under any division)",
    name: "Unit Name",
    code: "Sub Vote",
    ministry: "Ministry",
    desc: "Description",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    addUnit: "Add Unit",
  },
  sw: {
    title: "Vitengo",
    description: "Simamia vitengo huru visivyohusishwa na kitengo chochote",
    name: "Jina la Kitengo",
    code: "Sub Vote",
    ministry: "Wizara",
    desc: "Maelezo",
    status: "Hali",
    active: "Hai",
    inactive: "Haifanyi kazi",
    addUnit: "Ongeza Kitengo",
  },
};

export default function UnitsPage() {
  const language = useLanguageStore((state) => state.language);
  const t = translations[language];

  const [units, setUnits] = useState<Unit[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Unit>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUnitId, setViewingUnitId] = useState<number>(0);

  const columns = getUnitsTanStackColumns(t, users);

  useEffect(() => {
    fetchUnits(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchMinistries();
    fetchUsers();
  }, []);

  const fetchUnits = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await unitService.getUnits({ page, search: searchQuery });
      setUnits(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load units");
      console.error("Error fetching units:", error);
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
      placeholder: "Enter unit name",
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
      label: t.ministry,
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
    setEditingUnit(null);
    setIsModalOpen(true);
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setIsModalOpen(true);
  };

  const handleView = (unit: Unit) => {
    setViewingUnitId(unit.id);
    setIsViewModalOpen(true);
  };

  const handleDelete = (unit: Unit) => confirmDelete(unit);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await unitService.deleteUnit(deleteDialog.item.id);
      toast.success("Unit deleted successfully");
      closeDelete();
      fetchUnits(currentPage);
    } catch (error) {
      toast.error("Failed to delete unit");
      closeDelete();
      console.error("Error deleting unit:", error);
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
        is_active: data.is_active === "true",
      };

      if (editingUnit) {
        await unitService.updateUnit(editingUnit.id, payload);
        toast.success("Unit updated successfully");
      } else {
        await unitService.createUnit(payload);
        toast.success("Unit created successfully");
      }

      fetchUnits(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingUnit ? "Failed to update unit" : "Failed to create unit");
      console.error("Error submitting unit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingUnit) return undefined;

    return {
      name: editingUnit.name,
      code: editingUnit.code,
      desc: editingUnit.description || "",
      ministry: editingUnit.ministry?.toString() || "",
      is_active: editingUnit.is_active ? "true" : "false",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title={t.title} description={t.description} />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={units}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onAdd={handleAdd}
              addButtonLabel={t.addUnit}
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
        title={editingUnit ? "Edit Unit" : "Add Unit"}
        description={editingUnit ? "Update unit details" : "Create a standalone unit (not under any division)"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        submitLabel={editingUnit ? "Update" : "Create"}
        isSubmitting={isSubmitting}
      />
      <ViewUnitModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        unitId={viewingUnitId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Unit"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
