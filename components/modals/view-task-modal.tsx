"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/components/tables/columns/tasks-tanstack-columns";
import { taskService } from "@/lib/api/task.service";
import { Loader2 } from "lucide-react";

interface ViewTaskModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusVariant = (status: string) => {
  if (status === "completed") return "default";
  if (status === "in_progress") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
};

const WEEKDAY_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatStatus = (status: string) =>
  status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

function weekdayLabel(day?: number | null) {
  if (day == null || day < 0 || day > 6) return null;
  return WEEKDAY_LABELS[day];
}

export function ViewTaskModal({ task, isOpen, onClose }: ViewTaskModalProps) {
  const [detail, setDetail] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !task) {
      setDetail(null);
      setError(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await taskService.getTask(task.id);
        setDetail(data);
      } catch (err) {
        setError("Failed to load task details");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isOpen, task?.id]);

  const data = detail || task;
  if (!data) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
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
              {data.code && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase">Code</p>
                  <p className="text-sm font-medium">{data.code}</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Activity</p>
                <p className="text-sm font-medium">{data.activity_name || data.activity}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Status</p>
                <Badge variant={statusVariant(data.status)}>
                  {formatStatus(data.status)}
                </Badge>
              </div>
            </div>
            {data.description && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Description</p>
                <p className="text-sm">{data.description}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase">Reporting Frequency</p>
                <p className="text-sm font-medium capitalize">{data.reporting_frequency || "—"}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Set under Reporting Frequency admin
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase">Data Type</p>
                <p className="text-sm font-medium capitalize">{data.data_type || "—"}</p>
              </div>
            </div>
            {data.data_type === "number" ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Targeted Number</p>
                <p className="text-sm font-medium">{data.target_value ?? "—"}</p>
              </div>
            ) : null}
            {data.reporting_frequency === "weekly" ? (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Reporting Window</p>
                <p className="text-sm font-medium">
                  {weekdayLabel(data.weekly_reporting_open_day) || "—"}
                  {" → "}
                  {weekdayLabel(data.weekly_reporting_close_day) || "—"}
                </p>
              </div>
            ) : null}
            <div>
              <p className="text-xs text-muted-foreground uppercase">Implementation Quarters</p>
              <p className="text-sm font-medium">
                {data.implementation_quarters_names?.length
                  ? data.implementation_quarters_names.join(", ")
                  : data.implementation_quarters?.length
                    ? data.implementation_quarters
                        .map((q) => (typeof q === "number" ? String(q) : q.name || String(q.id)))
                        .join(", ")
                    : "—"}
              </p>
            </div>
            {data.progress !== undefined && data.progress !== null && (
              <div>
                <p className="text-xs text-muted-foreground uppercase">Progress</p>
                <p className="text-sm font-medium">{data.progress}%</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
