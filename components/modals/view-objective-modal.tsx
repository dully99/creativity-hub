"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Objective } from "@/components/tables/columns/objectives-tanstack-columns";
import { objectiveService } from "@/lib/api/objective.service";
import { Loader2 } from "lucide-react";

interface ViewObjectiveModalProps {
  objective: Objective | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewObjectiveModal({
  objective,
  isOpen,
  onClose,
}: ViewObjectiveModalProps) {
  const [detail, setDetail] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !objective) {
      setDetail(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await objectiveService.getObjective(objective.id);
        setDetail(data);
      } catch (err) {
        setError("Failed to load objective details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, objective?.id]);

  const data = detail || objective;
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Objective Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-sm text-destructive py-4">{error}</p>
        ) : (
          <div className="space-y-3 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Name</p>
                <p className="text-sm font-medium">{data.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Status
                </p>
                <p className="text-sm font-medium">
                  {data.is_active ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Description
              </p>
              <p className="text-sm">{data.description || "—"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Plan Budget Type
                </p>
                <p className="text-sm font-medium">
                  {data.plan_budget_type_name || data.plan_budget_type}
                </p>
              </div>
              {data.project_names && data.project_names.length > 0 ? (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Projects
                  </p>
                  <p className="text-sm font-medium">
                    {data.project_names.join(", ")}
                  </p>
                </div>
              ) : data.project ? (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Project
                  </p>
                  <p className="text-sm font-medium">
                    {data.project_name || data.project}
                  </p>
                </div>
              ) : null}
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Reporting Period
                </p>
                <p className="text-sm font-medium">
                  {data.reporting_duration_name || data.reporting_duration}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Display Order
                </p>
                <p className="text-sm font-medium">
                  {data.display_order ?? "—"}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase">
                Responsible Divisions
              </p>
              <p className="text-sm font-medium">
                {data.responsible_divisions?.length
                  ? data.responsible_divisions.map((d) => d.name).join(", ")
                  : "—"}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
