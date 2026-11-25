"use client";

import { useState, useEffect } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { getPositionTanStackColumns, Position } from "@/components/tables/columns/positions-tanstack-columns";
import { positionService } from "@/lib/api/position.service";
import { ViewPositionModal } from "@/components/modals/view-position-modal";
import { ErrorDialog } from "@/components/modals/error-dialog";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useErrorDialog } from "@/hooks/use-error-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";

const formFields: FormField[] = [
  {
    name: "name",
    label: "Name",
    type: "text" as const,
    placeholder: "Enter position name",
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

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [viewingPosition, setViewingPosition] = useState<Position | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Position>();

  const columns = getPositionTanStackColumns();

  useEffect(() => {
    fetchPositions(currentPage);
  }, [currentPage, searchQuery]);

  const fetchPositions = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await positionService.getPositionsPaginated(page, searchQuery);
      setPositions(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load positions");
      console.error("Error fetching positions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => { setEditingPosition(null); setIsModalOpen(true); };
  const handleEdit = (position: Position) => { setEditingPosition(position); setIsModalOpen(true); };
  const handleView = (position: Position) => { setViewingPosition(position); setIsViewModalOpen(true); };
  const handleDelete = (position: Position) => confirmDelete(position);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await positionService.deletePosition(deleteDialog.item.id);
      toast.success("Position deleted successfully");
      closeDelete();
      fetchPositions(currentPage);
    } catch (error) {
      showError("Failed to delete position. Please try again.", "Delete Failed");
      closeDelete();
      console.error("Error deleting position:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        description: data.description || undefined,
      };

      if (editingPosition) {
        await positionService.updatePosition(editingPosition.id, payload);
        toast.success("Position updated successfully");
      } else {
        await positionService.createPosition(payload);
        toast.success("Position created successfully");
      }

      fetchPositions(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      toast.error(editingPosition ? "Failed to update position" : "Failed to create position");
      console.error("Error submitting position:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingPosition) return undefined;
    return {
      name: editingPosition.name,
      description: editingPosition.description || "",
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Positions" description="Manage user positions" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={positions}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search positions..."
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
        title={editingPosition ? "Edit Position" : "Add Position"}
        description={editingPosition ? "Update position details" : "Create a new position"}
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ViewPositionModal
        position={viewingPosition}
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
      />
      <ErrorDialog
        isOpen={errorDialog.open}
        onClose={closeError}
        title={errorDialog.title}
        message={errorDialog.message}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Position"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
