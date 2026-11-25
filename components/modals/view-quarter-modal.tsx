"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { quarterService, Quarter } from "@/lib/api/quarter.service";

interface ViewQuarterModalProps {
  isOpen: boolean;
  onClose: () => void;
  quarterId: number;
}

export function ViewQuarterModal({ isOpen, onClose, quarterId }: ViewQuarterModalProps) {
  const [quarter, setQuarter] = useState<Quarter | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && quarterId) {
      fetchQuarter();
    }
  }, [isOpen, quarterId]);

  const fetchQuarter = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await quarterService.getQuarter(quarterId);
      setQuarter(data);
    } catch (err) {
      setError("Failed to load quarter details");
      console.error("Error fetching quarter:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Quarter Details</DialogTitle>
          <DialogDescription>View quarter information</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : quarter ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-base font-semibold">{quarter.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Financial Year</label>
                <p className="text-base">{quarter.financial_year}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                <p className="text-base">{new Date(quarter.start_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">End Date</label>
                <p className="text-base">{new Date(quarter.end_date).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Is Active</label>
                <p className="text-base">
                  {quarter.is_active ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Is Current</label>
                <p className="text-base">
                  {quarter.is_current ? (
                    <span className="text-green-600 dark:text-green-400">Yes</span>
                  ) : (
                    <span className="text-red-600 dark:text-red-400">No</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Quarter not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
