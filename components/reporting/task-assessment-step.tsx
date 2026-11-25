"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { NumberInput } from "@/components/ui/number-input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DodosoItem, TaskAssessmentData } from "@/lib/api/dodoso.service";
import {
  completionStatusLabel,
  deriveCompletionStatus,
} from "@/lib/derive-completion-status";
import { cn } from "@/lib/utils";

const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  annual: "Annual",
};

function formatWeekLabel(isoDate?: string | null, index?: number): string {
  if (isoDate) {
    const date = new Date(`${isoDate}T00:00:00`);
    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
  }
  return `Week ${(index ?? 0) + 1}`;
}

function formatAnswer(
  value: number,
  dataType?: string | null,
  options?: { targetValue?: number | null; showTarget?: boolean }
): string {
  if (dataType === "number") {
    if (options?.showTarget && options.targetValue != null) {
      return `${value} / ${options.targetValue}`;
    }
    return String(value);
  }
  return `${value}%`;
}

interface TaskAssessmentStepProps {
  tasks: DodosoItem[];
  selectedTaskIds: number[];
  assessments: Record<number, TaskAssessmentData>;
  onToggleTask: (taskId: number) => void;
  onSetSelectedTaskIds: (taskIds: number[]) => void;
  onUpdateAssessment: (taskId: number, data: Partial<TaskAssessmentData>) => void;
  targetDataType?: string;
  isLoading?: boolean;
  /** Task IDs that remain selectable even if already reported this week (edit mode). */
  forceSelectableTaskIds?: number[];
}

export function TaskAssessmentStep({
  tasks,
  selectedTaskIds,
  assessments,
  onToggleTask,
  onSetSelectedTaskIds,
  onUpdateAssessment,
  targetDataType,
  isLoading,
  forceSelectableTaskIds = [],
}: TaskAssessmentStepProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const forceSet = new Set(forceSelectableTaskIds);

  const selectableTasks = tasks.filter((task) => {
    if (task.completed_in_prior_quarter) return false;
    if (forceSet.has(task.id)) return true;
    const isWeekly = task.reporting_frequency === "weekly";
    if (isWeekly && task.reporting_window_open === false) return false;
    if (isWeekly && task.reported_this_week === true) return false;
    return true;
  });
  const allSelectableSelected =
    selectableTasks.length > 0 &&
    selectableTasks.every((task) => selectedTaskIds.includes(task.id));

  const handleToggleAllSelectable = () => {
    onSetSelectedTaskIds(allSelectableSelected ? [] : selectableTasks.map((task) => task.id));
  };

  const applyProgressUpdate = (
    task: DodosoItem,
    dataType: string | null | undefined,
    progress: number | null,
    previousTotal: number,
    isWeekly: boolean
  ) => {
    const effective =
      progress == null ? 0 : isWeekly ? previousTotal + progress : progress;
    onUpdateAssessment(task.id, {
      progress_percentage: progress,
      completion_status: deriveCompletionStatus(
        effective,
        dataType,
        task.target_value
      ),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Select tasks and enter progress for each. Status is calculated from your input.
          </p>
        </div>
        {selectableTasks.length > 0 ? (
          <button
            type="button"
            onClick={handleToggleAllSelectable}
            className="text-sm font-medium text-primary hover:underline"
          >
            {allSelectableSelected ? "Clear selection" : `Select all available (${selectableTasks.length})`}
          </button>
        ) : null}
      </div>

      {selectedTaskIds.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          {selectedTaskIds.length} task{selectedTaskIds.length === 1 ? "" : "s"} selected
        </p>
      ) : null}

      {tasks.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No tasks found for this activity.
        </div>
      ) : (
        <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
          {tasks.map((task) => {
            const isSelected = selectedTaskIds.includes(task.id);
            const frequency = task.reporting_frequency ?? "monthly";
            const isWeekly = frequency === "weekly";
            const dataType = task.data_type ?? targetDataType;
            const windowOpen = !isWeekly || task.reporting_window_open !== false;
            const alreadyReported = isWeekly && task.reported_this_week === true && !forceSet.has(task.id);
            const priorCompleted = task.completed_in_prior_quarter === true;
            const canSelect =
              !priorCompleted &&
              ((windowOpen && !alreadyReported) || forceSet.has(task.id));
            const weeklyAnswers = isWeekly ? task.weekly_answers ?? [] : [];
            const previousTotal = isWeekly ? task.previous_total ?? 0 : 0;
            const assessment = assessments[task.id] ?? {
              task: task.id,
              completion_status: "not_started",
              progress_percentage: null,
            };
            const thisWeekValue = assessment.progress_percentage ?? 0;
            const runningTotal = previousTotal + thisWeekValue;
            const maxForThisWeek =
              dataType === "percentage" || !dataType
                ? Math.max(0, 100 - previousTotal)
                : task.target_value != null
                  ? Math.max(0, task.target_value - previousTotal)
                  : undefined;
            const progressInputValue =
              assessment.progress_percentage == null ? "" : assessment.progress_percentage;
            const derivedStatus = deriveCompletionStatus(
              isWeekly ? runningTotal : thisWeekValue,
              dataType,
              task.target_value
            );

            return (
              <div
                key={task.id}
                className={cn(
                  "rounded-lg border transition-colors",
                  !canSelect && "opacity-70",
                  isSelected ? "border-primary/40 bg-primary/5" : "border-border"
                )}
              >
                <label
                  className={cn(
                    "flex items-start gap-3 p-4",
                    canSelect ? "cursor-pointer" : "cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={!canSelect}
                    onCheckedChange={() => {
                      if (!canSelect) return;
                      onToggleTask(task.id);
                    }}
                    className="mt-0.5"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{task.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {FREQUENCY_LABELS[frequency] ?? frequency}
                      </Badge>
                      {isSelected && canSelect ? (
                        <Badge
                          variant={
                            derivedStatus === "completed"
                              ? "default"
                              : derivedStatus === "in_progress"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {completionStatusLabel(derivedStatus)}
                        </Badge>
                      ) : null}
                      {isWeekly && alreadyReported ? (
                        <Badge variant="secondary" className="text-xs">
                          Reported this week
                        </Badge>
                      ) : null}
                      {priorCompleted ? (
                        <Badge variant="secondary" className="text-xs">
                          {task.prior_completion_quarter_name
                            ? `Fully completed in ${task.prior_completion_quarter_name}`
                            : "Fully completed in a prior quarter"}
                        </Badge>
                      ) : null}
                      {isWeekly && !windowOpen ? (
                        <Badge variant="destructive" className="text-xs">
                          {task.reporting_window_closed_reason === "quarter"
                            ? "Not in current quarter"
                            : task.reporting_window_closed_reason === "not_configured"
                              ? "Days not configured"
                              : task.reporting_window_label
                                ? `Closed (${task.reporting_window_label})`
                                : "Window closed"}
                        </Badge>
                      ) : null}
                    </div>
                    {task.code && (
                      <p className="text-xs font-mono text-muted-foreground mt-0.5">{task.code}</p>
                    )}
                  </div>
                </label>

                {isSelected && canSelect && (
                  <div className="border-t px-4 pb-4 pt-3 space-y-4">
                    {isWeekly ? (
                      <div className="space-y-3">
                        <div className="rounded-md border px-3 py-2 space-y-1.5">
                          <p className="text-sm font-medium">
                            {weeklyAnswers.length <= 1 ? "Previous week" : "Previous weeks"}
                          </p>
                          {weeklyAnswers.length > 0 ? (
                            weeklyAnswers.map((week, index) => (
                              <div
                                key={`${week.week_start ?? index}-${week.submitted_at ?? index}`}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {formatWeekLabel(week.week_start, index)}
                                </span>
                                <span className="font-medium tabular-nums">
                                  {formatAnswer(week.progress_percentage ?? 0, dataType)}
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground">No previous week yet</p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`progress-${task.id}`}>
                            {dataType === "number"
                              ? task.target_value != null
                                ? `This week (target ${task.target_value})`
                                : "This week"
                              : "This week (out of 100%)"}
                          </Label>
                          <NumberInput
                            id={`progress-${task.id}`}
                            min={0}
                            max={maxForThisWeek}
                            value={progressInputValue}
                            placeholder=""
                            onChange={(e) => {
                              const rawText = e.target.value;
                              if (rawText === "") {
                                applyProgressUpdate(task, dataType, null, previousTotal, true);
                                return;
                              }
                              const raw = parseInt(rawText, 10);
                              if (Number.isNaN(raw)) return;
                              const clamped =
                                maxForThisWeek != null
                                  ? Math.min(Math.max(raw, 0), maxForThisWeek)
                                  : Math.max(raw, 0);
                              applyProgressUpdate(task, dataType, clamped, previousTotal, true);
                            }}
                            className="mt-1"
                          />
                        </div>

                        <div className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm">
                          <span className="font-medium">Total</span>
                          <span className="font-semibold tabular-nums">
                            {formatAnswer(runningTotal, dataType, {
                              targetValue: task.target_value,
                              showTarget: true,
                            })}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <Label htmlFor={`progress-${task.id}`}>
                          {dataType === "number"
                            ? task.target_value != null
                              ? `Actual number completed (target ${task.target_value})`
                              : "Actual number completed"
                            : "Completion (out of 100%)"}
                        </Label>
                        <NumberInput
                          id={`progress-${task.id}`}
                          min={0}
                          max={
                            dataType === "percentage"
                              ? 100
                              : task.target_value != null
                                ? task.target_value
                                : undefined
                          }
                          value={progressInputValue}
                          placeholder=""
                          onChange={(e) => {
                            const rawText = e.target.value;
                            if (rawText === "") {
                              applyProgressUpdate(task, dataType, null, 0, false);
                              return;
                            }
                            const raw = parseInt(rawText, 10);
                            if (Number.isNaN(raw)) return;
                            const max =
                              dataType === "percentage"
                                ? 100
                                : task.target_value != null
                                  ? task.target_value
                                  : undefined;
                            const clamped =
                              max != null ? Math.min(Math.max(raw, 0), max) : Math.max(raw, 0);
                            applyProgressUpdate(task, dataType, clamped, 0, false);
                          }}
                          className="mt-1"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor={`comment-${task.id}`}>Comment</Label>
                      <textarea
                        id={`comment-${task.id}`}
                        value={assessment.remarks ?? ""}
                        onChange={(e) =>
                          onUpdateAssessment(task.id, { remarks: e.target.value })
                        }
                        rows={3}
                        placeholder="Add a comment"
                        className="mt-1 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
