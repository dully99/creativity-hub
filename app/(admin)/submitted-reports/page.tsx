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

export default function SubmittedReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<DodosoReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState<DodosoReport | null>(null);

  const columns = useMemo(() => getSubmittedReportsTanStackColumns(), []);

  const loadReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const submitted = await dodosoService.getSubmittedReports();
      const sorted = [...submitted].sort((a, b) => {
        const aTime = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
        const bTime = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
        return bTime - aTime;
      });
      setReports(sorted);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load submitted reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleEdit = (report: DodosoReport) => {
    if (!report.activity) {
      toast.error("This report has no activity and cannot be edited.");
      return;
    }
    router.push(buildEditReportHref(report));
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title="Submitted Reports"
        description="History of assessments you have submitted for your unit/division"
      />
      <Card>
        <CardContent className="pt-4">
          <TanStackDataTable
              columns={columns}
              data={reports}
              onView={setViewingReport}
              onEdit={handleEdit}
              editLabel="Continue"
              searchKey="activity_name"
              searchPlaceholder="Search submitted reports..."
            
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
