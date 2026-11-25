import { apiClient } from "./api-client";

export interface ReportingFrequencyConfig {
  id: number;
  name: string | null;
  applies_to_all: boolean;
  division_ids: number[];
  division_names: string[];
  scope_label: string;
  reporting_frequency: string;
  reporting_frequency_display?: string;
  weekly_reporting_open_day: number | null;
  weekly_reporting_close_day: number | null;
  weekly_reporting_open_day_label?: string | null;
  weekly_reporting_close_day_label?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReportingFrequencyConfigRequest {
  name?: string | null;
  applies_to_all: boolean;
  division_ids?: number[];
  reporting_frequency: string;
  weekly_reporting_open_day?: number | null;
  weekly_reporting_close_day?: number | null;
  is_active?: boolean;
}

export interface ReportingFrequencyConfigResponse {
  results: ReportingFrequencyConfig[];
  count: number;
  next?: string;
  previous?: string;
}

function extractConfigs(
  response:
    | ReportingFrequencyConfigResponse
    | ReportingFrequencyConfig[]
    | { data?: ReportingFrequencyConfigResponse | ReportingFrequencyConfig[] }
): ReportingFrequencyConfig[] {
  if (Array.isArray(response)) return response;
  if (response && typeof response === "object" && "results" in response && Array.isArray(response.results)) {
    return response.results;
  }
  if (response && typeof response === "object" && "data" in response && response.data) {
    return extractConfigs(response.data);
  }
  return [];
}

class ReportingFrequencyService {
  private endpoint = "/v1.0/planning/reporting-frequency-configs";

  async getConfigsPaginated(page = 1, search = ""): Promise<ReportingFrequencyConfigResponse> {
    const params = new URLSearchParams({ page: String(page) });
    if (search.trim()) params.set("search", search.trim());
    const response = await apiClient.get<
      ReportingFrequencyConfigResponse | ReportingFrequencyConfig[] | { data?: ReportingFrequencyConfigResponse }
    >(`${this.endpoint}/?${params.toString()}`);
    const results = extractConfigs(response);
    const count =
      response && typeof response === "object" && "count" in response && typeof response.count === "number"
        ? response.count
        : response &&
            typeof response === "object" &&
            "data" in response &&
            response.data &&
            typeof response.data === "object" &&
            "count" in response.data &&
            typeof response.data.count === "number"
          ? response.data.count
          : results.length;
    return { results, count };
  }

  async getConfigs(): Promise<ReportingFrequencyConfigResponse> {
    const response = await apiClient.get<ReportingFrequencyConfigResponse>(
      `${this.endpoint}/?page_size=100`
    );
    const results = extractConfigs(response);
    return {
      results,
      count: "count" in response && typeof response.count === "number" ? response.count : results.length,
      next: "next" in response ? response.next : undefined,
      previous: "previous" in response ? response.previous : undefined,
    };
  }

  async getConfig(id: number): Promise<ReportingFrequencyConfig> {
    return apiClient.get<ReportingFrequencyConfig>(`${this.endpoint}/${id}/`);
  }

  async createConfig(data: ReportingFrequencyConfigRequest): Promise<ReportingFrequencyConfig> {
    return apiClient.post<ReportingFrequencyConfig>(`${this.endpoint}/`, data);
  }

  async updateConfig(
    id: number,
    data: Partial<ReportingFrequencyConfigRequest>
  ): Promise<ReportingFrequencyConfig> {
    return apiClient.patch<ReportingFrequencyConfig>(`${this.endpoint}/${id}/`, data);
  }

  async deleteConfig(id: number): Promise<void> {
    await apiClient.delete<void>(`${this.endpoint}/${id}/`);
  }
}

export const reportingFrequencyService = new ReportingFrequencyService();
