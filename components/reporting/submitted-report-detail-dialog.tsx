"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DodosoReport } from "@/lib/api/dodoso.service";
import { CheckCircle2, FileText } from "lucide-react";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatStatus(status?: string): string {
  if (!status) return "—";
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function budgetTypeLabel(budgetType?: string): string {
  if (!budgetType) return "—";
  return budgetType.charAt(0).toUpperCase() + budgetType.slice(1);
}

function statusBadgeVariant(status?: string): "default" | "secondary" | "outline" {
  if (status === "completed") return "default";
  if (status === "in_progress") return "secondary";
  return "outline";
}

interface SubmittedReportDetailDialogProps {
  report: DodosoReport | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SubmittedReportDetailDialog({
  report,
  open,
  onOpenChange,
}: SubmittedReportDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-[720px]">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <FileText className="h-4 w-4 text-primary" />
            Submitted Report Details
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Submitted {formatDate(report?.submitted_at)}
            {report?.id ? ` · Report #${report.id}` : ""}
          </DialogDescription>
        </DialogHeader>

        {report && (
          <div className="min-h-0 space-y-4 overflow-y-auto pr-1">
            <div className="flex flex-wrap gap-2">
              <Badge className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Submitted
              </Badge>
              <Badge variant="outline">{budgetTypeLabel(report.budget_type)}</Badge>
              {report.activity_quarter_name && (
                <Badge variant="secondary">{report.activity_quarter_name}</Badge>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <DetailItem
                label="Activity"
                value={report.activity_name}
                meta={report.activity_code}
              />
              <DetailItem label="Target" value={report.target_name} />
              <DetailItem
                label="Objective"
                value={report.objective_name}
                meta={report.objective_code}
              />
              <DetailItem
                label="Project"
                value={report.project_name || "—"}
                meta={report.project_code}
              />
              <DetailItem
                label="Quarter / Period"
                value={report.activity_quarter_name || "—"}
                meta={report.activity_quarter_financial_year_name || undefined}
              />
              <DetailItem
                label="Unit/Division"
                value={report.division_name}
                meta={report.division_code}
              />
              <DetailItem
                label="Activity Status"
                value={formatStatus(report.activity_completion_status)}
              />
              <DetailItem
                label="Activity Progress"
                value={`${Math.min(100, Math.max(0, report.activity_progress_percentage ?? 0))}%`}
                meta={report.activity_progress_date || undefined}
              />
            </div>

            {(report.activity_achievement_description ||
              report.activity_challenges ||
              report.activity_remarks) && (
              <div className="space-y-2 rounded-lg border p-3">
                <p className="text-sm font-medium">Activity Narrative</p>
                {report.activity_achievement_description && (
                  <NarrativeBlock
                    title="Achievement"
                    body={report.activity_achievement_description}
                  />
                )}
                {report.activity_challenges && (
                  <NarrativeBlock title="Challenges" body={report.activity_challenges} />
                )}
                {report.activity_remarks && (
                  <NarrativeBlock title="Remarks" body={report.activity_remarks} />
                )}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">Reported Tasks</p>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {report.report_tasks?.length ?? 0} task
                  {(report.report_tasks?.length ?? 0) === 1 ? "" : "s"}
                </span>
              </div>
              {!report.report_tasks?.length ? (
                <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                  No tasks were included in this report.
                </p>
              ) : (
                <div className="space-y-2">
                  {report.report_tasks.map((task) => (
                    <div key={task.id} className="rounded-lg border p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{task.task_name}</p>
                          {task.task_code && (
                            <p className="font-mono text-xs text-muted-foreground">
                              {task.task_code}
                            </p>
                          )}
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge variant={statusBadgeVariant(task.completion_status)}>
                            {formatStatus(task.completion_status)}
                          </Badge>
                          <span className="text-xs tabular-nums text-muted-foreground">
                            {Math.min(100, Math.max(0, task.progress_percentage ?? 0))}%
                          </span>
                        </div>
                      </div>
                      {!!task.quarter_names?.length && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {task.quarter_names.map((name) => (
                            <Badge key={name} variant="outline" className="text-[11px]">
                              {name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {(task.achievement_description || task.challenges || task.remarks) && (
                        <div className="mt-3 space-y-2 border-t pt-3">
                          {task.achievement_description && (
                            <NarrativeBlock
                              title="Achievement"
                              body={task.achievement_description}
                            />
                          )}
                          {task.challenges && (
                            <NarrativeBlock title="Challenges" body={task.challenges} />
                          )}
                          {task.remarks && (
                            <NarrativeBlock title="Remarks" body={task.remarks} />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({
  label,
  value,
  meta,
}: {
  label: string;
  value?: string | null;
  meta?: string | null;
}) {
  return (
    <div className="min-w-0 rounded-lg border bg-muted/20 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium leading-snug">{value || "—"}</p>
      {meta && <p className="mt-0.5 break-words text-xs text-muted-foreground">{meta}</p>}
    </div>
  );
}

function NarrativeBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{title}</p>
      <p className="mt-0.5 whitespace-pre-wrap break-words text-sm leading-relaxed">{body}</p>
    </div>
  );
}
