import { DodosoReport, ReportingSummaryActivity } from "@/lib/api/dodoso.service";

/** Build /reporting deep-link that opens directly on the Tasks step. */
export function buildContinueAssessmentHref(
  activity: ReportingSummaryActivity,
  options?: { taskId?: number }
): string {
  const params = new URLSearchParams();
  params.set("step", "task");

  const activityId = activity.activity_id ?? activity.id;
  if (activityId) params.set("activityId", String(activityId));
  if (activity.report_id) params.set("reportId", String(activity.report_id));
  if (activity.budget_type) params.set("budgetType", activity.budget_type);
  if (activity.project_id) params.set("projectId", String(activity.project_id));
  if (activity.objective_id) params.set("objectiveId", String(activity.objective_id));
  if (activity.target_id) params.set("targetId", String(activity.target_id));
  if (activity.financial_year) params.set("financialYear", String(activity.financial_year));
  if (activity.name) params.set("activityName", activity.name);
  if (activity.objective_name) params.set("objectiveName", activity.objective_name);
  if (activity.target_name) params.set("targetName", activity.target_name);
  if (activity.project_name) params.set("projectName", activity.project_name);
  if (options?.taskId) params.set("taskId", String(options.taskId));

  return `/reporting?${params.toString()}`;
}

/** Open a submitted (or draft) report in the assessment wizard for editing. */
export function buildEditReportHref(report: DodosoReport): string {
  const params = new URLSearchParams();
  params.set("step", "task");
  if (report.id) params.set("reportId", String(report.id));
  if (report.activity) params.set("activityId", String(report.activity));
  if (report.budget_type) params.set("budgetType", report.budget_type);
  if (report.project) params.set("projectId", String(report.project));
  if (report.objective) params.set("objectiveId", String(report.objective));
  if (report.target) params.set("targetId", String(report.target));
  if (report.activity_name) params.set("activityName", report.activity_name);
  if (report.objective_name) params.set("objectiveName", report.objective_name);
  if (report.target_name) params.set("targetName", report.target_name);
  if (report.project_name) params.set("projectName", report.project_name);
  if (report.status === "submitted") params.set("editSubmitted", "1");
  return `/reporting?${params.toString()}`;
}
