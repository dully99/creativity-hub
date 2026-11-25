"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";

import {
  getObjectiveTanStackColumns,
  Objective,
} from "@/components/tables/columns/objectives-tanstack-columns";
import { objectiveService } from "@/lib/api/objective.service";
import { projectService, Project } from "@/lib/api/project.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  reportingDurationService,
  ReportingDuration,
} from "@/lib/api/reporting-duration.service";
import {
  planBudgetTypeService,
  PlanBudgetType,
  planBudgetTypeLabel,
} from "@/lib/api/plan-budget-type.service";
import { divisionService, Division } from "@/lib/api/division.service";
import { toast } from "sonner";
import { ErrorDialog } from "@/components/modals/error-dialog";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { useErrorDialog } from "@/hooks/use-error-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ViewObjectiveModal } from "@/components/modals/view-objective-modal";

export default function ObjectivesPage() {
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } =
    useDeleteDialog<Objective>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [reportingDurations, setReportingDurations] = useState<
    ReportingDuration[]
  >([]);
  const [planBudgetTypes, setPlanBudgetTypes] = useState<PlanBudgetType[]>([]);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObjective, setEditingObjective] = useState<Objective | null>(
    null,
  );
  const [viewingObjective, setViewingObjective] = useState<Objective | null>(
    null,
  );
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEdit, setIsLoadingEdit] = useState(false);
  const [selectedPlanBudgetType, setSelectedPlanBudgetType] =
    useState<string>("");
  const [selectedDivisions, setSelectedDivisions] = useState<number[]>([]);
  const [formKey, setFormKey] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const columns = getObjectiveTanStackColumns();

  const divisionUnitOptions = useMemo(
    () =>
      divisions.filter(
        (d) => d.division_type === "department" || d.division_type === "unit",
      ),
    [divisions],
  );

  useEffect(() => {
    fetchObjectives(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    const [projResult, rdResult, pbtResult] = await Promise.allSettled([
      projectService.getProjects(),
      reportingDurationService.getReportingDurations(),
      planBudgetTypeService.listPlanBudgetTypes(),
    ]);

    if (projResult.status === "fulfilled") {
      setProjects(projResult.value.results ?? []);
    } else {
      console.error("Error fetching projects:", projResult.reason);
    }

    if (rdResult.status === "fulfilled") {
      setReportingDurations(rdResult.value.results ?? []);
    } else {
      console.error("Error fetching reporting durations:", rdResult.reason);
    }

    if (pbtResult.status === "fulfilled") {
      setPlanBudgetTypes(pbtResult.value);
    } else {
      console.error("Error fetching plan budget types:", pbtResult.reason);
      toast.error("Failed to load plan budget types");
    }

    try {
      const divRes = await divisionService.getDivisions();
      setDivisions(divRes);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchObjectives = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await objectiveService.getObjectivesPaginated(page, searchQuery);
      setObjectives(response.results);
      setTotalCount(response.count);
    } catch (error) {
      showError("Failed to load objectives. Please try again.", "Load Failed");
      console.error("Error fetching objectives:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedBudgetTypeObj = useMemo(
    () =>
      planBudgetTypes.find((p) => p.id.toString() === selectedPlanBudgetType),
    [planBudgetTypes, selectedPlanBudgetType],
  );

  const isDevelopment = useMemo(
    () => selectedBudgetTypeObj?.type?.toLowerCase() === "development",
    [selectedBudgetTypeObj],
  );

  const handleAdd = () => {
    setEditingObjective(null);
    setSelectedPlanBudgetType("");
    setSelectedDivisions([]);
    setFormKey((k) => k + 1);
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleEdit = async (objective: Objective) => {
    setIsModalOpen(true);
    setIsLoadingEdit(true);
    try {
      await fetchDropdownData();
      const full = await objectiveService.getObjective(objective.id);
      setEditingObjective(full);
      setSelectedPlanBudgetType(full.plan_budget_type?.toString() ?? "");
      setSelectedDivisions(full.responsible_divisions?.map((d) => d.id) ?? []);
      setFormKey((k) => k + 1);
    } catch (error) {
      console.error("Error loading objective:", error);
      showError("Failed to load objective details.", "Load Failed");
      setIsModalOpen(false);
    } finally {
      setIsLoadingEdit(false);
    }
  };

  const handleView = (objective: Objective) => {
    setViewingObjective(objective);
    setIsViewModalOpen(true);
  };

  const handleDelete = (objective: Objective) => confirmDelete(objective);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await objectiveService.deleteObjective(deleteDialog.item.id);
      toast.success("Objective deleted successfully");
      closeDelete();
      fetchObjectives(currentPage);
    } catch (error) {
      showError(
        "Failed to delete objective. Please try again.",
        "Delete Failed",
      );
      closeDelete();
      console.error("Error deleting objective:", error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleDivision = (id: number) => {
    setSelectedDivisions((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id],
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIsSubmitting(true);
    try {
      const payload: any = {
        plan_budget_type: parseInt(formData.get("plan_budget_type") as string),
        reporting_duration: parseInt(
          formData.get("reporting_duration") as string,
        ),
        responsible_divisions: selectedDivisions,
        name: formData.get("name") as string,
        description: (formData.get("description") as string) || undefined,
        display_order: formData.get("display_order")
          ? parseInt(formData.get("display_order") as string)
          : undefined,
        is_active: formData.get("is_active") === "true",
      };

      if (isDevelopment) {
        const projectVal = formData.get("project") as string;
        if (projectVal) payload.project = parseInt(projectVal);
      }

      if (editingObjective) {
        await objectiveService.updateObjective(editingObjective.id, payload);
        toast.success("Objective updated successfully");
      } else {
        await objectiveService.createObjective(payload);
        toast.success("Objective created successfully");
      }

      fetchObjectives(currentPage);
      setIsModalOpen(false);
    } catch (error) {
      showError(
        editingObjective
          ? "Failed to update objective. Please try again."
          : "Failed to create objective. Please try again.",
        editingObjective ? "Update Failed" : "Create Failed",
      );
      console.error("Error submitting objective:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";
  const selectClass = `${inputClass} appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat pr-8`;

  return (
    <div className="space-y-6">
      <PageHeading
        title="Objectives"
        description="Manage strategic objectives"
      />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={objectives}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search objectives..."
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

      <Dialog open={isModalOpen} onOpenChange={() => setIsModalOpen(false)}>
        <DialogContent className="sm:max-w-[680px] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold">
              {editingObjective ? "Edit Objective" : "Add Objective"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingObjective
                ? "Update objective details"
                : "Create a new objective"}
            </DialogDescription>
          </DialogHeader>
          <form
            key={formKey}
            ref={formRef}
            onSubmit={handleSubmit}
            className="flex flex-col flex-1 min-h-0"
          >
            {isLoadingEdit ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 py-2 overflow-y-auto flex-1 pr-1">
                {/* Plan Budget Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Plan Budget Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="plan_budget_type"
                    required
                    className={selectClass}
                    defaultValue={
                      editingObjective?.plan_budget_type?.toString() ?? ""
                    }
                    onChange={(e) => setSelectedPlanBudgetType(e.target.value)}
                  >
                    <option value="">Select Plan Budget Type</option>
                    {planBudgetTypes.map((p) => (
                      <option key={p.id} value={p.id.toString()}>
                        {planBudgetTypeLabel(p)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Project — only shown for Development */}
                {isDevelopment ? (
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">
                      Project
                    </label>
                    <SearchableSelect
                      name="project"
                      defaultValue={editingObjective?.project?.toString() ?? ""}
                      placeholder="Select Project"
                      onSearch={(query) => {
                        void projectService.getProjects(query).then((response) => {
                          setProjects(response.results ?? []);
                        });
                      }}
                      options={projects.map((p) => ({ value: p.id.toString(), label: p.name }))}
                    />
                  </div>
                ) : (
                  <div />
                )}

                {/* Reporting Period */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Reporting Period <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="reporting_duration"
                    required
                    className={selectClass}
                    defaultValue={
                      editingObjective?.reporting_duration?.toString() ?? ""
                    }
                  >
                    <option value="">Select Reporting Period</option>
                    {reportingDurations.map((rd) => (
                      <option key={rd.id} value={rd.id.toString()}>
                        {rd.start_year} - {rd.end_year} ({rd.ministry_name})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Enter objective name"
                    defaultValue={editingObjective?.name ?? ""}
                    className={inputClass}
                  />
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Display Order
                  </label>
                  <input
                    name="display_order"
                    type="text"
                    placeholder="Enter display order"
                    defaultValue={
                      editingObjective?.display_order?.toString() ?? ""
                    }
                    className={inputClass}
                  />
                </div>

                {/* Is Active */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium leading-none">
                    Is Active <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="is_active"
                    required
                    className={selectClass}
                    defaultValue={
                      editingObjective
                        ? editingObjective.is_active
                          ? "true"
                          : "false"
                        : "true"
                    }
                  >
                    <option value="">Select</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>

                {/* Description — full width */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium leading-none">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    placeholder="Enter description"
                    defaultValue={editingObjective?.description ?? ""}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                  />
                </div>

                {/* Responsible Divisions/Units — full width multi-select */}
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium leading-none">
                    Responsible Divisions/Units
                  </label>
                  <div className="border border-input rounded-md max-h-36 overflow-y-auto p-2 space-y-1">
                    {divisionUnitOptions.length === 0 ? (
                      <p className="text-sm text-muted-foreground px-1">
                        No divisions/units available
                      </p>
                    ) : (
                      divisionUnitOptions.map((d) => (
                        <label
                          key={d.id}
                          className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selectedDivisions.includes(d.id)}
                            onChange={() => toggleDivision(d.id)}
                            className="rounded"
                          />
                          {d.name}
                          <span className="text-muted-foreground">
                            ({d.division_type === "unit" ? "Unit" : "Division"})
                          </span>
                        </label>
                      ))
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select one or more divisions or units
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isLoadingEdit}
                className="h-9 bg-black hover:bg-black/90 text-white"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ViewObjectiveModal
        objective={viewingObjective}
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
        entityType="Objective"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
