import { apiClient } from "./api-client";

export interface ExecutiveAnalyticsFilters {
  budget_type?: string | null;
  /** undefined = backend current default; null = explicitly all years */
  financial_year?: number | null;
  /** undefined = backend current default; null = explicitly all quarters */
  quarter?: number | null;
  division?: number | null;
  project?: number | null;
  /** Comma list: reported, not_reported */
  reporting?: string | null;
}

export interface ExecutiveKpis {
  total_main_activities: number;
  reported_main_activities: number;
  unreported_main_activities: number;
  overall_compliance_percent: number;
  overall_implementation_percent: number;
  implementation_on_reported_percent: number;
  submitted_reports: number;
  indicators?: number;
}

export interface CompletionStatusItem {
  status: string;
  label: string;
  count: number;
  percent: number;
}

export interface DivisionAnalyticsRow {
  division_id: number;
  division_code: string;
  /** Short name for chart Y-axis (e.g. DC, DISDCS, DISS). Falls back to code. */
  division_short_name?: string | null;
  division_name: string;
  total_activities: number;
  reported: number;
  unreported: number;
  compliance_percent: number;
  overall_implementation_percent: number;
  implementation_on_reported_percent: number;
  completion_mix: {
    fully_completed: number;
    partly_completed: number;
    not_started: number;
    cancelled: number;
  };
}

export interface ProjectAnalyticsRow {
  project_id: number;
  project_code?: string | null;
  project_name: string;
  reported: number;
  avg_progress_percent: number;
  by_status: {
    completed: number;
    in_progress: number;
    not_started: number;
    cancelled: number;
  };
}

export interface HierarchyItem {
  id: number;
  name: string;
  code?: string | null;
  reported: number;
  avg_progress_percent: number;
  quarters?: string[];
  responsible?: string | null;
  reporting_status?: "reported" | "not_reported" | string;
}

export interface TrendPoint {
  week: string | null;
  avg_progress_percent: number;
  submissions: number;
}

export interface TrackerActivitySeries {
  activity_id: number;
  activity_name: string;
  activity_code?: string | null;
  points: Array<{
    date: string;
    progress_percent: number;
    division_code?: string | null;
  }>;
  latest_progress_percent: number;
  has_issues: boolean;
}

export interface ExecutiveAnalytics {
  meta: {
    date_of_update: string;
    financial_year_id: number | null;
    financial_year_name: string | null;
    quarter_id: number | null;
    quarter_name: string | null;
    budget_type: string | null;
    budget_type_label: string;
    division_id: number | null;
    project_id: number | null;
    reporting?: string[];
  };
  kpis: ExecutiveKpis;
  completion_status: CompletionStatusItem[];
  by_division: DivisionAnalyticsRow[];
  by_project: ProjectAnalyticsRow[];
  by_quarter: Array<{
    quarter_id: number;
    quarter_name: string;
    submitted: number;
    avg_progress_percent: number;
  }>;
  hierarchy: {
    objectives: HierarchyItem[];
    targets: HierarchyItem[];
    activities: HierarchyItem[];
    tasks: HierarchyItem[];
    total_percent: number;
    column_totals?: {
      objectives: number;
      targets: number;
      activities: number;
      tasks: number;
    };
  };
  trend: {
    overall: TrendPoint[];
    reported: TrendPoint[];
    reported_plus_unreported: TrendPoint[];
    by_division: Array<{
      division_code: string;
      division_short_name?: string | null;
      division_name: string;
      points: Array<TrendPoint & { division_name?: string }>;
    }>;
  };
  tracker: {
    indicator_count: number;
    activities: TrackerActivitySeries[];
  };
  filter_options: {
    financial_years: Array<{ id: number; name: string; is_current: boolean }>;
    quarters: Array<{
      id: number;
      name: string;
      financial_year: number;
      is_current: boolean;
    }>;
    divisions: Array<{ id: number; code: string; name: string }>;
    projects: Array<{ id: number; code?: string | null; name: string }>;
    budget_types: Array<{ value: string; label: string }>;
  };
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
}

class ExecutiveAnalyticsService {
  async getAnalytics(filters: ExecutiveAnalyticsFilters = {}): Promise<ExecutiveAnalytics> {
    const params = new URLSearchParams();
    if (filters.budget_type) params.set("budget_type", filters.budget_type);
    if (filters.financial_year === null) params.set("financial_year", "all");
    else if (filters.financial_year) params.set("financial_year", String(filters.financial_year));
    if (filters.quarter === null) params.set("quarter", "all");
    else if (filters.quarter) params.set("quarter", String(filters.quarter));
    if (filters.division) params.set("division", String(filters.division));
    if (filters.project) params.set("project", String(filters.project));
    if (filters.reporting) params.set("reporting", filters.reporting);

    const query = params.toString();
    const endpoint = `/v1.0/dodoso/executive-analytics/${query ? `?${query}` : ""}`;
    const response = await apiClient.get<ApiEnvelope<ExecutiveAnalytics> | ExecutiveAnalytics>(
      endpoint
    );

    if (response && typeof response === "object" && "data" in response && response.data) {
      return response.data;
    }
    return response as ExecutiveAnalytics;
  }
}

export const executiveAnalyticsService = new ExecutiveAnalyticsService();
