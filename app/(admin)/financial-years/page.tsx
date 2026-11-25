"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewFinancialYearModal } from "@/components/modals/view-financial-year-modal";
import { getFinancialYearTanStackColumns } from "@/components/tables/columns/financial-year-tanstack-columns";
import { financialYearService, FinancialYear } from "@/lib/api/financial-year.service";
import { reportingDurationService, ReportingDuration } from "@/lib/api/reporting-duration.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";

export default function FinancialYearsPage() {
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [reportingDurations, setReportingDurations] = useState<ReportingDuration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<FinancialYear | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<FinancialYear>();
  const { confirm, closeConfirm, runConfirm, confirmDialog } = useConfirmDialog();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingYearId, setViewingYearId] = useState<number>(0);

  const columns = getFinancialYearTanStackColumns({ title: "Financial Years" });

  useEffect(() => {
    fetchFinancialYears(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    reportingDurationService.getReportingDurations().then(r => setReportingDurations(r.results)).catch(() => {});
  }, []);

  const fetchFinancialYears = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await financialYearService.getFinancialYearsPaginated(page, searchQuery);
      setFinancialYears(response.results);
      setTotalCount(response.count);
    } catch {
      toast.error("Failed to load financial years");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = useMemo(() => [
    {
      name: "reporting_duration",
      label: "Reporting Duration",
      type: "select" as const,
      options: reportingDurations.map(rd => ({
        value: rd.id.toString(),
        label: `${rd.start_year ?? rd.start_date?.slice(0, 4)} – ${rd.end_year ?? rd.end_date?.slice(0, 4)}`,
      })),
      required: true,
    },
    {
      name: "name",
      label: "Name",
      type: "text" as const,
      placeholder: "Auto-generated from dates if left blank",
      required: false,
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
  ], [reportingDurations]);

  const handleActivate = (year: FinancialYear) => {
    confirm({
      title: "Activate Financial Year",
      description: `Activate "${year.name}"?`,
      confirmLabel: "Activate",
      onConfirm: async () => {
        try {
          await financialYearService.activateFinancialYear(year.id);
          toast.success("Financial year activated.");
          fetchFinancialYears(currentPage);
        } catch {
          toast.error("Failed to activate financial year");
          throw new Error("activate failed");
        }
      },
    });
  };

  const handleClose = (year: FinancialYear) => {
    confirm({
      title: "Close Financial Year",
      description: `Close "${year.name}"? All its quarters will be deactivated.`,
      confirmLabel: "Close",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await financialYearService.closeFinancialYear(year.id);
          toast.success("Financial year closed.");
          fetchFinancialYears(currentPage);
        } catch {
          toast.error("Failed to close financial year");
          throw new Error("close failed");
        }
      },
    });
  };

  const handleSubmit = async (data: Record<string, any>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        reporting_duration: parseInt(data.reporting_duration),
        start_date: data.start_date,
        end_date: data.end_date,
        ...(data.name?.trim() ? { name: data.name.trim() } : {}),
      };

      if (editingYear) {
        await financialYearService.updateFinancialYear(editingYear.id, payload);
        toast.success("Financial year updated.");
      } else {
        await financialYearService.createFinancialYear(payload);
        toast.success("Financial year created. Add quarters under Quarters.");
      }
      fetchFinancialYears(currentPage);
      setIsModalOpen(false);
    } catch {
      toast.error(editingYear ? "Failed to update" : "Failed to create");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingYear) return undefined;
    return {
      reporting_duration: editingYear.reporting_duration?.toString() ?? "",
      name: editingYear.name,
      start_date: editingYear.start_date,
      end_date: editingYear.end_date,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading title="Financial Years" description="Manage financial years within reporting durations" />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={financialYears}
              searchKey="name"
              onAdd={() => { setEditingYear(null); setIsModalOpen(true); }}
              onEdit={(y) => { setEditingYear(y); setIsModalOpen(true); }}
              onView={(y) => { setViewingYearId(y.id); setIsViewModalOpen(true); }}
              onActivate={handleActivate}
              onClose={handleClose}
              onDelete={confirmDelete}
              addButtonLabel="Add Financial Year"
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
        title={editingYear ? "Edit Financial Year" : "Add Financial Year"}
        description="Create the financial year first, then add quarters manually under Quarters. Expired quarters close automatically."
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ViewFinancialYearModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} financialYearId={viewingYearId} />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={async () => {
          if (!deleteDialog.item) return;
          setDeleting(true);
          try {
            await financialYearService.deleteFinancialYear(deleteDialog.item.id);
            toast.success("Deleted.");
            closeDelete();
            fetchFinancialYears(currentPage);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete");
            closeDelete();
          } finally {
            setDeleting(false);
          }
        }}
        isDeleting={deleteDialog.isDeleting}
        entityType="Financial Year"
        entityName={deleteDialog.item?.name ?? ""}
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
