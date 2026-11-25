"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { getTaskTanStackColumns, Task } from "@/components/tables/columns/tasks-tanstack-columns";
import { taskService } from "@/lib/api/task.service";
import { activityService, Activity } from "@/lib/api/activity.service";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { quarterService, Quarter } from "@/lib/api/quarter.service";
import { ViewTaskModal } from "@/components/modals/view-task-modal";
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
import { NumberInput } from "@/components/ui/number-input";

function quarterIdsFromTask(task: Task | null): number[] {
  if (!task?.implementation_quarters?.length) return [];
  return task.implementation_quarters.map((q) =>
    typeof q === "number" ? q : (q as { id: number }).id
  );
}

function quarterLabel(q: Quarter): string {
  const fy = q.financial_year_name ? ` · ${q.financial_year_name}` : "";
  return `${q.name}${fy}`;
}

const selectClassName =
  "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat";


export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { errorDialog, showError, closeError } = useErrorDialog();
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Task>();

  const [selectedActivityId, setSelectedActivityId] = useState("");
  const [selectedQuarterIds, setSelectedQuarterIds] = useState<number[]>([]);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [dataType, setDataType] = useState("");
  const [targetValue, setTargetValue] = useState("");

  const columns = getTaskTanStackColumns();
  const isNumberType = dataType === "number";

  const selectedActivity = useMemo(
    () => activities.find((a) => a.id.toString() === selectedActivityId) ?? null,
    [activities, selectedActivityId]
  );

  const availableQuarters = useMemo(() => {
    if (!selectedActivity) return [];
    const fyId = selectedActivity.financial_year;
    if (!fyId) return [];
    return quarters.filter((q) => q.financial_year === fyId);
  }, [quarters, selectedActivity]);

  useEffect(() => {
    fetchTasks(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const fetchDropdownData = async () => {
    try {
      const [activityRes, quarterRes] = await Promise.all([
        activityService.getActivities(),
        quarterService.getQuarters(),
      ]);
      setActivities(activityRes.results ?? []);
      setQuarters(quarterRes.results ?? []);
    } catch (error) {
      console.error("Error fetching dropdown data:", error);
    }
  };

  const fetchTasks = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await taskService.getTasksPaginated(page, searchQuery);
      setTasks(response.results);
      setTotalCount(response.count);
    } catch (error) {
      showError("Failed to load tasks. Please try again.", "Load Failed");
      console.error("Error fetching tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedActivityId("");
    setSelectedQuarterIds([]);
    setFormName("");
    setFormDescription("");
    setDataType("");
    setTargetValue("");
  };

  const handleActivityChange = (value: string) => {
    setSelectedActivityId(value);
    setSelectedQuarterIds([]);
  };

  const handleDataTypeChange = (value: string) => {
    setDataType(value);
    if (value !== "number") {
      setTargetValue("");
    }
  };

  const toggleQuarter = (id: number) => {
    setSelectedQuarterIds((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );
  };

  const handleAdd = () => {
    setEditingTask(null);
    resetForm();
    void fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleEdit = async (task: Task) => {
    setIsModalOpen(true);
    try {
      await fetchDropdownData();
      const full = await taskService.getTask(task.id);
      setEditingTask(full);
      setSelectedActivityId(full.activity?.toString() ?? "");
      setSelectedQuarterIds(quarterIdsFromTask(full));
      setFormName(full.name ?? "");
      setFormDescription(full.description || "");
      setDataType(full.data_type || "");
      setTargetValue(
        full.target_value != null && full.data_type === "number" ? String(full.target_value) : ""
      );
    } catch (error) {
      console.error("Error loading task:", error);
      showError("Failed to load task details.", "Load Failed");
      setIsModalOpen(false);
    }
  };

  const handleView = (task: Task) => {
    setViewingTask(task);
    setIsViewModalOpen(true);
  };
  const handleDelete = (task: Task) => confirmDelete(task);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteDialog.item.id);
      toast.success("Task deleted successfully");
      closeDelete();
      fetchTasks(currentPage);
    } catch (error) {
      showError("Failed to delete task. Please try again.", "Delete Failed");
      closeDelete();
      console.error("Error deleting task:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setEditingTask(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedActivityId || !formName.trim() || !dataType) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (isNumberType) {
      const parsedTarget = parseInt(targetValue, 10);
      if (!targetValue || Number.isNaN(parsedTarget) || parsedTarget < 1) {
        toast.error("Enter a targeted number of at least 1");
        return;
      }
    }
    if (selectedQuarterIds.length === 0) {
      toast.error("Select at least one implementation quarter");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        activity: parseInt(selectedActivityId, 10),
        name: formName.trim(),
        description: formDescription.trim() || undefined,
        data_type: dataType,
        target_value: isNumberType ? parseInt(targetValue, 10) : null,
        implementation_quarters: selectedQuarterIds,
      };

      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
        toast.success("Task updated successfully");
      } else {
        await taskService.createTask(payload);
        toast.success("Task created successfully");
      }

      fetchTasks(currentPage);
      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : editingTask
            ? "Failed to update task. Please try again."
            : "Failed to create task. Please try again.";
      showError(message, editingTask ? "Update Failed" : "Create Failed");
      console.error("Error submitting task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Tasks" description="Manage tasks and assignments" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={tasks}
              onAdd={handleAdd}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search tasks..."
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
              {editingTask ? "Edit Task" : "Add Task"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              {editingTask ? "Update task details" : "Create a new task"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="py-2 overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1.5">
                <label htmlFor="activity" className="text-sm font-medium leading-none">
                  Activity <span className="text-red-500">*</span>
                </label>
                <SearchableSelect
                  value={selectedActivityId}
                  onChange={handleActivityChange}
                  onSearch={(query) => {
                    void activityService.getActivities(query).then((response) => {
                      setActivities(response.results ?? []);
                    });
                  }}
                  required
                  placeholder="Select Activity"
                  options={activities.map((a) => ({ value: a.id.toString(), label: a.name }))}
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
                  placeholder="Enter task name"
                  required
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

              <div className="space-y-1.5">
                <label htmlFor="data_type" className="text-sm font-medium leading-none">
                  Data Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="data_type"
                  value={dataType}
                  onChange={(e) => handleDataTypeChange(e.target.value)}
                  required
                  className={selectClassName}
                >
                  <option value="">Select Data Type</option>
                  <option value="number">Number</option>
                  <option value="percentage">Percentage</option>
                </select>
              </div>

              {isNumberType ? (
                <div className="space-y-1.5">
                  <label htmlFor="target_value" className="text-sm font-medium leading-none">
                    Targeted number <span className="text-red-500">*</span>
                  </label>
                  <NumberInput
                    id="target_value"
                    min={1}
                    step={1}
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    required
                    placeholder="e.g. 50"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium leading-none">
                  Implementation Quarters <span className="text-red-500">*</span>
                </label>
                <div className="border border-input rounded-md max-h-36 overflow-y-auto p-2 space-y-1">
                  {!selectedActivityId ? (
                    <p className="text-sm text-muted-foreground px-1">Select an activity first</p>
                  ) : availableQuarters.length === 0 ? (
                    <p className="text-sm text-muted-foreground px-1">
                      No quarters available for this activity&apos;s financial year
                    </p>
                  ) : (
                    availableQuarters.map((q) => (
                      <label
                        key={q.id}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selectedQuarterIds.includes(q.id)}
                          onChange={() => toggleQuarter(q.id)}
                          className="rounded"
                        />
                        <span>{quarterLabel(q)}</span>
                        {q.is_current ? (
                          <span className="text-xs text-muted-foreground">(Current)</span>
                        ) : null}
                        {!q.is_active ? (
                          <span className="text-xs text-muted-foreground">(Inactive)</span>
                        ) : null}
                      </label>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select one or more quarters where this task will be implemented
                </p>
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

      <ViewTaskModal
        task={viewingTask}
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
        entityType="Task"
        entityName={deleteDialog.item?.name ?? ""}
      />
    </div>
  );
}
