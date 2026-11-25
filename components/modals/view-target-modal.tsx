"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { targetService, Target } from "@/lib/api/target.service";
import { Loader2 } from "lucide-react";

interface ViewTargetModalProps {
  target: Target | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTargetModal({
  target,
  isOpen,
  onClose,
}: ViewTargetModalProps) {
  const [detail, setDetail] = useState<Target | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !target) {
      setDetail(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await targetService.getTarget(target.id);
        setDetail(data);
      } catch (err) {
        setError("Failed to load target details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, target?.id]);

  const data = detail || target;
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Target Details</DialogTitle>
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
                  {data.objective_names && data.objective_names.length > 1
                    ? "Objectives"
                    : "Objective"}
                </p>
                <p className="text-sm font-medium">
                  {data.objective_names && data.objective_names.length > 0
                    ? data.objective_names.join(", ")
                    : data.objective_name || data.objective}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">
                  Responsible Division/Unit
                </p>
                <p className="text-sm font-medium">
                  {data.division_name ||
                    data.responsible_division_name ||
                    data.responsible_division ||
                    "—"}
                </p>
              </div>
              {data.code ? (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">
                    Code
                  </p>
                  <p className="text-sm font-medium">{data.code}</p>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
