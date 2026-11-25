"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeading from "@/components/headers/page-heading";
import { Card, CardContent } from "@/components/ui/card";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { FormModal, FormField } from "@/components/modals/form-modal";
import { ViewQuarterModal } from "@/components/modals/view-quarter-modal";
import { getQuarterTanStackColumns } from "@/components/tables/columns/quarter-tanstack-columns";
import { quarterService, Quarter } from "@/lib/api/quarter.service";
import { financialYearService, FinancialYear } from "@/lib/api/financial-year.service";
import { DeleteDialog } from "@/components/modals/delete-dialog";
import { ConfirmDialog } from "@/components/modals/confirm-dialog";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import { useConfirmDialog } from "@/hooks/use-confirm-dialog";
import { toast } from "sonner";

/** Tanzania FY quarters: Q1 Jul–Sep, Q2 Oct–Dec, Q3 Jan–Mar, Q4 Apr–Jun */
const QUARTER_OPTIONS = [
  { value: "Q1", label: "Q1: 1 July – 30 Sept" },
  { value: "Q2", label: "Q2: 1 Oct – 31 Dec" },
  { value: "Q3", label: "Q3: 1 Jan – 31 March" },
  { value: "Q4", label: "Q4: 1 April – 30 June" },
] as const;

function julyYearFromFyStart(startDate: string): number {
  const d = new Date(`${startDate}T00:00:00`);
  const year = d.getFullYear();
  return d.getMonth() >= 6 ? year : year - 1;
}

function datesForQuarter(fyStartDate: string, name: string): { start_date: string; end_date: string } {
  const y = julyYearFromFyStart(fyStartDate);
  switch (name) {
    case "Q1":
      return { start_date: `${y}-07-01`, end_date: `${y}-09-30` };
    case "Q2":
      return { start_date: `${y}-10-01`, end_date: `${y}-12-31` };
    case "Q3":
      return { start_date: `${y + 1}-01-01`, end_date: `${y + 1}-03-31` };
    case "Q4":
      return { start_date: `${y + 1}-04-01`, end_date: `${y + 1}-06-30` };
    default:
      throw new Error(`Unknown quarter: ${name}`);
  }
}

export default function QuartersPage() {
  const [quarters, setQuarters] = useState<Quarter[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [financialYears, setFinancialYears] = useState<FinancialYear[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuarter, setEditingQuarter] = useState<Quarter | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingQuarterId, setViewingQuarterId] = useState<number>(0);
  const { deleteDialog, confirmDelete, closeDelete, setDeleting } = useDeleteDialog<Quarter>();
  const { confirm, closeConfirm, runConfirm, confirmDialog } = useConfirmDialog();

  const columns = getQuarterTanStackColumns();

  useEffect(() => {
    fetchQuarters(currentPage);
  }, [currentPage, searchQuery]);

  useEffect(() => {
    financialYearService.getFinancialYears().then((r) => setFinancialYears(r.results)).catch(() => {});
  }, []);

  const fetchQuarters = async (page = 1) => {
    try {
      setIsLoading(true);
      const response = await quarterService.getQuartersPaginated(page, searchQuery);
      setQuarters(response.results);
      setTotalCount(response.count);
    } catch {
      toast.error("Failed to load quarters");
    } finally {
      setIsLoading(false);
    }
  };

  const formFields: FormField[] = useMemo(
    () => [
      {
        name: "financial_year",
        label: "Financial Year",
        type: "select" as const,
        options: financialYears.map((fy) => ({
          value: fy.id.toString(),
          label: fy.name,
        })),
        required: true,
      },
      {
        name: "name",
        label: "Quarter",
        type: "select" as const,
        options: QUARTER_OPTIONS.map((q) => ({ value: q.value, label: q.label })),
        required: true,
      },
    ],
    [financialYears]
  );

  const handleActivate = (quarter: Quarter) => {
    confirm({
      title: "Activate Quarter",
      description: `Activate ${quarter.name}? It will be marked as the current active quarter.`,
      confirmLabel: "Activate",
      onConfirm: async () => {
        try {
          await quarterService.activateQuarter(quarter.id);
          toast.success("Quarter activated.");
          fetchQuarters(currentPage);
        } catch {
          toast.error("Failed to activate quarter");
          throw new Error("activate failed");
        }
      },
    });
  };

  const handleClose = (quarter: Quarter) => {
    confirm({
      title: "Close Quarter",
      description: `Close ${quarter.name}? It will be deactivated.`,
      confirmLabel: "Close",
      variant: "destructive",
      onConfirm: async () => {
        try {
          await quarterService.closeQuarter(quarter.id);
          toast.success("Quarter closed.");
          fetchQuarters(currentPage);
        } catch {
          toast.error("Failed to close quarter");
          throw new Error("close failed");
        }
      },
    });
  };

  const handleSubmit = async (data: Record<string, unknown>) => {
    setIsSubmitting(true);
    try {
      const fyId = parseInt(String(data.financial_year), 10);
      const name = String(data.name);
      const fy = financialYears.find((f) => f.id === fyId);
      if (!fy?.start_date) {
        toast.error("Selected financial year has no start date");
        return;
      }

      const { start_date, end_date } = datesForQuarter(fy.start_date, name);
      const payload = {
        financial_year: fyId,
        name,
        start_date,
        end_date,
      };

      if (editingQuarter) {
        await quarterService.updateQuarter(editingQuarter.id, payload);
        toast.success("Quarter updated.");
      } else {
        await quarterService.createQuarter(payload);
        toast.success("Quarter created.");
      }
      fetchQuarters(currentPage);
      setIsModalOpen(false);
    } catch {
      toast.error(editingQuarter ? "Failed to update quarter" : "Failed to create quarter");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getInitialData = () => {
    if (!editingQuarter) return undefined;
    return {
      financial_year: editingQuarter.financial_year?.toString() ?? "",
      name: editingQuarter.name,
    };
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Quarters"
        description="Tanzania FY quarters: Q1 Jul–Sep, Q2 Oct–Dec, Q3 Jan–Mar, Q4 Apr–Jun"
      />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={quarters}
              searchKey="name"
              onAdd={() => {
                setEditingQuarter(null);
                setIsModalOpen(true);
              }}
              onEdit={(q) => {
                setEditingQuarter(q);
                setIsModalOpen(true);
              }}
              onView={(q) => {
                setViewingQuarterId(q.id);
                setIsViewModalOpen(true);
              }}
              onActivate={handleActivate}
              onClose={handleClose}
              onDelete={confirmDelete}
              addButtonLabel="Add Quarter"
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
        title={editingQuarter ? "Edit Quarter" : "Add Quarter"}
        description="Dates are fixed to the Tanzania financial year: Q1 Jul–Sep, Q2 Oct–Dec, Q3 Jan–Mar, Q4 Apr–Jun."
        fields={formFields}
        initialData={getInitialData()}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
      <ViewQuarterModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        quarterId={viewingQuarterId}
      />
      <DeleteDialog
        isOpen={deleteDialog.open}
        onClose={closeDelete}
        onConfirm={async () => {
          if (!deleteDialog.item) return;
          setDeleting(true);
          try {
            await quarterService.deleteQuarter(deleteDialog.item.id);
            toast.success("Deleted.");
            closeDelete();
            fetchQuarters(currentPage);
          } catch (error) {
            toast.error(error instanceof Error ? error.message : "Failed to delete");
            closeDelete();
          } finally {
            setDeleting(false);
          }
        }}
        isDeleting={deleteDialog.isDeleting}
        entityType="Quarter"
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
