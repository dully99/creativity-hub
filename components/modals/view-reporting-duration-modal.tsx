"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Info } from "lucide-react";
import { reportingDurationService, ReportingDuration } from "@/lib/api/reporting-duration.service";
import { toast } from "sonner";

interface ViewReportingDurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportingDurationId: number;
}

export function ViewReportingDurationModal({
  isOpen,
  onClose,
  reportingDurationId,
}: ViewReportingDurationModalProps) {
  const [reportingDuration, setReportingDuration] = useState<ReportingDuration | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && reportingDurationId) {
      fetchReportingDurationDetails();
    }
  }, [isOpen, reportingDurationId]);

  const fetchReportingDurationDetails = async () => {
    try {
      setIsLoading(true);
      const data = await reportingDurationService.getReportingDuration(reportingDurationId);
      setReportingDuration(data);
    } catch (error) {
      toast.error("Failed to load reporting duration details");
      console.error("Error fetching reporting duration details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Reporting Duration Details
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reportingDuration ? (
          <div className="space-y-6 py-4">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Info className="h-5 w-5" />
                Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                  <p className="text-base font-medium">
                    {new Date(reportingDuration.start_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Date</label>
                  <p className="text-base font-medium">
                    {new Date(reportingDuration.end_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {reportingDuration.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-base">{reportingDuration.description}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">Status</label>
                <p className="text-base">
                  {reportingDuration.status === "ACTIVE" ? (
                    <span className="text-green-600 dark:text-green-400">Active</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">Inactive</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Reporting duration not found</p>
        )}

        {/* Actions */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
