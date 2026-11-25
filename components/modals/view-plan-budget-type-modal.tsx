"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { planBudgetTypeService, PlanBudgetType } from "@/lib/api/plan-budget-type.service";

interface ViewPlanBudgetTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planBudgetTypeId: number;
}

export function ViewPlanBudgetTypeModal({ isOpen, onClose, planBudgetTypeId }: ViewPlanBudgetTypeModalProps) {
  const [planBudgetType, setPlanBudgetType] = useState<PlanBudgetType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && planBudgetTypeId) {
      fetchPlanBudgetType();
    }
  }, [isOpen, planBudgetTypeId]);

  const fetchPlanBudgetType = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await planBudgetTypeService.getPlanBudgetType(planBudgetTypeId);
      setPlanBudgetType(data);
    } catch (err) {
      setError("Failed to load plan budget type details");
      console.error("Error fetching plan budget type:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Plan Budget Type Details</DialogTitle>
          <DialogDescription>View plan budget type information</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-destructive">{error}</div>
        ) : planBudgetType ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Type</label>
              <p className="text-base font-semibold">
                {planBudgetType.type.charAt(0).toUpperCase() + planBudgetType.type.slice(1)}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Description</label>
              <p className="text-base">{planBudgetType.description || "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-center py-8 text-muted-foreground">Plan budget type not found</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
