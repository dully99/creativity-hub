"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeading from "@/components/headers/page-heading";
import { SubmittedReportDetailDialog } from "@/components/reporting/submitted-report-detail-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getSubmittedReportsTanStackColumns } from "@/components/tables/columns/submitted-reports-tanstack-columns";
import { TanStackDataTable } from "@/components/tables/tanstack-data-table";
import { dodosoService, DodosoReport } from "@/lib/api/dodoso.service";
import { buildEditReportHref } from "@/lib/reporting-continue";
import { toast } from "sonner";

export default function DraftReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<DodosoReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<DodosoReport | null>(null);

  const columns = useMemo(
    () => getSubmittedReportsTanStackColumns({ variant: "draft" }),
    []
  );

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const drafts = await dodosoService.getDrafts();
      const sorted = [...drafts].sort((a, b) => {
        const aTime = a.updated_at
          ? new Date(a.updated_at).getTime()
          : a.created_at
            ? new Date(a.created_at).getTime()
            : 0;
        const bTime = b.updated_at
          ? new Date(b.updated_at).getTime()
          : b.created_at
            ? new Date(b.created_at).getTime()
            : 0;
        return bTime - aTime;
      });
      setReports(sorted);
      if (sorted.length === 0) {
        router.replace("/reporting");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load draft reports.");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleContinue = (report: DodosoReport) => {
    if (!report.activity) {
      toast.error("This draft has no activity and cannot be continued.");
      return;
    }
    router.push(buildEditReportHref(report));
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Draft Reports"
        description="Assessments you started but have not submitted yet"
      />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={reports}
              onView={setViewingReport}
              onEdit={handleContinue}
              editLabel="Continue"
              searchKey="activity_name"
              searchPlaceholder="Search draft reports..."
            
              isLoading={isLoading}
            />
        </CardContent>
      </Card>

      <SubmittedReportDetailDialog
        report={viewingReport}
        open={!!viewingReport}
        onOpenChange={(open) => {
          if (!open) setViewingReport(null);
        }}
      />
    </div>
  );
}
