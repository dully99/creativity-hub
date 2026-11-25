"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { getTargetTanStackColumns } from "@/components/tables/columns/targets-tanstack-columns";
import { targetService, Target } from "@/lib/api/target.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { objectiveService, Objective } from "@/lib/api/objective.service";
import { divisionService, Division } from "@/lib/api/division.service";
import { ViewTargetModal } from "@/components/modals/view-target-modal";
import { ErrorDialog } from "@/components/modals/error-dialog";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useErrorDialog } from "@/hooks/use-error-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function divisionOptionLabel(d: Division): string {
  const typeLabel =
    d.division_type === "unit"
      ? "Unit"
      : d.division_type === "department"
        ? "Division"
        : d.division_type
          ? d.division_type.charAt(0).toUpperCase() + d.division_type.slice(1)
          : "Division";
  return `${d.name} (${typeLabel})`;
}

export default function TargetsPage() {
  const [targets, setTargets] = useState<Target[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Target>();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<Target | null>(null);
  const [viewingTarget, setViewingTarget] = useState<Target | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedObjectiveId, setSelectedObjectiveId] = useState("");
  const [selectedDivisionId, setSelectedDivisionId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const columns = getTargetTanStackColumns();

  const divisionOptions = useMemo(
    () =>
      divisions.filter(
        (d) => d.division_type === "department" || d.division_type === "unit"
      ),
    [divisions]
  );

  useEffect(() => {
    fetchTargets(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const [objResult, divResult] = await Promise.allSettled([
      objectiveService.getObjectives(),
      divisionService.getDivisions(),
    ]);

    if (objResult.status === "fulfilled") {
      setObjectives(objResult.value.results ?? []);
    } else {
      console.error("Error fetching objectives:", objResult.reason);
      toast.error("Failed to load objectives");
    }

    if (divResult.status === "fulfilled") {
      setDivisions(divResult.value);
    } else {
      console.error("Error fetching divisions:", divResult.reason);
      toast.error("Failed to load divisions/units");
    }
  };

  const fetchTargets = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await targetService.getTargetsPaginated(page, searchQuery);
      setTargets(response.results);
      setTotalCount(response.count);
    } catch (error) {
      showError("Failed to load targets. Please try again.", "Load Failed");
      console.error("Error fetching targets:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedObjectiveId("");
    setSelectedDivisionId("");
    setFormName("");
    setFormCode("");
    setFormDescription("");
  };

  const handleObjectiveChange = (value: string) => {
    setSelectedObjectiveId(value);
    setSelectedDivisionId("");
  };

  const handleAdd = () => {
    setEditingTarget(null);
    resetForm();
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleEdit = (target: Target) => {
    setEditingTarget(target);
    setSelectedObjectiveId(target.objective?.toString() ?? "");
    setSelectedDivisionId(target.responsible_division?.toString() ?? "");
    setFormName(target.name ?? "");
    setFormCode(target.code || "");
    setFormDescription(target.description || "");
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleView = (target: Target) => {
    setViewingTarget(target);
    setIsViewModalOpen(true);
  };

  const handleDelete = (target: Target) => confirmDelete(target);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await targetService.deleteTarget(deleteDialog.item.id);
      toast.success("Target deleted successfully");
      closeDelete();
      fetchTargets(currentPage);
    } catch (error) {
      showError("Failed to delete target. Please try again.", "Delete Failed");
      closeDelete();
      console.error("Error deleting target:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingTarget(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObjectiveId || !selectedDivisionId || !formName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        objective: parseInt(selectedObjectiveId, 10),
        responsible_division: parseInt(selectedDivisionId, 10),
        name: formName.trim(),
        code: formCode.trim() || undefined,
        description: formDescription.trim() || undefined,
      };

      if (editingTarget) {
        await targetService.updateTarget(editingTarget.id, payload);
        toast.success("Target updated successfully");
      } else {
        await targetService.createTarget(payload);
        toast.success("Target created successfully");
      }

      fetchTargets(currentPage);
      handleCloseModal();
    } catch (error) {
      showError(
        editingTarget ? "Failed to update target. Please try again." : "Failed to create target. Please try again.",
        editingTarget ? "Update Failed" : "Create Failed"
      );
      console.error("Error submitting target:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Targets" description="Manage performance targets" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={targets}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search targets..."
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

      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold">
              {editingTarget ? "Edit Target" : "Add Target"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingTarget ? "Update target details" : "Create a new target"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="py-2 overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1.5">
                <label htmlFor="objective" className="text-sm font-medium leading-none">
                  Objective <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={selectedObjectiveId}
                  onChange={handleObjectiveChange}
                  onSearch={(query) => {
                    void objectiveService.getObjectives(query).then((response) => {
                      setObjectives(response.results ?? []);
                    });
                  }}
                  required
                  placeholder="Select Objective"
                  options={objectives.map((o) => ({ value: o.id.toString(), label: o.name }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="responsible_division" className="text-sm font-medium leading-none">
                  Responsible Division/Unit <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={selectedDivisionId}
                  onChange={setSelectedDivisionId}
                  required
                  placeholder={
                    divisionOptions.length === 0
                      ? "No divisions/units available"
                      : "Select Responsible Division/Unit"
                  }
                  options={divisionOptions.map((d) => ({
                    value: d.id.toString(),
                    label: divisionOptionLabel(d),
                  }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter target name"
                  required
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="code" className="text-sm font-medium leading-none">
                  Code
                </label>
                <input
                  id="code"
                  value={formCode}
                  onChange={(e) => setFormCode(e.target.value)}
                  placeholder="Enter code"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label htmlFor="description" className="text-sm font-medium leading-none">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button type="button" variant="outline" onClick={handleCloseModal} className="h-9">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="h-9 bg-black hover:bg-black/90 text-white">
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ViewTargetModal
        target={viewingTarget}
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
        entityType="Target"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
