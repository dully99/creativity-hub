"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { getActivityTanStackColumns, Activity } from "@/components/tables/columns/activities-tanstack-columns";
import { activityService } from "@/lib/api/activity.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { targetService, Target } from "@/lib/api/target.service";
import { financialYearService, FinancialYear } from "@/lib/api/financial-year.service";
import { sectionService, Section } from "@/lib/api/section.service";
import { ViewActivityModal } from "@/components/modals/view-activity-modal";
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

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [targets, setTargets] = useState<Target[]>([]);
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewingActivity, setViewingActivity] = useState<Activity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Activity>();

  const [selectedTargetId, setSelectedTargetId] = useState("");
  const [selectedFinancialYearId, setSelectedFinancialYearId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [formName, setFormName] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");

  const columns = getActivityTanStackColumns();

  const selectedTarget = useMemo(
    () => targets.find((t) => t.id.toString() === selectedTargetId) ?? null,
    [targets, selectedTargetId]
  );

  const showSectionField = sections.length > 0;

  useEffect(() => {
    fetchActivities(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [targetRes, fyRes] = await Promise.all([
        targetService.getTargets(),
        financialYearService.getFinancialYears(),
      ]);
      setTargets(targetRes.results ?? []);
      setFinancialYears(fyRes.results ?? []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchSectionsForTarget = async (target: Target | null) => {
    const divisionId = target?.responsible_division;
    if (!divisionId) {
      setSections([]);
      return;
    }

    setLoadingSections(true);
    try {
      const response = await sectionService.getSections({
        division: divisionId,
        page_size: 100,
        is_active: true,
      });
      setSections(response.results ?? []);
    } catch (error) {
      console.error("Error fetching sections:", error);
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const fetchActivities = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await activityService.getActivitiesPaginated(page, searchQuery);
      setActivities(response.results);
      setTotalCount(response.count);
    } catch (error) {
      showError("Failed to load activities. Please try again.", "Load Failed");
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedTargetId("");
    setSelectedFinancialYearId("");
    setSelectedSectionId("");
    setFormName("");
    setFormCode("");
    setFormDescription("");
    setSections([]);
  };

  const handleTargetChange = async (value: string) => {
    setSelectedTargetId(value);
    setSelectedSectionId("");
    const target = targets.find((t) => t.id.toString() === value) ?? null;
    await fetchSectionsForTarget(target);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    resetForm();
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleEdit = async (activity: Activity) => {
    setEditingActivity(activity);
    setSelectedTargetId(activity.target?.toString() ?? "");
    setSelectedFinancialYearId(activity.financial_year?.toString() ?? "");
    setSelectedSectionId(activity.section?.toString() ?? "");
    setFormName(activity.name ?? "");
    setFormCode(activity.code || "");
    setFormDescription(activity.description || "");
    setIsModalOpen(true);
    await fetchDropdownData();
    const target =
      targets.find((t) => t.id === activity.target) ||
      (await targetService.getTargets()).results.find((t) => t.id === activity.target) ||
      null;
    if (target) {
      setTargets((prev) => (prev.some((t) => t.id === target.id) ? prev : [...prev, target]));
      await fetchSectionsForTarget(target);
    }
  };

  const handleView = (activity: Activity) => {
    setViewingActivity(activity);
    setIsViewModalOpen(true);
  };
  const handleDelete = (activity: Activity) => confirmDelete(activity);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await activityService.deleteActivity(deleteDialog.item.id);
      toast.success("Activity deleted successfully");
      closeDelete();
      fetchActivities(currentPage);
    } catch (error) {
      showError("Failed to delete activity. Please try again.", "Delete Failed");
      closeDelete();
      console.error("Error deleting activity:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingActivity(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTargetId || !selectedFinancialYearId || !formName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (showSectionField && !selectedSectionId) {
      toast.error("Please select a section for this target's division");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        target: parseInt(selectedTargetId, 10),
        financial_year: parseInt(selectedFinancialYearId, 10),
        section: selectedSectionId ? parseInt(selectedSectionId, 10) : null,
        name: formName.trim(),
        code: formCode.trim() || undefined,
        description: formDescription.trim() || undefined,
      };

      if (editingActivity) {
        await activityService.updateActivity(editingActivity.id, payload);
        toast.success("Activity updated successfully");
      } else {
        await activityService.createActivity(payload);
        toast.success("Activity created successfully");
      }

      fetchActivities(currentPage);
      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : editingActivity
            ? "Failed to update activity. Please try again."
            : "Failed to create activity. Please try again.";
      showError(message, editingActivity ? "Update Failed" : "Create Failed");
      console.error("Error submitting activity:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Activities" description="Manage activities and initiatives" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={activities}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search activities..."
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
              {editingActivity ? "Edit Activity" : "Add Activity"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingActivity ? "Update activity details" : "Create a new activity"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="py-2 overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1.5">
                <label htmlFor="target" className="text-sm font-medium leading-none">
                  Target <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={selectedTargetId}
                  onChange={(value) => void handleTargetChange(value)}
                  onSearch={(query) => {
                    void targetService.getTargets(query).then((response) => {
                      setTargets(response.results ?? []);
                    });
                  }}
                  required
                  placeholder="Select Target"
                  options={targets.map((t) => ({ value: t.id.toString(), label: t.name }))}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="financial_year" className="text-sm font-medium leading-none">
                  Financial Year <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={selectedFinancialYearId}
                  onChange={setSelectedFinancialYearId}
                  required
                  placeholder="Select Financial Year"
                  options={financialYears.map((fy) => ({ value: fy.id.toString(), label: fy.name }))}
                />
              </div>

              {showSectionField ? (
                <div className="space-y-1.5 col-span-2">
                  <label htmlFor="section" className="text-sm font-medium leading-none">
                    Section <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="section"
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    required
                    disabled={loadingSections}
                    className="flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat"
                  >
                    <option value="">
                      {loadingSections
                        ? "Loading sections..."
                        : selectedTarget
                          ? `Select section under ${selectedTarget.division_name || selectedTarget.responsible_division_name || "division"}`
                          : "Select Section"}
                    </option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id.toString()}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Required because this target&apos;s responsible division has sections.
                  </p>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="name" className="text-sm font-medium leading-none">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Enter activity name"
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

      <ViewActivityModal
        activity={viewingActivity}
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
        entityType="Activity"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
