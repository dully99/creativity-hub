"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewPlanBudgetTypeModal } from "@/components/modals/view-plan-budget-type-modal";
import { getPlanBudgetTypeTanStackColumns } from "@/components/tables/columns/plan-budget-type-tanstack-columns";
import { planBudgetTypeService, PlanBudgetType } from "@/lib/api/plan-budget-type.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const formFields: FormField[] = [
  {
    name: "type",
    label: "Type",
    type: "select" as const,
    options: [
      { value: "recurring", label: "Recurring" },
      { value: "development", label: "Development" },
    ],
    required: true,
  },
  {
    name: "description",
    label: "Description",
    type: "textarea" as const,
    placeholder: "Enter description",
    required: false,
  },
];

export default function PlanBudgetTypesPage() {
  const [planBudgetTypes, setPlanBudgetTypes] = useState<PlanBudgetType[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingType, setEditingType] = useState<PlanBudgetType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<PlanBudgetType>();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingTypeId, setViewingTypeId] = useState<number>(0);

  const columns = getPlanBudgetTypeTanStackColumns();

  useEffect(() => {
    fetchPlanBudgetTypes(currentPage);
  }, [currentPage, searchQuery]);

  const fetchPlanBudgetTypes = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await planBudgetTypeService.getPlanBudgetTypesPaginated(page, searchQuery);
      setPlanBudgetTypes(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load plan budget types");
      console.error("Error fetching plan budget types:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingType(null);
    setIsModalOpen(true);
  };

  const handleEdit = (type: PlanBudgetType) => {
    setEditingType(type);
    setIsModalOpen(true);
  };

  const handleDelete = (type: PlanBudgetType) => confirmDelete(type);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await planBudgetTypeService.deletePlanBudgetType(deleteDialog.item.id);
      toast.success("Plan budget type deleted successfully");
      closeDelete();
      fetchPlanBudgetTypes(currentPage);
    } catch (error) {
      toast.error("Failed to delete plan budget type");
      closeDelete();
      console.error("Error deleting plan budget type:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleView = (type: PlanBudgetType) => {
    setViewingTypeId(type.id);
    setIsViewModalOpen(true);
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        type: data.type,
        description: data.description || undefined,
      };

      if (editingType) {
        await planBudgetTypeService.updatePlanBudgetType(editingType.id, payload);
        toast.success("Plan budget type updated successfully");
      } else {
        await planBudgetTypeService.createPlanBudgetType(payload);
        toast.success("Plan budget type created successfully");
      }

      fetchPlanBudgetTypes(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingType ? "Failed to update plan budget type" : "Failed to create plan budget type");
      console.error("Error submitting plan budget type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingType) return undefined;
    return {
      type: editingType.type,
      description: editingType.description || "",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Plan Budget Types" description="Manage Plan Budget Types" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={planBudgetTypes}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              searchKey="type"
              searchPlaceholder="Search plan budget types..."
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
        title={editingType ? "Edit Plan Budget Type" : "Add Plan Budget Type"}
        description={editingType ? "Update plan budget type information" : "Create a new plan budget type"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      <ViewPlanBudgetTypeModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        planBudgetTypeId={viewingTypeId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Plan Budget Type"
        entityName={deleteDialog.item?.type ?? ""}
      />
    </div>
  );
}
