"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewReportingDurationModal } from "@/components/modals/view-reporting-duration-modal";
import { getReportingDurationTanStackColumns } from "@/components/tables/columns/reporting-duration-tanstack-columns";
import { reportingDurationService, ReportingDuration } from "@/lib/api/reporting-duration.service";
import { ministryService, Ministry } from "@/lib/api/ministry.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";

export default function ReportingDurationsPage() {
  const [reportingDurations, setReportingDurations] = useState<ReportingDuration[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDuration, setEditingDuration] = useState<ReportingDuration | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<ReportingDuration>();
  const { confirm, closeConfirm, runConfirm, confirmDialog } = useConfirmDialog();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingDurationId, setViewingDurationId] = useState<number>(0);

  const columns = getReportingDurationTanStackColumns();

  useEffect(() => {
    fetchReportingDurations(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    fetchMinistries();
  }, []);

  const fetchMinistries = async () => {
    try {
      const response = await ministryService.getMinistries();
      setMinistries(response.results);
    } catch (error) {
      toast.error("Failed to load ministries");
    }
  };

  const fetchReportingDurations = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await reportingDurationService.getReportingDurationsPaginated(page, searchQuery);
      setReportingDurations(response.results);
      setTotalCount(response.count);
    } catch (error) {
      toast.error("Failed to load reporting durations");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = useMemo(() => [
    {
      name: "ministry",
      label: "Ministry",
      type: "select" as const,
      options: ministries.map(m => ({ value: m.id.toString(), label: m.name })),
      required: true,
    },
    {
      name: "start_date",
      label: "Start Date",
      type: "date" as const,
      required: true,
    },
    {
      name: "end_date",
      label: "End Date",
      type: "date" as const,
      required: true,
    },
    {
      name: "description",
      label: "Description",
      type: "textarea" as const,
      placeholder: "Enter description (optional)",
      required: false,
    },
  ], [ministries]);

  const handleActivate = (duration: ReportingDuration) => {
    confirm({
      title: "Activate Reporting Duration",
      description: "Are you sure you want to activate this reporting duration?",
      confirmLabel: "Activate",
      onConfirm: async () => {
        try {
          await reportingDurationService.activateReportingDuration(duration.id);
          toast.success("Reporting duration activated.");
          fetchReportingDurations(currentPage);
        } catch {
          toast.error("Failed to activate reporting duration");
          throw new Error("activate failed");
        }
      },
    });
  };

  const handleDeactivate = (duration: ReportingDuration) => {
    confirm({
      title: "Deactivate Reporting Duration",
      description: "Deactivate this reporting duration? All linked financial years and quarters will be deactivated.",
      confirmLabel: "Deactivate",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await reportingDurationService.closeReportingDuration(duration.id);
          toast.success("Reporting duration deactivated.");
          fetchReportingDurations(currentPage);
        } catch {
          toast.error("Failed to deactivate reporting duration");
          throw new Error("deactivate failed");
        }
      },
    });
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ministry: parseInt(data.ministry),
        start_date: data.start_date,
        end_date: data.end_date,
        description: data.description || "",
      };

      if (editingDuration) {
        await reportingDurationService.updateReportingDuration(editingDuration.id, payload);
        toast.success("Reporting duration updated.");
      } else {
        await reportingDurationService.createReportingDuration(payload);
        toast.success("Reporting duration created. Use Activate when ready.");
      }
      fetchReportingDurations(currentPage);
      setIsModalOpen(false);
    } catch {
      toast.error(editingDuration ? "Failed to update" : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingDuration) return undefined;
    return {
      ministry: ministries.find(m => m.name === editingDuration.ministry_name)?.id.toString() || "",
      start_date: editingDuration.start_date,
      end_date: editingDuration.end_date,
      description: editingDuration.description || "",
    };
  };

    const handleConfirmDelete = async () => {
    if (!deleteDialog.item) return;
    setDeleting(true);
    try {
      await reportingDurationService.deleteReportingDuration(deleteDialog.item.id);
      toast.success("Deleted.");
      closeDelete();
      fetchReportingDurations(currentPage);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete");
      closeDelete();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Reporting Durations" description="Configure 5-year planning periods" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={reportingDurations}
              searchKey="description"
              searchPlaceholder="Search descriptions..."
              onView={(d) => { setViewingDurationId(d.id); setIsViewModalOpen(true); }}
              onEdit={(d) => { setEditingDuration(d); setIsModalOpen(true); }}
              onActivate={handleActivate}
              onClose={handleDeactivate}
              onDelete={confirmDelete}
              onAdd={() => { setEditingDuration(null); setIsModalOpen(true); }}
              addButtonLabel="Add Reporting Duration"
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
        title={editingDuration ? "Edit Reporting Duration" : "Add Reporting Duration"}
        description="Status is managed via Activate/Deactivate actions."
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ViewReportingDurationModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} reportingDurationId={viewingDurationId} />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteDialog.isDeleting}
        entityType="Reporting Duration"
        entityName={deleteDialog.item?.description ?? ""}
      />
      <ConfirmDialog
        isOpen={confirmDialog.open}
        onClose={closeConfirm}
        onConfirm={runConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        variant={confirmDialog.variant}
        isLoading={confirmDialog.isLoading}
        icon={confirmDialog.icon}
      />
    </div>
  );
}
