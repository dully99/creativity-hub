"use client";

import { useEffect, useMemo, useState } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { getReportingFrequencyTanStackColumns } from "@/components/tables/columns/reporting-frequency-tanstack-columns";
import {
  reportingFrequencyService,
  ReportingFrequencyConfig,
} from "@/lib/api/reporting-frequency.service";
import { divisionService, Division } from "@/lib/api/division.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
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

const WEEKDAY_OPTIONS = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const selectClassName =
  "flex h-9 w-full appearance-none rounded-md border border-input bg-background px-3 py-1 pr-8 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22currentColor%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[length:16px_16px] bg-[right_8px_center] bg-no-repeat";

export default function ReportingFrequencyPage() {
  const [configs, setConfigs] = useState<ReportingFrequencyConfig[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReportingFrequencyConfig | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } =
    useDeleteDialog<ReportingFrequencyConfig>();

  const [divisions, setDivisions] = useState<Division[]>([]);
  const [name, setName] = useState("");
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [selectedDivisionIds, setSelectedDivisionIds] = useState<number[]>([]);
  const [frequency, setFrequency] = useState("weekly");
  const [openDay, setOpenDay] = useState("0");
  const [closeDay, setCloseDay] = useState("4");
  const [isActive, setIsActive] = useState(true);

  const columns = getReportingFrequencyTanStackColumns();
  const isWeekly = frequency === "weekly";

  const divisionUnitOptions = useMemo(
    () =>
      divisions.filter(
        (d) => d.division_type === "department" || d.division_type === "unit"
      ),
    [divisions]
  );

  useEffect(() => {
    fetchConfigs(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    void fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const list = await divisionService.getDivisions();
      setDivisions(list);
    } catch (error) {
      console.error("Error fetching divisions:", error);
    }
  };

  const fetchConfigs = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await reportingFrequencyService.getConfigsPaginated(page, searchQuery);
      const results =
        response?.results ??
        (Array.isArray(response) ? response : []) ??
        [];
      const count =
        typeof response?.count === "number"
          ? response.count
          : Array.isArray(results)
            ? results.length
            : 0;
      setConfigs(Array.isArray(results) ? results : []);
      setTotalCount(count);
    } catch (error) {
      toast.error("Failed to load reporting frequency configs");
      console.error("Error fetching configs:", error);
      setConfigs([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setScope("all");
    setSelectedDivisionIds([]);
    setFrequency("weekly");
    setOpenDay("0");
    setCloseDay("4");
    setIsActive(true);
  };

  const handleAdd = () => {
    setEditing(null);
    resetForm();
    void fetchDivisions();
    setIsModalOpen(true);
  };

  const handleEdit = async (item: ReportingFrequencyConfig) => {
    setIsModalOpen(true);
    try {
      await fetchDivisions();
      const full = await reportingFrequencyService.getConfig(item.id);
      setEditing(full);
      setName(full.name || "");
      setScope(full.applies_to_all ? "all" : "selected");
      setSelectedDivisionIds(full.division_ids || []);
      setFrequency(full.reporting_frequency || "weekly");
      setOpenDay(
        full.weekly_reporting_open_day != null
          ? String(full.weekly_reporting_open_day)
          : "0"
      );
      setCloseDay(
        full.weekly_reporting_close_day != null
          ? String(full.weekly_reporting_close_day)
          : "4"
      );
      setIsActive(full.is_active);
    } catch (error) {
      console.error("Error loading config:", error);
      toast.error("Failed to load config details");
      setIsModalOpen(false);
    }
  };

  const handleDelete = (item: ReportingFrequencyConfig) => confirmDelete(item);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await reportingFrequencyService.deleteConfig(deleteDialog.item.id);
      toast.success("Reporting frequency config deleted");
      closeDelete();
      fetchConfigs(currentPage);
    } catch (error) {
      toast.error("Failed to delete config");
      closeDelete();
      console.error("Error deleting config:", error);
    } finally {
      setDeleting(false);
    }
  };

  const toggleDivision = (id: number) => {
    setSelectedDivisionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditing(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frequency) {
      toast.error("Select a reporting frequency");
      return;
    }
    if (scope === "selected" && selectedDivisionIds.length === 0) {
      toast.error("Select at least one division or unit");
      return;
    }
    if (isWeekly && (!openDay || !closeDay)) {
      toast.error("Select weekly open and close days");
      return;
    }
    if (isWeekly && openDay === closeDay) {
      toast.error("Close day must be different from open day");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: name.trim() || null,
        applies_to_all: scope === "all",
        division_ids: scope === "all" ? [] : selectedDivisionIds,
        reporting_frequency: frequency,
        weekly_reporting_open_day: isWeekly ? parseInt(openDay, 10) : null,
        weekly_reporting_close_day: isWeekly ? parseInt(closeDay, 10) : null,
        is_active: isActive,
      };

      if (editing) {
        await reportingFrequencyService.updateConfig(editing.id, payload);
        toast.success("Reporting frequency updated");
      } else {
        await reportingFrequencyService.createConfig(payload);
        toast.success("Reporting frequency created");
      }

      fetchConfigs(currentPage);
      handleCloseModal();
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : editing
            ? "Failed to update reporting frequency"
            : "Failed to create reporting frequency";
      toast.error(message);
      console.error("Error submitting config:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Reporting Frequency"
        description="Set reporting frequency and weekly open/close days for divisions and units"
      />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={configs}
              onAdd={handleAdd}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Search reporting frequency..."
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
        <DialogContent className="sm:max-w-[640px] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold">
              {editing ? "Edit Reporting Frequency" : "Add Reporting Frequency"}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Sections inherit settings from their parent division or unit.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="py-2 overflow-y-auto flex-1 pr-1 grid grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1.5 col-span-2">
                <label htmlFor="rf_name" className="text-sm font-medium leading-none">
                  Name
                </label>
                <input
                  id="rf_name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional label"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>

              <div className="space-y-2 col-span-2">
                <span className="text-sm font-medium leading-none">Scope</span>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === "all"}
                      onChange={() => setScope("all")}
                    />
                    All divisions &amp; units
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="scope"
                      checked={scope === "selected"}
                      onChange={() => setScope("selected")}
                    />
                    Selected divisions &amp; units
                  </label>
                </div>
              </div>

              {scope === "selected" ? (
                <div className="space-y-1.5 col-span-2">
                  <label className="text-sm font-medium leading-none">
                    Divisions / Units <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-input rounded-md max-h-40 overflow-y-auto p-2 space-y-1">
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
                            checked={selectedDivisionIds.includes(d.id)}
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
                </div>
              ) : null}

              <div className="space-y-1.5">
                <label htmlFor="rf_frequency" className="text-sm font-medium leading-none">
                  Frequency <span className="text-red-500">*</span>
                </label>
                <select
                  id="rf_frequency"
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  required
                  className={selectClassName}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="rf_active" className="text-sm font-medium leading-none">
                  Active
                </label>
                <select
                  id="rf_active"
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className={selectClassName}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>

              {isWeekly ? (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="rf_open" className="text-sm font-medium leading-none">
                      Weekly open day <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="rf_open"
                      value={openDay}
                      onChange={(e) => setOpenDay(e.target.value)}
                      required
                      className={selectClassName}
                    >
                      {WEEKDAY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="rf_close" className="text-sm font-medium leading-none">
                      Weekly close day <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="rf_close"
                      value={closeDay}
                      onChange={(e) => setCloseDay(e.target.value)}
                      required
                      className={selectClassName}
                    >
                      {WEEKDAY_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : null}
            </div>

            <DialogFooter className="pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseModal}
                className="h-9"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 bg-black hover:bg-black/90 text-white"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Reporting Frequency"
        entityName={deleteDialog.item?.name || deleteDialog.item?.scope_label || ""}
      />
    </div>
  );
}
