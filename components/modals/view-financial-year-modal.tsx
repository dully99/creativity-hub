"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { financialYearService, FinancialYear } from "@/lib/api/financial-year.service";

interface ViewFinancialYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  financialYearId: number;
}

export function ViewFinancialYearModal({
  isOpen,
  onClose,
  financialYearId,
}: ViewFinancialYearModalProps) {
  const [financialYear, setFinancialYear] = useState<FinancialYear | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && financialYearId) {
      fetchFinancialYear();
    }
  }, [isOpen, financialYearId]);

  const fetchFinancialYear = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await financialYearService.getFinancialYear(financialYearId);
      setFinancialYear(data);
    } catch (err) {
      setError("Failed to load financial year details");
      console.error("Error fetching financial year:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Financial Year Details</DialogTitle>
          <DialogDescription>View financial year information</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : financialYear ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-semibold">{financialYear.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reporting Frequency</label>
                <p className="text-base">
                  {financialYear.reporting_frequency.charAt(0).toUpperCase() + financialYear.reporting_frequency.slice(1)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-base">{new Date(financialYear.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-base">{new Date(financialYear.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Is Active</label>
                <p className="text-base">
                  {financialYear.is_active ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Is Current</label>
                <p className="text-base">
                  {financialYear.is_current ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <p className="text-base">
                {financialYear.status.charAt(0).toUpperCase() + financialYear.status.slice(1)}
              </p>
            </div>
            {financialYear.extension_date && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Extension Date</label>
                <p className="text-base">{new Date(financialYear.extension_date).toLocaleDateString()}</p>
              </div>
            )}
            {financialYear.extension_reason && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Extension Reason</label>
                <p className="text-base">{financialYear.extension_reason}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Financial year not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
