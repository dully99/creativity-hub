"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ReportingSummaryActivity,
  ReportingSummarySection,
  ReportingSummaryTask,
} from "@/lib/api/dodoso.service";
import { buildContinueAssessmentHref } from "@/lib/reporting-continue";
import { CheckCircle2, CircleDashed, FileEdit, FolderTree } from "lucide-react";

interface FocalSectionActivitiesProps {
  sections: ReportingSummarySection[];
  isLoading?: boolean;
  statusFilter?: "answered" | "drafts" | "unanswered" | null;
}

const STATUS_LABEL: Record<string, string> = {
  answered: "Answered",
  draft: "Draft",
  unanswered: "Unanswered",
};

function matchesStatusFilter(
  reportStatus: string | undefined,
  statusFilter: FocalSectionActivitiesProps["statusFilter"]
) {
  if (!statusFilter) return true;
  if (statusFilter === "drafts") return reportStatus === "draft";
  return reportStatus === statusFilter;
}

function formatCompletion(status?: string | null) {
  if (!status) return null;
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatTaskProgress(task: ReportingSummaryTask) {
  if (task.progress_percentage == null) return "—";
  if (task.data_type === "number") {
    const target = task.target_value != null ? ` / ${task.target_value}` : "";
    return `${task.progress_percentage}${target}`;
  }
  return `${task.progress_percentage}%`;
}

export function FocalSectionActivities({
  sections,
  isLoading,
  statusFilter = null,
}: FocalSectionActivitiesProps) {
  if (isLoading) {
    return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
  }

  const visibleSections = sections
    .map((section) => ({
      ...section,
      activities: (section.activities ?? []).filter((activity) =>
        matchesStatusFilter(activity.report_status, statusFilter)
      ),
    }))
    .filter((section) => !statusFilter || section.activities.length > 0);

  if (!sections.length) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No section activities found for your division in the active quarter.
        </CardContent>
      </Card>
    );
  }

  if (statusFilter && visibleSections.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          No {statusFilter} activities for the active quarter.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FolderTree className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold">Section activities</h2>
        <p className="text-xs text-muted-foreground">
          Activities under sections of your division, with task reporting status
        </p>
        {statusFilter ? (
          <Badge variant="secondary" className="capitalize">
            Showing {statusFilter}
          </Badge>
        ) : null}
      </div>

      <div className="space-y-3">
        {visibleSections.map((section) => (
          <Card key={section.section_id ?? "unassigned"}>
            <CardHeader className="space-y-2 border-b p-4 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-base font-semibold">
                  {section.section_name}
                </CardTitle>
                <Badge variant="secondary" className="tabular-nums">
                  {section.activities.length} activit
                  {section.activities.length === 1 ? "y" : "ies"}
                </Badge>
                {!statusFilter ? (
                  <Badge className="tabular-nums">{section.progress.percent}%</Badge>
                ) : null}
              </div>
              {!statusFilter ? (
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    {section.progress.answered} answered
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <FileEdit className="h-3 w-3 text-amber-600" />
                    {section.progress.drafts} draft
                    {section.progress.drafts === 1 ? "" : "s"}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CircleDashed className="h-3 w-3" />
                    {section.progress.unanswered} unanswered
                  </span>
                </div>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {section.activities.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No activities assigned to this section.
                </p>
              ) : (
                section.activities.map((activity) => (
                  <ActivityBlock key={activity.id} activity={activity} />
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ActivityBlock({ activity }: { activity: ReportingSummaryActivity }) {
  const status = activity.report_status ?? "unanswered";
  const tasks = activity.tasks ?? [];
  const canContinue = status === "draft" || status === "unanswered";

  return (
    <div className="rounded-md border bg-muted/20 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{activity.name}</p>
          <p className="truncate text-[11px] text-muted-foreground">
            {[activity.code, activity.target_name].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={status} />
          {activity.activity_progress_percentage != null && (
            <Badge variant="outline" className="tabular-nums">
              Activity {activity.activity_progress_percentage}%
            </Badge>
          )}
          {canContinue ? (
            <Button asChild size="sm" variant="outline" className="h-7 px-2 text-xs">
              <Link href={buildContinueAssessmentHref(activity)}>Continue</Link>
            </Button>
          ) : null}
        </div>
      </div>

      {tasks.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No tasks under this activity.</p>
      ) : (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left text-xs">
            <thead className="text-muted-foreground">
              <tr className="border-b">
                <th className="py-1.5 pr-2 font-medium">Task</th>
                <th className="py-1.5 pr-2 font-medium">Status</th>
                <th className="py-1.5 pr-2 font-medium">Progress</th>
                <th className="py-1.5 pr-2 font-medium">Completion</th>
                <th className="py-1.5 font-medium" />
              </tr>
            </thead>
            <tbody>
              {tasks.map((task) => {
                const taskNeedsWork = !task.answered;
                return (
                  <tr key={task.id} className="border-b border-border/60 last:border-0">
                    <td className="py-1.5 pr-2 align-top">
                      <p className="font-medium text-foreground">{task.name}</p>
                      {task.code ? (
                        <p className="font-mono text-[10px] text-muted-foreground">{task.code}</p>
                      ) : null}
                    </td>
                    <td className="py-1.5 pr-2 align-top">
                      {task.answered ? (
                        <span className="text-emerald-700">Answered</span>
                      ) : task.in_draft ? (
                        <span className="text-amber-700">In draft</span>
                      ) : (
                        <span className="text-muted-foreground">Not answered</span>
                      )}
                    </td>
                    <td className="py-1.5 pr-2 align-top tabular-nums">
                      {formatTaskProgress(task)}
                    </td>
                    <td className="py-1.5 pr-2 align-top">
                      {formatCompletion(task.completion_status) || "—"}
                    </td>
                    <td className="py-1.5 align-top text-right">
                      {canContinue && taskNeedsWork ? (
                        <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-xs">
                          <Link href={buildContinueAssessmentHref(activity, { taskId: task.id })}>
                            Continue
                          </Link>
                        </Button>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {activity.task_progress ? (
            <p className="mt-2 text-[11px] text-muted-foreground">
              Tasks: {activity.task_progress.answered} answered ·{" "}
              {activity.task_progress.drafts} draft ·{" "}
              {activity.task_progress.unanswered} unanswered ·{" "}
              {activity.task_progress.total} total
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "answered") {
    return <Badge className="bg-emerald-600 hover:bg-emerald-600">{STATUS_LABEL[status]}</Badge>;
  }
  if (status === "draft") {
    return <Badge variant="secondary">{STATUS_LABEL[status]}</Badge>;
  }
  return <Badge variant="outline">{STATUS_LABEL[status] ?? status}</Badge>;
}
