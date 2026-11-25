import { apiClient } from "./api-client";
import { fetchAllPages } from "./fetch-all-pages";

export interface BudgetTypeOption {
  value: string;
  label: string;
  description?: string | null;
}

export interface UserContext {
  user_id: number;
  user_email: string;
  division_id: number | null;
  division_code: string | null;
  division_name: string | null;
  position_id: number | null;
  position_name: string | null;
}

export interface DodosoItem {
  id: number;
  name: string;
  code?: string;
  description?: string;
  data_type?: string;
  target_value?: number;
  status?: string;
  progress?: number;
  reporting_frequency?: string;
  financial_year?: number;
  implementation_quarters?: number[];
  implementation_quarters_names?: string[];
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  weekly_reporting_open_day_label?: string | null;
  weekly_reporting_close_day_label?: string | null;
  reporting_window_open?: boolean;
  /** Why closed: weekday | quarter | not_configured */
  reporting_window_closed_reason?:
    | "weekday"
    | "quarter"
    | "not_configured"
    | null;
  reporting_window_label?: string | null;
  reporting_window_open_date?: string | null;
  reporting_window_close_date?: string | null;
  reported_this_week?: boolean;
  previous_submission?: {
    completion_status?: string | null;
    progress_percentage?: number | null;
    submitted_at?: string | null;
    week_start?: string | null;
  } | null;
  /** Prior weekly answers (only when reporting_frequency is weekly). */
  weekly_answers?: Array<{
    week_start?: string | null;
    progress_percentage?: number;
    completion_status?: string | null;
    submitted_at?: string | null;
  }>;
  /** Sum of prior weekly answers (only when reporting_frequency is weekly). */
  previous_total?: number | null;
  /** True when this task was fully completed in an earlier FY quarter. */
  completed_in_prior_quarter?: boolean;
  /** Quarter name where the task was fully completed (e.g. Q1). */
  prior_completion_quarter_name?: string | null;
  allow_late_report?: boolean;
  /** Single FK project (backward-compat) */
  project?: number | null;
  project_name?: string | null;
  /** All linked projects (M2M) */
  project_names?: string[];
  project_ids?: number[];
  /** All linked objectives (M2M — on targets & activities) */
  objective?: number | null;
  objective_name?: string | null;
  objective_names?: string[];
  objective_ids?: number[];
  /** Division the item belongs to */
  division_name?: string | null;
}

export interface ActivityAssessmentData {
  activity_quarter: number | null;
  activity_completion_status: string;
  activity_progress_date?: string;
  activity_progress_percentage?: number;
  activity_achievement_description?: string;
  activity_challenges?: string;
  activity_remarks?: string;
}

export interface TaskAssessmentData {
  task: number;
  quarters?: number[];
  completion_status: string;
  progress_date?: string;
  /** This period's answer. For weekly tasks this is THIS week only (not the total). */
  progress_percentage?: number | null;
  achievement_description?: string;
  challenges?: string;
  remarks?: string;
}

export interface DodosoReport {
  id: number;
  budget_type: string;
  project?: number | null;
  objective: number;
  target?: number | null;
  activity?: number | null;
  activity_quarter?: number | null;
  activity_quarter_name?: string | null;
  activity_quarter_financial_year_name?: string | null;
  activity_completion_status?: string;
  activity_progress_date?: string;
  activity_progress_percentage?: number;
  activity_achievement_description?: string;
  activity_challenges?: string;
  activity_remarks?: string;
  status: string;
  submitted_at?: string | null;
  created_at?: string;
  updated_at?: string;
  division_name?: string;
  division_code?: string;
  objective_name?: string;
  objective_code?: string;
  target_name?: string;
  activity_name?: string;
  activity_code?: string;
  project_name?: string;
  project_code?: string;
  /** Task names on the report (API may return a list). */
  task_name?: string | string[];
  report_tasks?: Array<{
    id: number;
    task: number;
    task_name: string;
    task_code?: string;
    completion_status: string;
    progress_percentage: number;
    progress_date?: string | null;
    achievement_description?: string | null;
    challenges?: string | null;
    remarks?: string | null;
    quarter_names: string[];
  }>;
}

export interface DodosoReportRequest {
  budget_type: string;
  project?: number | null;
  objective: number;
  target?: number;
  activity?: number;
  activity_quarter?: number | null;
  activity_completion_status?: string;
  activity_progress_date?: string;
  activity_progress_percentage?: number;
  activity_achievement_description?: string;
  activity_challenges?: string;
  activity_remarks?: string;
  task_data?: TaskAssessmentData[];
}

export interface ReportingSummaryTask {
  id: number;
  name: string;
  code?: string | null;
  data_type?: string | null;
  target_value?: number | null;
  answered: boolean;
  in_draft: boolean;
  completion_status?: string | null;
  progress_percentage?: number | null;
  progress_date?: string | null;
}

export interface ReportingSummaryActivity {
  id: number;
  activity_id?: number;
  name: string;
  code?: string | null;
  target_id?: number | null;
  target_name?: string | null;
  objective_id?: number | null;
  objective_name?: string | null;
  project_id?: number | null;
  project_name?: string | null;
  budget_type?: string | null;
  financial_year?: number | null;
  report_id?: number | null;
  section_id?: number | null;
  section_name?: string | null;
  report_status?: "answered" | "draft" | "unanswered";
  activity_completion_status?: string | null;
  activity_progress_percentage?: number | null;
  tasks?: ReportingSummaryTask[];
  task_progress?: {
    answered: number;
    drafts: number;
    unanswered: number;
    total: number;
  };
}

export interface ReportingSummarySection {
  section_id: number | null;
  section_name: string;
  progress: {
    answered: number;
    unanswered: number;
    drafts: number;
    total: number;
    percent: number;
  };
  activities: ReportingSummaryActivity[];
}

export interface ReportingSummary {
  active_quarter: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_active: boolean;
    is_current: boolean;
    financial_year: number;
    financial_year_name?: string | null;
  } | null;
  has_sections?: boolean;
  sections?: ReportingSummarySection[];
  progress: {
    answered: number;
    unanswered: number;
    drafts: number;
    total: number;
    percent: number;
  };
  answered_activities: ReportingSummaryActivity[];
  unanswered_activities: ReportingSummaryActivity[];
  draft_activities: ReportingSummaryActivity[];
}

interface PaginatedResponse<T> {
  results: T[];
  count: number;
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

function unwrapList<T>(
  response: PaginatedResponse<T> | ApiEnvelope<T[]> | T[],
): T[] {
  if (Array.isArray(response)) return response;
  if (response && "results" in response && Array.isArray(response.results))
    return response.results;
  if (response && "data" in response && Array.isArray(response.data))
    return response.data;
  return [];
}

function unwrapData<T>(response: T | ApiEnvelope<T>): T {
  if (
    response &&
    typeof response === "object" &&
    "success" in response &&
    "data" in response
  ) {
    return (response as ApiEnvelope<T>).data as T;
  }
  return response as T;
}

class DodosoService {
  private endpoint = "/v1.0/dodoso";

  async getBudgetTypes(): Promise<BudgetTypeOption[]> {
    const response = await apiClient.get<ApiEnvelope<BudgetTypeOption[]>>(
      `${this.endpoint}/budget-types/`,
    );
    return unwrapData(response) ?? [];
  }

  async getUserContext(): Promise<UserContext> {
    const response = await apiClient.get<ApiEnvelope<UserContext>>(
      `${this.endpoint}/user-context/`,
    );
    return unwrapData(response);
  }

  async getReportingSummary(): Promise<ReportingSummary> {
    const response = await apiClient.get<ApiEnvelope<ReportingSummary>>(
      `${this.endpoint}/reporting-summary/`,
    );
    return unwrapData(response);
  }

  async getQuarters(params?: {
    financialYearId?: number;
    activeOnly?: boolean;
  }): Promise<
    {
      id: number;
      financial_year: number;
      financial_year_name?: string;
      name: string;
      start_date: string;
      end_date: string;
      is_active: boolean;
      is_current: boolean;
    }[]
  > {
    const query = new URLSearchParams();
    if (params?.financialYearId)
      query.set("financial_year", params.financialYearId.toString());
    if (params?.activeOnly) query.set("active_only", "true");
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await apiClient.get<
      PaginatedResponse<{
        id: number;
        financial_year: number;
        financial_year_name?: string;
        name: string;
        start_date: string;
        end_date: string;
        is_active: boolean;
        is_current: boolean;
      }>
    >(`${this.endpoint}/quarters/${suffix}`);
    return unwrapList(response);
  }

  async getProjects(divisionId: number, search = ""): Promise<DodosoItem[]> {
    const { results } = await fetchAllPages<DodosoItem>(`${this.endpoint}/projects/`, {
      division_id: String(divisionId),
      search: search.trim(),
    });
    return results;
  }

  async getObjectives(params: {
    divisionId: number;
    budgetType: string;
    projectId?: number;
    search?: string;
  }): Promise<DodosoItem[]> {
    const { results } = await fetchAllPages<DodosoItem>(`${this.endpoint}/objectives/`, {
      division_id: params.divisionId.toString(),
      budget_type: params.budgetType,
      project_id: params.projectId ? String(params.projectId) : "",
      search: params.search?.trim() ?? "",
    });
    return results;
  }

  async getTargets(
    objectiveId: number,
    divisionId?: number | null,
    search = "",
  ): Promise<DodosoItem[]> {
    const { results } = await fetchAllPages<DodosoItem>(`${this.endpoint}/targets/`, {
      objective_id: String(objectiveId),
      division_id: divisionId != null ? String(divisionId) : "",
      search: search.trim(),
    });
    return results;
  }

  async getActivities(
    targetId: number,
    divisionId?: number | null,
    search = "",
  ): Promise<DodosoItem[]> {
    const { results } = await fetchAllPages<DodosoItem>(`${this.endpoint}/activities/`, {
      target_id: String(targetId),
      division_id: divisionId != null ? String(divisionId) : "",
      search: search.trim(),
    });
    return results;
  }

  async getTasks(activityId: number, search = ""): Promise<DodosoItem[]> {
    const { results } = await fetchAllPages<DodosoItem>(`${this.endpoint}/tasks/`, {
      activity_id: String(activityId),
      search: search.trim(),
    });
    return results;
  }

  async getReport(id: number): Promise<DodosoReport> {
    const response = await apiClient.get<
      DodosoReport | ApiEnvelope<DodosoReport>
    >(`${this.endpoint}/reports/${id}/`);
    return unwrapData(response);
  }

  async createReport(data: DodosoReportRequest): Promise<DodosoReport> {
    return apiClient.post<DodosoReport>(`${this.endpoint}/reports/`, data);
  }

  async updateReport(
    id: number,
    data: Partial<DodosoReportRequest>,
  ): Promise<DodosoReport> {
    return apiClient.patch<DodosoReport>(
      `${this.endpoint}/reports/${id}/`,
      data,
    );
  }

  async submitReport(id: number): Promise<DodosoReport> {
    const response = await apiClient.post<ApiEnvelope<DodosoReport>>(
      `${this.endpoint}/reports/${id}/submit/`,
      {},
    );
    return unwrapData(response);
  }

  async getDrafts(): Promise<DodosoReport[]> {
    const response = await apiClient.get<ApiEnvelope<DodosoReport[]>>(
      `${this.endpoint}/reports/drafts/`,
    );
    return unwrapData(response) ?? [];
  }

  async getSubmittedReports(): Promise<DodosoReport[]> {
    const response = await apiClient.get<ApiEnvelope<DodosoReport[]>>(
      `${this.endpoint}/reports/submitted/`,
    );
    return unwrapData(response) ?? [];
  }
}

export const dodosoService = new DodosoService();
